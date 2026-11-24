"""Analyze AdapterBenchmark exports and write a compact data file for the site report."""
import json, glob, os, sys, math, statistics as st, collections, datetime as dt

sys.stdout.reconfigure(encoding="utf-8")
SRC = sys.argv[1]
OUT = sys.argv[2]

SCEN = ["PlainText", "LongInput", "StructuredOutput", "SingleReadTool", "ToolChain", "MutationTool",
        "SkillSwitch", "ContextPressure", "MultiTurnSession", "Cancellation"]
ORDER = ["gemini-3.5-flash-lite", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]


def z(v):
    return 0.0 if v is None else float(v)


def pct(values, p):
    """Linear-interpolated percentile (same as numpy default)."""
    v = sorted(values)
    if not v:
        return None
    k = (len(v) - 1) * p
    f = math.floor(k)
    c = min(f + 1, len(v) - 1)
    return v[f] + (v[c] - v[f]) * (k - f)


def wilson(k, n, zc=1.96):
    if n == 0:
        return (None, None)
    p = k / n
    d = 1 + zc * zc / n
    c = (p + zc * zc / (2 * n)) / d
    h = zc * math.sqrt(p * (1 - p) / n + zc * zc / (4 * n * n)) / d
    return (max(0.0, c - h), min(1.0, c + h))


def cliff(a, b):
    """Cliff's delta: P(a > b) - P(a < b)."""
    if not a or not b:
        return None
    gt = sum(1 for x in a for y in b if x > y)
    lt = sum(1 for x in a for y in b if x < y)
    return (gt - lt) / (len(a) * len(b))


def magnitude(d):
    a = abs(d)
    return "negligible" if a < 0.147 else "small" if a < 0.33 else "medium" if a < 0.474 else "large"


models = []
for f in glob.glob(os.path.join(SRC, "*[0-9].json")):
    d = json.load(open(f, encoding="utf-8"))
    models.append(d)
models.sort(key=lambda d: ORDER.index(d["metadata"]["modelId"]))

session_start = min(dt.datetime.fromisoformat(d["metadata"]["sessionStartedAtUtc"][:26].rstrip("Z")) for d in models)

out = {"models": [], "scenarios": SCEN, "turns": [], "dispatches": [], "stats": {}, "notes": {}}
turn_keys = ["m", "s", "rep", "turn", "t0", "status", "code", "met", "client", "elapsed", "local", "network",
             "provider", "retry", "transport", "queue", "prep", "context", "checkpoint", "resume", "adapterOv",
             "mapping", "retries", "attempts", "reads", "muts", "inU", "outU", "estU", "histB", "histM",
             "pressure", "pruned", "elided", "saved", "sumAtt", "sumAcc", "outChars", "cancelToTerm", "preview", "paused", "active"]
out["turnKeys"] = turn_keys
disp_keys = ["m", "s", "rep", "turn", "kind", "task", "fail", "transient", "dur", "transport", "provider",
             "pqueue", "mapping", "resume", "retryMin", "inU", "outU", "finish"]
out["dispKeys"] = disp_keys

for mi, d in enumerate(models):
    meta = d["metadata"]
    exported = dt.datetime.fromisoformat(meta["exportedAtUtc"][:26].rstrip("Z"))
    recs = d["records"]
    first = min(dt.datetime.fromisoformat(r["startedAtUtc"][:26].rstrip("Z")) for r in recs)
    out["models"].append({
        "id": meta["modelId"], "adapter": meta["adapterId"], "delay": int(meta["delayMilliseconds"]),
        "repeats": int(meta["repeats"]), "inLimit": int(meta["catalogInputTokenLimit"]),
        "outLimit": int(meta["catalogOutputTokenLimit"]), "unity": meta["unityVersion"],
        "platform": meta["platform"], "firstUtc": first.isoformat() + "Z", "exportedUtc": meta["exportedAtUtc"],
        "wallMin": round((exported - first).total_seconds() / 60, 1), "records": len(recs),
    })
    for r in recs:
        m = r["metrics"]
        a = r["attributes"]
        client = z(m["clientElapsedMilliseconds"])
        transport = z(m["transportMilliseconds"])
        retry = z(m["retryWaitMilliseconds"])
        provider = z(m["dispatchProviderMilliseconds"])
        network = max(0.0, transport - provider)
        local = max(0.0, client - transport - retry)
        t0 = (dt.datetime.fromisoformat(r["startedAtUtc"][:26].rstrip("Z")) - session_start).total_seconds()
        row = [mi, SCEN.index(r["scenario"]), r["repeat"], r["turn"], round(t0, 2), r["status"], r["code"],
               1 if r["expectationMet"] else 0, round(client, 1), z(m["elapsedMilliseconds"]), round(local, 1),
               round(network, 1), round(provider, 1), retry, round(transport, 1), z(m["queueMilliseconds"]),
               z(m["preparationMilliseconds"]), z(m["contextMilliseconds"]), z(m["checkpointMilliseconds"]),
               z(m["resumeDelayMilliseconds"]), round(z(m["adapterOverheadMilliseconds"]), 2),
               round(z(m["dispatchMappingMilliseconds"]), 2), z(m["retries"]), z(m["ordinaryModelAttempts"]),
               z(m["readToolCalls"]), z(m["mutationToolCalls"]), z(m["inputUnits"]), z(m["outputUnits"]),
               z(m["estimatedRequestUnits"]), z(m["historyBytes"]), z(m["historyMessages"]),
               z(m["pressureTriggers"]), z(m["prunedExchanges"]), z(m["elidedPayloads"]),
               z(m["savedRequestUnits"]), z(m["summaryAttempts"]), z(m["acceptedSummaries"]),
               z(m["outputCharacters"]), m["cancelToTerminalMilliseconds"], (a.get("outputPreview") or "")[:140]]
        out["turns"].append(row)
        for x in r.get("dispatches") or []:
            xa, xm = x["attributes"], x["metrics"]
            out["dispatches"].append([
                mi, SCEN.index(r["scenario"]), r["repeat"], r["turn"], x["kind"], xa.get("taskStatus"),
                xa.get("failureKind"), xa.get("transient"), xm.get("durationMilliseconds"),
                xm.get("transportMilliseconds"), xm.get("providerMilliseconds"),
                xm.get("providerQueueMilliseconds"), xm.get("mappingMilliseconds"),
                xm.get("resumeDelayMilliseconds"), xm.get("retryMinimumMilliseconds"),
                xm.get("usage.inputUnits"), xm.get("usage.outputUnits"), xa.get("finishReason")])

K = {k: i for i, k in enumerate(turn_keys)}
DK = {k: i for i, k in enumerate(disp_keys)}
T = out["turns"]
D = out["dispatches"]

# ---------- Editor pauses ----------
# Unity was minimized a few times during the Gemini run (student's report, Nov 23). A minimized Editor runs its
# player loop at about 10 frames per second, so the hand-back between the run's terminal and the sample
# (client - elapsed, normally ~4 ms, one frame) jumps to ~100 ms. Turns with that signature ran while minimized:
# they are flagged and left out of every timing statistic (their pass/fail outcome is kept). Idle gaps between turns
# well beyond the adapter delay are pauses: they are removed from the "active" session clock and run times.
PAUSE_FRAME_MS = 50
for t in T:
    t.append(1 if t[K["client"]] - t[K["elapsed"]] >= PAUSE_FRAME_MS else 0)
order = sorted(range(len(T)), key=lambda i: T[i][K["t0"]])
paused_s = 0.0
model_pause = collections.defaultdict(float)
prev = None
for i in order:
    t = T[i]
    if prev is not None:
        delay = out["models"][t[K["m"]]]["delay"] / 1000
        gap = t[K["t0"]] - (prev[K["t0"]] + prev[K["client"]] / 1000)
        if prev[K["m"]] == t[K["m"]] and gap > delay + 4:
            paused_s += gap - delay
            model_pause[t[K["m"]]] += gap - delay
    t.append(round(t[K["t0"]] - paused_s, 2))
    prev = t
for mi, mm in enumerate(out["models"]):
    mm["pausedMin"] = round(model_pause[mi] / 60, 1)
    mm["activeMin"] = round(mm["wallMin"] - model_pause[mi] / 60, 1)
    mm["pausedTurns"] = sum(1 for t in T if t[K["m"]] == mi and t[K["paused"]])
P = lambda t: not t[K["paused"]]

# ---------- per model x scenario stats ----------
stats = {}
for mi in range(len(models)):
    ms = {}
    for si, s in enumerate(SCEN):
        rows = [t for t in T if t[K["m"]] == mi and t[K["s"]] == si]
        met = sum(t[K["met"]] for t in rows)
        lo, hi = wilson(met, len(rows))
        reps = collections.defaultdict(list)
        for t in rows:
            reps[t[K["rep"]]].append(t[K["met"]])
        rep_ok = sum(1 for v in reps.values() if all(v))
        tr = [t for t in rows if P(t)]
        c = [t[K["client"]] for t in tr]
        nr = [t[K["client"]] - t[K["retry"]] for t in tr]
        ms[s] = {
            "n": len(rows), "met": met, "lo": lo, "hi": hi, "reps": len(reps), "repsOk": rep_ok,
            "p50": pct(c, .5), "p90": pct(c, .9), "max": max(c), "min": min(c),
            "p50NoRetry": pct(nr, .5), "p90NoRetry": pct(nr, .9),
            "retries": sum(t[K["retries"]] for t in rows), "retryMs": sum(t[K["retry"]] for t in rows),
            "local": sum(t[K["local"]] for t in tr), "network": sum(t[K["network"]] for t in tr),
            "provider": sum(t[K["provider"]] for t in tr), "retryW": sum(t[K["retry"]] for t in tr),
            "clientSum": sum(c), "paused": len(rows) - len(tr),
            "statuses": dict(collections.Counter(f'{t[K["status"]]}' for t in rows)),
        }
    allr = [t for t in T if t[K["m"]] == mi]
    met = sum(t[K["met"]] for t in allr)
    lo, hi = wilson(met, len(allr))
    allt = [t for t in allr if P(t)]
    ms["_all"] = {"n": len(allr), "met": met, "lo": lo, "hi": hi, "paused": len(allr) - len(allt),
                  "retries": sum(t[K["retries"]] for t in allr),
                  "retryMs": sum(t[K["retry"]] for t in allr),
                  "clientSum": sum(t[K["client"]] for t in allt),
                  "local": sum(t[K["local"]] for t in allt), "network": sum(t[K["network"]] for t in allt),
                  "provider": sum(t[K["provider"]] for t in allt), "retryW": sum(t[K["retry"]] for t in allt),
                  "inU": sum(t[K["inU"]] for t in allr), "outU": sum(t[K["outU"]] for t in allr)}
    stats[mi] = ms
out["stats"] = stats

# ---------- Arandu overhead: completed single-dispatch turns without retries ----------
ov = {}
for mi in range(len(models)):
    rows = [t for t in T if t[K["m"]] == mi and t[K["status"]] == "Completed" and t[K["retries"]] == 0 and P(t)]
    loc = [t[K["local"]] for t in rows]
    share = [t[K["local"]] / t[K["client"]] for t in rows if t[K["client"]] > 0]
    core = [t[K["queue"]] + t[K["prep"]] + t[K["context"]] + t[K["checkpoint"]] for t in rows]
    res = [t[K["resume"]] for t in rows]
    adp = [t[K["adapterOv"]] for t in rows]
    mp = [t[K["mapping"]] for t in rows]
    ov[mi] = {"n": len(rows), "localP50": pct(loc, .5), "localP90": pct(loc, .9), "localMax": max(loc),
              "shareP50": pct(share, .5), "shareP90": pct(share, .9),
              "coreP50": pct(core, .5), "coreMax": max(core), "resumeP50": pct(res, .5), "resumeMax": max(res),
              "adapterP50": pct(adp, .5), "adapterMax": max(adp), "mappingP50": pct(mp, .5),
              "mappingMax": max(mp)}
out["overhead"] = ov

# ---------- dispatch-level provider stats ----------
prov = {}
for mi in range(len(models)):
    ok = [x for x in D if x[DK["m"]] == mi and x[DK["kind"]] == "modelDispatch" and x[DK["task"]] == "RanToCompletion"]
    tr = [x[DK["transport"]] for x in ok if x[DK["transport"]] is not None]
    pv = [x[DK["provider"]] for x in ok if x[DK["provider"]] is not None]
    gap = [x[DK["transport"]] - x[DK["provider"]] for x in ok if x[DK["provider"]] is not None and x[DK["transport"]] is not None]
    tps = [x[DK["outU"]] / (x[DK["provider"]] / 1000) for x in ok
           if x[DK["provider"]] and x[DK["outU"]] and x[DK["outU"]] >= 20]
    pq = [x[DK["pqueue"]] for x in ok if x[DK["pqueue"]] is not None]
    fails = [x for x in D if x[DK["m"]] == mi and x[DK["task"]] == "Faulted"]
    fk = collections.Counter(f'{x[DK["kind"]]}|{x[DK["fail"]]}|{x[DK["transient"]]}' for x in fails)
    wra = [x for x in fails if x[DK["retryMin"]] is not None]
    prov[mi] = {"okDispatches": len(ok), "transportP50": pct(tr, .5), "transportP90": pct(tr, .9),
                "providerP50": pct(pv, .5), "gapP50": pct(gap, .5), "gapP90": pct(gap, .9),
                "tpsP50": pct(tps, .5), "tpsN": len(tps), "pqueueP50": pct(pq, .5), "pqueueMax": max(pq) if pq else None,
                "faulted": len(fails), "faultKinds": dict(fk), "withRetryAfter": len(wra),
                "retryAfterP50": pct([x[DK["retryMin"]] for x in wra], .5),
                "retryAfterMax": max([x[DK["retryMin"]] for x in wra]) if wra else None,
                "failTransportP50": pct([x[DK["transport"]] for x in fails if x[DK["transport"]] is not None], .5)}
out["provider"] = prov

# ---------- Retry-After honored? run-level wait vs sum of Retry-After of its failed dispatches ----------
hon = []
for mi in range(len(models)):
    for t in T:
        if t[K["m"]] != mi or t[K["retries"]] == 0:
            continue
        ds = [x for x in D if x[DK["m"]] == mi and x[DK["s"]] == t[K["s"]] and x[DK["rep"]] == t[K["rep"]]
              and x[DK["turn"]] == t[K["turn"]] and x[DK["task"]] == "Faulted" and x[DK["kind"]] == "modelDispatch"]
        ra = sum(z(x[DK["retryMin"]]) for x in ds)
        hon.append([mi, t[K["s"]], t[K["retry"]], ra, t[K["inU"]], t[K["estU"]]])
out["retryAfter"] = hon  # [m, s, waited, retryAfterSum, inputUnits, estUnits]

# ---------- Cliff's delta on latency between models, per scenario (no-retry and raw) ----------
pairs = [(0, 1), (0, 2), (1, 2)]
cd = {}
for si, s in enumerate(SCEN):
    cd[s] = {}
    for a, b in pairs:
        A = [t[K["client"]] for t in T if t[K["m"]] == a and t[K["s"]] == si and t[K["status"]] == "Completed" and P(t)]
        B = [t[K["client"]] for t in T if t[K["m"]] == b and t[K["s"]] == si and t[K["status"]] == "Completed" and P(t)]
        An = [t[K["client"]] - t[K["retry"]] for t in T if t[K["m"]] == a and t[K["s"]] == si and t[K["status"]] == "Completed" and P(t)]
        Bn = [t[K["client"]] - t[K["retry"]] for t in T if t[K["m"]] == b and t[K["s"]] == si and t[K["status"]] == "Completed" and P(t)]
        d1, d2 = cliff(A, B), cliff(An, Bn)
        cd[s][f"{a}-{b}"] = {"raw": d1, "noRetry": d2, "nA": len(A), "nB": len(B),
                             "magRaw": magnitude(d1) if d1 is not None else None,
                             "magNoRetry": magnitude(d2) if d2 is not None else None}
out["cliff"] = cd

json.dump(out, open(OUT + ".json", "w", encoding="utf-8"), separators=(",", ":"))
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write("// Generated from the AdapterBenchmark exports of the Nov 24, 2026 (UTC) session. Do not edit by hand.\n")
    fh.write("window.BENCH = ")
    json.dump(out, fh, separators=(",", ":"))
    fh.write(";\n")

# ---------- console summary ----------
for mi, mm in enumerate(out["models"]):
    print("\n####", mm["id"], mm)
    a = stats[mi]["_all"]
    print(" all met", a["met"], "/", a["n"], "wilson", round(a["lo"], 3), round(a["hi"], 3), "retries", a["retries"],
          "retryMs", a["retryMs"], "clientSum", round(a["clientSum"]), "share retry", round(a["retryW"] / a["clientSum"], 3),
          "local", round(a["local"] / a["clientSum"], 3), "net", round(a["network"] / a["clientSum"], 3),
          "prov", round(a["provider"] / a["clientSum"], 3), "inU", a["inU"], "outU", a["outU"])
    for s in SCEN:
        x = stats[mi][s]
        print(f'  {s:17} {x["met"]}/{x["n"]} reps {x["repsOk"]}/{x["reps"]} p50 {x["p50"]:.0f} p90 {x["p90"]:.0f} '
              f'p50nr {x["p50NoRetry"]:.0f} retries {x["retries"]:.0f} retryMs {x["retryMs"]:.0f} {x["statuses"]}')
    print(" overhead", {k: (round(v, 3) if isinstance(v, float) else v) for k, v in ov[mi].items()})
    print(" provider", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in prov[mi].items()})
print("\nRetry-After honored (waited >= retryAfter):", sum(1 for h in hon if h[2] >= h[3]), "/", len(hon))
print("examples", hon[:5])
for s in SCEN:
    print(s, {k: (round(v["noRetry"], 2) if v["noRetry"] is not None else None, v["magNoRetry"]) for k, v in cd[s].items()})
