#!/usr/bin/env python
import hashlib
import json
import math
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np
from turbovec import IdMapIndex


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    sys.stdout.flush()


def fail(message, code="TURBOVEC_ERROR"):
    emit({"ok": False, "available": False, "code": code, "message": str(message)})
    sys.exit(0)


def root_dir(request):
    configured = request.get("index_dir") or os.environ.get("DGS_TURBOVEC_INDEX_DIR")
    path = Path(configured) if configured else Path.cwd() / "data" / "semantic"
    path.mkdir(parents=True, exist_ok=True)
    return path


def model_name(request):
    return request.get("model") or os.environ.get("DGS_SEMANTIC_EMBEDDING_MODEL") or "nomic-embed-text"


def ollama_url(request):
    base = request.get("ollama_url") or os.environ.get("DGS_SEMANTIC_OLLAMA_URL") or "http://127.0.0.1:11434"
    return base.rstrip("/")


def embed(texts, request):
    if not texts:
        return np.zeros((0, 0), dtype=np.float32)
    body = json.dumps({"model": model_name(request), "input": texts}).encode("utf-8")
    req = urllib.request.Request(
        f"{ollama_url(request)}/api/embed",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        fail(f"Local embedding service unavailable: {exc}", "EMBEDDING_UNAVAILABLE")
    embeddings = payload.get("embeddings")
    if not isinstance(embeddings, list) or len(embeddings) != len(texts):
        fail("Embedding service returned an unexpected response.", "EMBEDDING_INVALID_RESPONSE")
    arr = np.asarray(embeddings, dtype=np.float32)
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return arr / norms


def stable_id(key):
    return int.from_bytes(hashlib.blake2b(key.encode("utf-8"), digest_size=8).digest(), "big", signed=False)


def files(request):
    base = root_dir(request)
    return base / "dgs-content.tvim", base / "dgs-content.metadata.json"


def load_meta(meta_path):
    if not meta_path.exists():
        return {"version": 1, "documents": {}, "model": model_name({}), "dimension": None}
    return json.loads(meta_path.read_text(encoding="utf-8"))


def handle_status(request):
    index_path, meta_path = files(request)
    meta = load_meta(meta_path)
    emit({
        "ok": True,
        "available": index_path.exists() and meta_path.exists(),
        "engine": "TurboVec",
        "model": meta.get("model") or model_name(request),
        "documents": len(meta.get("documents", {})),
        "dimension": meta.get("dimension"),
        "indexPath": str(index_path),
        "metadataPath": str(meta_path),
    })


def handle_reindex(request):
    docs = request.get("documents") or []
    docs = [d for d in docs if d.get("key") and d.get("text")]
    if not docs:
        fail("No semantic documents supplied for indexing.", "EMPTY_CORPUS")
    vectors = embed([str(d["text"])[:24000] for d in docs], request)
    dim = int(vectors.shape[1])
    index = IdMapIndex(dim=dim, bit_width=int(request.get("bit_width") or 4))
    ids = np.asarray([stable_id(str(d["key"])) for d in docs], dtype=np.uint64)
    if len(set(int(x) for x in ids.tolist())) != len(ids):
        fail("Stable document id collision detected.", "ID_COLLISION")
    index.add_with_ids(vectors, ids)
    index_path, meta_path = files(request)
    index.write(str(index_path))
    documents = {}
    for doc, numeric_id in zip(docs, ids.tolist()):
        metadata = dict(doc)
        metadata.pop("text", None)
        metadata["numericId"] = str(int(numeric_id))
        documents[str(int(numeric_id))] = metadata
    meta = {
        "version": 1,
        "engine": "TurboVec",
        "model": model_name(request),
        "dimension": dim,
        "bitWidth": int(request.get("bit_width") or 4),
        "documents": documents,
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    emit({"ok": True, "available": True, "indexed": len(docs), "dimension": dim, "model": meta["model"]})


def handle_search(request):
    query = str(request.get("query") or "").strip()
    if not query:
        fail("Search query is required.", "QUERY_REQUIRED")
    index_path, meta_path = files(request)
    if not index_path.exists() or not meta_path.exists():
        fail("Semantic index has not been built yet.", "INDEX_MISSING")
    meta = load_meta(meta_path)
    query_vec = embed([query[:24000]], request)
    if int(query_vec.shape[1]) != int(meta.get("dimension") or 0):
        fail("Embedding dimension differs from the persisted index. Reindex required.", "DIMENSION_MISMATCH")
    index = IdMapIndex.load(str(index_path))
    k = max(1, min(int(request.get("k") or 10), len(meta.get("documents", {}))))
    scores, ids = index.search(query_vec, k=k)
    score_list = np.asarray(scores).reshape(-1).tolist()
    id_list = np.asarray(ids).reshape(-1).tolist()
    kinds = {str(x).lower() for x in (request.get("kinds") or []) if str(x).strip()}
    exclude_keys = {str(x) for x in (request.get("exclude_keys") or [])}
    min_score = float(request.get("min_score") or -1.0)
    results = []
    for score, numeric_id in zip(score_list, id_list):
        doc = meta.get("documents", {}).get(str(int(numeric_id)))
        if not doc:
            continue
        if doc.get("key") in exclude_keys:
            continue
        if kinds and str(doc.get("kind") or "").lower() not in kinds:
            continue
        score = float(score)
        if not math.isfinite(score) or score < min_score:
            continue
        item = dict(doc)
        item["score"] = round(score, 6)
        results.append(item)
    emit({
        "ok": True,
        "available": True,
        "engine": "TurboVec",
        "model": meta.get("model"),
        "results": results[: int(request.get("limit") or k)],
    })


def main():
    try:
        request = json.loads(sys.stdin.read() or "{}")
    except Exception as exc:
        fail(f"Invalid JSON request: {exc}", "INVALID_JSON")
    command = str(request.get("command") or "status").lower()
    try:
        if command == "status":
            handle_status(request)
        elif command == "reindex":
            handle_reindex(request)
        elif command == "search":
            handle_search(request)
        else:
            fail(f"Unknown command: {command}", "UNKNOWN_COMMAND")
    except Exception as exc:
        fail(exc)


if __name__ == "__main__":
    main()
