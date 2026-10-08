#!/usr/bin/env python3
"""Add an entry to the NoDAW Labs work log (https://nodaw-labs-hub.vercel.app/log/) and
prepare the additive Vercel redeploy.

The live hub is NOT Git-connected and differs from this repo's main branch, so a redeploy must
re-list every file that is already live. tools/hub-live-manifest.json records those files
(path -> sha1/size, as stored by Vercel).

What is deployed vs. served from GitHub:
  * /log/entries.json and /log/assets/* are NOT deployed files. vercel.json rewrites them to
    raw.githubusercontent.com/myaiplug/nodaw-labs-hub/main/log/..., so `add` (commit + push) puts
    a new entry live within ~5 minutes (GitHub raw cache) with no Vercel redeploy.
  * /log/index.html (the renderer) IS a deployed file. Only when it changes, run `payload` and
    make the one create_deployment call it prints (same for vercel.json): every other live file is referenced by sha,
    only changed files are inlined, so nothing already live is replaced.

Usage:
  add-log-entry.py add --title T --desc D [--date YYYY-MM-DD] [--time HH:MM] [--tag tool ...]
                       [--link "Label|URL[|kind]" ...] [--image file.png --alt "text" ...]
                       [--status live|draft] [--note N] [--no-check] [--no-push]
  add-log-entry.py payload                 # rewrite the create_deployment arguments file
  add-log-entry.py verify [--links]        # check the live page; record deployed log shas
  add-log-entry.py sync-manifest TREE.json # rebuild the manifest from list_deployment_files output

Link kinds: live (default), commit, post, product, asset. Tags: tool store content social code
hub assets site ops. Run `add`, wait ~5 min, then `verify`. Redeploy (payload) only if
log/index.html or vercel.json changed.
"""
import argparse, hashlib, json, os, re, subprocess, sys, time, urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

ET = ZoneInfo("America/New_York")
REPO = os.environ.get("HUB_REPO", "/workspace/nodaw-labs-hub/repo")
OUT = os.environ.get("LOG_DEPLOY_OUT", "/workspace/nodaw-labs-hub/deploy/log-deploy.json")
LIVE = "https://nodaw-labs-hub.vercel.app"
ENTRIES = os.path.join(REPO, "log", "entries.json")
MANIFEST = os.path.join(REPO, "tools", "hub-live-manifest.json")
# Files whose repo copy is what should be live (deployed from the repo). entries.json and
# log/assets/* are not here: vercel.json rewrites them to GitHub raw.
LOG_FILES = ["log/index.html", "vercel.json"]
TAGS = {"tool", "store", "content", "social", "code", "hub", "assets", "site", "ops"}
KINDS = {"live", "commit", "post", "product", "asset"}
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36"


def git(*a, check=True):
    return subprocess.run(["git", "-C", REPO, *a], check=check, capture_output=True, text=True).stdout.strip()


def sha1(path):
    return hashlib.sha1(open(path, "rb").read()).hexdigest()


def load():
    return json.load(open(ENTRIES))


def save(data):
    data["entries"].sort(key=lambda e: (e["date"], e.get("time", "")), reverse=True)
    data["updated"] = datetime.now(ET).strftime("%Y-%m-%dT%H:%M:%S%z")
    head = {k: v for k, v in data.items() if k != "entries"}
    lines = ["{"] + [f" {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}," for k, v in head.items()]
    lines.append(' "entries": [')
    lines.append(",\n".join("  " + json.dumps(e, ensure_ascii=False) for e in data["entries"]))
    lines += [" ]", "}"]
    open(ENTRIES, "w").write("\n".join(lines) + "\n")


def check_url(url, tries=4):
    """2xx/3xx is a pass. Retries cover Render cold starts and flaky hosts."""
    if url.startswith("/"):
        if url.startswith("/log/assets/"):
            return os.path.exists(os.path.join(REPO, url.lstrip("/"))), "local file"
        url = LIVE + url
    last = ""
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return 200 <= r.status < 400, str(r.status)
        except urllib.error.HTTPError as e:
            last = str(e.code)
            if e.code < 500 and e.code != 429:
                return False, last
        except Exception as e:  # timeout, DNS, reset
            last = type(e).__name__
        time.sleep(5 * (i + 1))
    return False, last


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:48]


def add_images(paths, alts, base):
    from PIL import Image
    out = []
    os.makedirs(os.path.join(REPO, "log", "assets"), exist_ok=True)
    for n, p in enumerate(paths, 1):
        im = Image.open(p).convert("RGB")
        name = f"{base}-{n:02d}"
        for suffix, w, q in (("", 1280, 82), ("-thumb", 560, 76)):
            x = im.copy()
            if x.width > w:
                x = x.resize((w, round(x.height * w / x.width)), Image.LANCZOS)
            x.save(os.path.join(REPO, "log", "assets", f"{name}{suffix}.webp"), "WEBP", quality=q, method=6)
        out.append({"src": f"/log/assets/{name}-thumb.webp", "full": f"/log/assets/{name}.webp",
                    "alt": alts[n - 1] if n <= len(alts) else ""})
    return out


def cmd_add(a):
    if git("status", "--porcelain"):
        sys.exit(f"{REPO} has uncommitted changes; commit or stash them first.")
    git("pull", "--rebase", "-q")
    now = datetime.now(ET)
    date = a.date or now.strftime("%Y-%m-%d")
    datetime.strptime(date, "%Y-%m-%d")
    for t in a.tag:
        if t not in TAGS:
            sys.exit(f"unknown tag {t!r}; use one of {sorted(TAGS)}")
    links = []
    for raw in a.link:
        parts = raw.split("|")
        if len(parts) < 2:
            sys.exit(f"--link needs 'Label|URL[|kind]': {raw!r}")
        kind = parts[2] if len(parts) > 2 else "live"
        if kind not in KINDS:
            sys.exit(f"unknown link kind {kind!r}")
        links.append({"label": parts[0], "url": parts[1], "kind": kind})
    if a.status == "draft" and links:
        print("note: draft entries are shown without links; links were dropped.")
        links = []
    entry = {"date": date, "time": a.time or (now.strftime("%H:%M") if not a.date else "12:00"),
             "title": a.title, "description": a.desc, "tags": a.tag or ["ops"], "status": a.status, "links": links}
    if a.image:
        entry["images"] = add_images(a.image, a.alt, f"{date}-{slug(a.title)}")
    if a.note:
        entry["note"] = a.note
    if not a.no_check:
        bad = []
        for l in links + [{"url": i["full"]} for i in entry.get("images", [])]:
            ok, why = check_url(l["url"])
            print(f"  {'ok ' if ok else 'BAD'} {why:>12}  {l['url']}")
            if not ok:
                bad.append(l["url"])
        if bad:
            sys.exit("Some links failed; fix them or pass --no-check.")
    data = load()
    data["entries"].append(entry)
    save(data)
    git("add", "log")
    git("commit", "-q", "-m", f"log: {a.title}")
    sha = git("rev-parse", "--short", "HEAD")
    if not a.no_push:
        git("pull", "--rebase", "-q")
        git("push", "-q", "origin", "HEAD:main")
        print(f"pushed {sha} to myaiplug/nodaw-labs-hub main; live at {LIVE}/log/ within ~5 min")
        print("Then run: add-log-entry.py verify   (no Vercel redeploy needed for entries)")


def cmd_payload(a):
    m = json.load(open(MANIFEST))
    files, inline = [], []
    for path, meta in sorted(m["files"].items()):
        if path in LOG_FILES:
            continue
        f = {"file": path, "sha": meta["sha"]}
        if meta.get("size"):
            f["size"] = meta["size"]
        files.append(f)
    for path in LOG_FILES:
        local = os.path.join(REPO, path)
        s = sha1(local)
        if m["files"].get(path, {}).get("sha") == s:
            files.append({"file": path, "sha": s, "size": os.path.getsize(local)})
        else:
            files.append({"file": path, "data": open(local, encoding="utf-8").read(), "encoding": "utf-8"})
            inline.append(path)
    args = {"teamId": m["teamId"], "requestBody": {"name": m["project"], "project": m["project"],
            "target": "production", "files": files}}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(args, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"\nDeploy arguments: {OUT}  ({len(files)} files; inline: {', '.join(inline) or 'none'})")
    print("Next: CallDynamicTool namespace=user-Vercel-xai toolName=create_deployment with that JSON as")
    print("arguments. Then: add-log-entry.py verify")


def cmd_verify(a):
    req = urllib.request.Request(LIVE + "/log/entries.json", headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    body = urllib.request.urlopen(req, timeout=60).read()
    live, local = hashlib.sha1(body).hexdigest(), sha1(ENTRIES)
    print(f"live entries.json {live}\nrepo entries.json {local}")
    ok_page, why = check_url(LIVE + "/log/")
    print(f"/log/ -> {why}")
    if live == local and ok_page:
        m = json.load(open(MANIFEST))
        for path in ["log/index.html"]:  # vercel.json isn't public; sync-manifest records it
            p = os.path.join(REPO, path)
            m["files"][path] = {"sha": sha1(p), "size": os.path.getsize(p)}
        m["recorded"] = datetime.now(ET).strftime("%Y-%m-%dT%H:%M:%S%z")
        json.dump(m, open(MANIFEST, "w"), indent=1)
        print("Live matches the repo; manifest updated (commit tools/hub-live-manifest.json).")
    else:
        print("Live does NOT match the repo yet (deploy not done, still building, or cached).")
    if a.links:
        data = load()
        bad = 0
        for e in data["entries"]:
            for l in e.get("links", []) + [{"url": i["full"]} for i in e.get("images", [])]:
                ok, why = check_url(l["url"])
                if not ok:
                    bad += 1
                    print(f"BAD {why} {l['url']}  ({e['date']} {e['title']})")
        print(f"link check done, {bad} bad")


def cmd_sync(a):
    """Rebuild the manifest from a saved list_deployment_files result (sizes are left out)."""
    tree = json.load(open(a.tree))
    tree = tree.get("result", tree)
    files = {}

    def walk(nodes, prefix):
        for n in nodes:
            p = f"{prefix}{n['name']}"
            if n["type"] == "directory":
                walk(n.get("children", []), p + "/")
            elif n["type"] == "file":
                files[p] = {"sha": n["uid"]}

    walk(tree, "")
    files = {k[4:] if k.startswith("src/") else k: v for k, v in files.items()}
    m = json.load(open(MANIFEST))
    old = m["files"]
    for k, v in files.items():
        if old.get(k, {}).get("sha") == v["sha"] and old[k].get("size"):
            v["size"] = old[k]["size"]
    m["files"] = files
    m["recorded"] = datetime.now(ET).strftime("%Y-%m-%dT%H:%M:%S%z")
    json.dump(m, open(MANIFEST, "w"), indent=1)
    print(f"manifest now lists {len(files)} live files")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("add")
    s.add_argument("--title", required=True)
    s.add_argument("--desc", required=True, help="one line, public-safe")
    s.add_argument("--date", help="YYYY-MM-DD in ET (default: today ET)")
    s.add_argument("--time", help="HH:MM ET, used only for ordering within a day")
    s.add_argument("--tag", action="append", default=[])
    s.add_argument("--link", action="append", default=[], help="'Label|URL[|kind]'")
    s.add_argument("--image", action="append", default=[], help="local image to compress into log/assets/")
    s.add_argument("--alt", action="append", default=[])
    s.add_argument("--status", choices=["live", "draft"], default="live")
    s.add_argument("--note")
    s.add_argument("--no-check", action="store_true")
    s.add_argument("--no-push", action="store_true")
    sub.add_parser("payload")
    v = sub.add_parser("verify")
    v.add_argument("--links", action="store_true", help="also check every link in the log")
    y = sub.add_parser("sync-manifest")
    y.add_argument("tree")
    a = p.parse_args()
    {"add": cmd_add, "payload": cmd_payload, "verify": cmd_verify, "sync-manifest": cmd_sync}[a.cmd](a)


if __name__ == "__main__":
    main()
