#!/usr/bin/env python3
"""
DGS TurboVec Semantic Intelligence Service (V8.12.2)
Persistent private HTTP daemon & CLI engine managing two separate logical indices:
1. dgs-content: Service pages, blogs, case studies, research, tools, portfolio.
2. off-page: Opportunities, backlinks, brand mentions, competitor gaps, outreach drafts.
"""
import os
import sys

# Critical thread limiting for environments with thread caps (CloudLinux / cPanel)
os.environ["RAYON_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"

import argparse
import hashlib
import json
import math
import re
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import urllib.error
import urllib.request

import numpy as np
from turbovec import IdMapIndex

# Configuration defaults
DEFAULT_PORT = 5178
DEFAULT_MODEL = "nomic-embed-text"
DEFAULT_DIM = 768
DEFAULT_BIT_WIDTH = 4

class TurboVecManager:
    """Manages separate logical TurboVec IdMapIndex instances and persistence."""
    def __init__(self, root_path=None, model=None, ollama_url=None, secret=None):
        configured = root_path or os.environ.get("DGS_TURBOVEC_ROOT") or os.environ.get("DGS_TURBOVEC_INDEX_DIR")
        if configured:
            self.root = Path(configured)
        elif os.path.exists("/home/u188101251/production-app/shared/turbovec"):
            self.root = Path("/home/u188101251/production-app/shared/turbovec")
        else:
            self.root = Path.cwd() / "data" / "turbovec"

        self.root.mkdir(parents=True, exist_ok=True)
        (self.root / "backups").mkdir(exist_ok=True)
        (self.root / "locks").mkdir(exist_ok=True)
        (self.root / "health").mkdir(exist_ok=True)

        self.model = model or os.environ.get("DGS_SEMANTIC_EMBEDDING_MODEL") or DEFAULT_MODEL
        self.ollama_url = (ollama_url or os.environ.get("DGS_SEMANTIC_OLLAMA_URL") or "http://127.0.0.1:11434").rstrip("/")
        self.secret = secret or os.environ.get("DGS_TURBOVEC_SECRET") or ""
        self.dim = DEFAULT_DIM
        self.bit_width = DEFAULT_BIT_WIDTH

        self.lock = threading.Lock()
        self.indexes = {}
        self.metadata = {}

        # Initialize both logical indices
        self._init_index("dgs-content")
        self._init_index("off-page")

    def _index_files(self, index_name):
        safe_name = index_name.replace("_", "-")
        return self.root / f"{safe_name}.tvim", self.root / f"{safe_name}.metadata.json"

    def _init_index(self, index_name):
        index_path, meta_path = self._index_files(index_name)
        if meta_path.exists():
            try:
                self.metadata[index_name] = json.loads(meta_path.read_text(encoding="utf-8"))
            except Exception as e:
                print(f"[WARN] Error reading {meta_path}: {e}", file=sys.stderr)
                self.metadata[index_name] = {"version": 1, "documents": {}, "model": self.model, "dimension": self.dim}
        else:
            self.metadata[index_name] = {"version": 1, "documents": {}, "model": self.model, "dimension": self.dim}

        if index_path.exists() and index_path.stat().st_size > 0:
            try:
                self.indexes[index_name] = IdMapIndex.load(str(index_path))
                print(f"[INFO] Loaded existing index '{index_name}' ({len(self.metadata[index_name].get('documents', {}))} docs)", file=sys.stderr)
            except Exception as e:
                print(f"[WARN] Failed loading index {index_path}: {e}. Creating fresh index.", file=sys.stderr)
                self.indexes[index_name] = IdMapIndex(dim=self.dim, bit_width=self.bit_width)
        else:
            self.indexes[index_name] = IdMapIndex(dim=self.dim, bit_width=self.bit_width)
            print(f"[INFO] Initialized fresh index '{index_name}' (dim={self.dim}, bit_width={self.bit_width})", file=sys.stderr)

    def embed(self, texts):
        if not texts:
            return np.zeros((0, self.dim), dtype=np.float32)
        body = json.dumps({"model": self.model, "input": texts}).encode("utf-8")
        req = urllib.request.Request(
            f"{self.ollama_url}/api/embed",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError as exc:
            # Fallback check for /api/embeddings endpoint (older Ollama schema)
            try:
                vectors = []
                for t in texts:
                    b = json.dumps({"model": self.model, "prompt": t}).encode("utf-8")
                    r = urllib.request.Request(f"{self.ollama_url}/api/embeddings", data=b, headers={"Content-Type": "application/json"}, method="POST")
                    with urllib.request.urlopen(r, timeout=60) as resp:
                        p = json.loads(resp.read().decode("utf-8"))
                        vectors.append(p["embedding"])
                payload = {"embeddings": vectors}
            except Exception:
                raise RuntimeError(f"Local embedding service unavailable: {exc}")

        embeddings = payload.get("embeddings")
        if not isinstance(embeddings, list) or len(embeddings) != len(texts):
            raise ValueError("Embedding service returned invalid response format.")

        arr = np.asarray(embeddings, dtype=np.float32)
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return arr / norms

    @staticmethod
    def stable_id(key):
        return int.from_bytes(hashlib.blake2b(str(key).encode("utf-8"), digest_size=8).digest(), "big", signed=False)

    def status(self):
        res = {
            "ok": True,
            "available": True,
            "engine": "TurboVec",
            "model": self.model,
            "dimension": self.dim,
            "bitWidth": self.bit_width,
            "rootDir": str(self.root),
            "indexes": {},
        }
        for name in ["dgs-content", "off-page"]:
            idx_file, meta_file = self._index_files(name)
            meta = self.metadata.get(name, {})
            docs = meta.get("documents", {})
            res["indexes"][name] = {
                "exists": idx_file.exists(),
                "fileSize": idx_file.stat().st_size if idx_file.exists() else 0,
                "documentCount": len(docs),
                "model": meta.get("model", self.model),
                "dimension": meta.get("dimension", self.dim),
            }
        return res

    def _lexical_search(self, index_name, query, k=10, limit=10, kinds=None, exclude_keys=None, min_score=-1.0, allowlist=None):
        safe_name = index_name.replace("_", "-")
        meta = self.metadata.get(safe_name, {})
        docs = meta.get("documents", {})
        if not docs:
            return {"ok": True, "available": True, "results": [], "total": 0, "fallback": True}

        raw_query = str(query or "").lower().strip()
        query_terms = [t for t in re.findall(r"\w+", raw_query) if len(t) >= 2]
        if not query_terms:
            query_terms = [raw_query] if raw_query else []

        scored = []
        kinds_set = {str(x).lower() for x in (kinds or []) if str(x).strip()}
        exclude_set = {str(x) for x in (exclude_keys or [])}
        allow_set = {str(int(x)) for x in (allowlist or [])} if allowlist else None

        for doc_id, doc in docs.items():
            if allow_set is not None and str(doc_id) not in allow_set:
                continue
            if doc.get("key") in exclude_set or str(doc_id) in exclude_set:
                continue
            if kinds_set and str(doc.get("kind") or doc.get("entity_type") or "").lower() not in kinds_set:
                continue

            text_corpus = f"{doc.get('title', '')} {doc.get('site_name', '')} {doc.get('domain', '')} {doc.get('path', '')} {doc.get('category', '')} {doc.get('region', '')} {doc.get('country', '')} {doc.get('description', '')} {doc.get('summary', '')} {doc.get('text', '')}".lower()
            if not query_terms:
                matches = 0
            else:
                matches = sum(1 for term in query_terms if term in text_corpus)

            if matches > 0:
                ratio = matches / max(1, len(query_terms))
                base_score = 0.65 + min(0.28, ratio * 0.28)
                title_lower = f"{doc.get('title', '')} {doc.get('site_name', '')}".lower()
                path_lower = f"{doc.get('path', '')} {doc.get('domain', '')}".lower()
                if any(t in title_lower or t in path_lower for t in query_terms):
                    base_score = min(0.96, base_score + 0.05)
                if base_score >= min_score:
                    item = dict(doc)
                    item["score"] = round(base_score, 4)
                    scored.append(item)

        scored.sort(key=lambda x: x["score"], reverse=True)
        return {
            "ok": True,
            "available": True,
            "engine": "TurboVec",
            "model": f"{self.model} (lexical-fallback)",
            "results": scored[:limit],
            "total": len(scored),
            "fallback": True,
        }

    def search(self, index_name, query, k=10, limit=10, kinds=None, exclude_keys=None, min_score=-1.0, allowlist=None):
        safe_name = index_name.replace("_", "-")
        if safe_name not in self.indexes:
            raise ValueError(f"Unknown index '{index_name}'")

        index = self.indexes[safe_name]
        meta = self.metadata.get(safe_name, {})
        docs = meta.get("documents", {})
        if not docs:
            return {"ok": True, "available": True, "results": [], "total": 0}

        try:
            query_vec = self.embed([str(query)[:24000]])
        except Exception as exc:
            print(f"[TURBOVEC] Embedding runtime unavailable ({exc}). Using lexical fallback.", file=sys.stderr)
            return self._lexical_search(safe_name, query, k=k, limit=limit, kinds=kinds, exclude_keys=exclude_keys, min_score=min_score, allowlist=allowlist)

        effective_k = max(1, min(k, len(docs)))

        # Allowlist preparation if specified
        allow_arr = None
        if allowlist and len(allowlist) > 0:
            valid_ids = [np.uint64(x) for x in allowlist if index.contains(int(x))]
            if valid_ids:
                allow_arr = np.array(valid_ids, dtype=np.uint64)
                effective_k = min(effective_k, len(valid_ids))

        try:
            if allow_arr is not None and len(allow_arr) > 0:
                scores, ids = index.search(query_vec, k=effective_k, allowlist=allow_arr)
            else:
                scores, ids = index.search(query_vec, k=effective_k)
        except Exception as e:
            # Fallback to search without allowlist if allowlist causes issue
            scores, ids = index.search(query_vec, k=effective_k)

        score_list = np.asarray(scores).reshape(-1).tolist()
        id_list = np.asarray(ids).reshape(-1).tolist()

        kinds_set = {str(x).lower() for x in (kinds or []) if str(x).strip()}
        exclude_set = {str(x) for x in (exclude_keys or [])}
        results = []

        for score, numeric_id in zip(score_list, id_list):
            doc = docs.get(str(int(numeric_id)))
            if not doc:
                continue
            if doc.get("key") in exclude_set or str(numeric_id) in exclude_set:
                continue
            if kinds_set and str(doc.get("kind") or doc.get("entity_type") or "").lower() not in kinds_set:
                continue
            score_val = float(score)
            if not math.isfinite(score_val) or score_val < min_score:
                continue
            item = dict(doc)
            item["score"] = round(score_val, 6)
            results.append(item)

        return {
            "ok": True,
            "available": True,
            "engine": "TurboVec",
            "model": self.model,
            "results": results[:limit],
            "total": len(results),
        }

    def index_batch(self, index_name, documents):
        safe_name = index_name.replace("_", "-")
        if safe_name not in self.indexes:
            self._init_index(safe_name)

        docs = [d for d in documents if (d.get("key") or d.get("id") or d.get("numeric_id")) and d.get("text")]
        if not docs:
            return {"ok": True, "indexed": 0, "message": "No valid documents to index"}

        with self.lock:
            vectors = self.embed([str(d["text"])[:24000] for d in docs])
            index = self.indexes[safe_name]
            meta = self.metadata[safe_name]
            meta_docs = meta.setdefault("documents", {})

            numeric_ids = []
            for d in docs:
                if d.get("numeric_id") is not None:
                    nid = int(d["numeric_id"])
                else:
                    nid = self.stable_id(d.get("key") or d.get("id"))
                numeric_ids.append(np.uint64(nid))

            ids_arr = np.array(numeric_ids, dtype=np.uint64)
            # Remove any existing versions before adding to prevent duplicates
            for nid in numeric_ids:
                if index.contains(int(nid)):
                    index.remove(int(nid))

            index.add_with_ids(vectors, ids_arr)
            index_path, meta_path = self._index_files(safe_name)
            index.sync(str(index_path))

            items = []
            for doc, nid in zip(docs, numeric_ids):
                metadata = dict(doc)
                metadata.pop("text", None)
                metadata["numeric_id"] = str(int(nid))
                meta_docs[str(int(nid))] = metadata
                items.append({"key": doc.get("key") or doc.get("id"), "vector_id": str(int(nid))})

            meta["model"] = self.model
            meta["dimension"] = self.dim
            meta["bitWidth"] = self.bit_width
            meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

        return {"ok": True, "indexed": len(docs), "total": len(meta_docs), "items": items}

    def remove(self, index_name, ids):
        safe_name = index_name.replace("_", "-")
        if safe_name not in self.indexes:
            return {"ok": True, "removed": 0}

        removed_count = 0
        with self.lock:
            index = self.indexes[safe_name]
            meta = self.metadata[safe_name]
            meta_docs = meta.setdefault("documents", {})

            for raw_id in ids:
                nid = int(raw_id)
                if index.contains(nid):
                    index.remove(nid)
                    removed_count += 1
                meta_docs.pop(str(nid), None)

            index_path, meta_path = self._index_files(safe_name)
            index.sync(str(index_path))
            meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

        return {"ok": True, "removed": removed_count, "remaining": len(meta_docs)}

    def deduplicate(self, text, domain=None, url=None, threshold_possible=0.78, threshold_likely=0.88):
        """Checks candidate text against off-page index for semantic duplicates."""
        # 1. Exact domain match check against metadata
        if domain or url:
            meta = self.metadata.get("off-page", {})
            docs = meta.get("documents", {})
            clean_dom = (domain or "").lower().replace("https://", "").replace("http://", "").split("/")[0].strip()
            for doc_id, doc in docs.items():
                doc_dom = str(doc.get("domain") or "").lower().replace("https://", "").replace("http://", "").split("/")[0].strip()
                if clean_dom and doc_dom == clean_dom:
                    return {
                        "ok": True,
                        "status": "LIKELY_DUPLICATE",
                        "similarity": 0.98,
                        "nearest": [doc],
                        "reason": f"Exact domain match with existing opportunity '{doc.get('title') or clean_dom}'.",
                        "recommended_action": "REJECT_EXACT_DOMAIN_EXISTS",
                    }

        res = self.search("off-page", query=text, k=10, limit=5)
        results = res.get("results", [])
        if not results:
            return {
                "ok": True,
                "status": "UNIQUE",
                "similarity": 0.0,
                "nearest": [],
                "reason": "No semantically similar opportunities exist in index.",
                "recommended_action": "ALLOW_INSERTION",
            }

        top = results[0]
        top_score = top.get("score", 0.0)

        if top_score >= threshold_likely:
            status = "LIKELY_DUPLICATE"
            action = "REVIEW_REQUIRED_HIGH_SIMILARITY"
            reason = f"High semantic similarity ({round(top_score * 100, 1)}%) with existing opportunity '{top.get('title') or top.get('site_name')}'."
        elif top_score >= threshold_possible:
            status = "POSSIBLE_DUPLICATE"
            action = "FLAG_FOR_REVIEW"
            reason = f"Moderate semantic overlap ({round(top_score * 100, 1)}%) with existing record '{top.get('title') or top.get('site_name')}'."
        else:
            status = "UNIQUE"
            action = "ALLOW_INSERTION"
            reason = f"Top semantic similarity is low ({round(top_score * 100, 1)}%). Content is distinctive."

        return {
            "ok": True,
            "status": status,
            "similarity": top_score,
            "nearest": results,
            "reason": reason,
            "recommended_action": action,
        }

    def match_target_pages(self, query, region=None, limit=5):
        """Matches opportunity intent against DGS Content Index to find optimal target DGS service pages."""
        res = self.search("dgs-content", query=query, k=15, limit=10, kinds=["service", "page", "location"])
        pages = []
        raw_results = res.get("results", [])

        # Priority mappings for common intents
        region_clean = (region or "GLOBAL").upper()
        for item in raw_results:
            path = item.get("path") or ""
            score = item.get("score", 0.0)
            kind = item.get("kind") or ""

            # Check region affinity
            is_uae_page = "dubai" in path.lower() or "uae" in path.lower()
            is_india_page = "mumbai" in path.lower() or "india" in path.lower()

            region_match = False
            if region_clean == "UAE" and is_uae_page:
                region_match = True
            elif region_clean == "INDIA" and is_india_page:
                region_match = True
            elif region_clean in ["USA", "GLOBAL"] and not is_uae_page and not is_india_page:
                region_match = True

            # Derive explanation
            if "ai-video" in path or "ai-production" in path:
                service_match = "AI Video Production"
            elif "seo" in path:
                service_match = "SEO Services"
            elif "aeo" in path:
                service_match = "Answer Engine Optimization (AEO)"
            elif "geo" in path:
                service_match = "Generative Engine Optimization (GEO)"
            elif "llm" in path:
                service_match = "LLM SEO & AI Search"
            elif "performance-marketing" in path:
                service_match = "Performance Marketing"
            else:
                service_match = "Corporate Overview"

            reason = f"Semantic relevance {round(score * 100, 1)}% to '{service_match}'"
            if region_match:
                reason += f" with {region_clean} geographic alignment."

            pages.append({
                "page": path,
                "title": item.get("title") or path,
                "semantic_relevance": score,
                "region_match": region_match,
                "service_match": service_match,
                "reason": reason,
            })

        # Sort by score with slight boost for matching region
        pages.sort(key=lambda x: x["semantic_relevance"] + (0.04 if x["region_match"] else 0.0), reverse=True)
        return {"ok": True, "target_pages": pages[:limit]}

    def match_assets(self, query, limit=4):
        """Retrieves best supporting DGS assets (case studies, blogs, research, portfolio)."""
        res = self.search("dgs-content", query=query, k=15, limit=limit, kinds=["blog", "case_study", "portfolio", "research"])
        assets = []
        for item in res.get("results", []):
            assets.append({
                "title": item.get("title") or item.get("path"),
                "url": f"https://www.dgeniussolutions.com{item.get('path')}",
                "entity_type": (item.get("kind") or "RESOURCE").upper(),
                "semantic_relevance": item.get("score", 0.0),
                "why_matches": f"Direct topical alignment with '{item.get('title')}' ({round(item.get('score', 0.0) * 100, 1)}% match).",
            })
        return {"ok": True, "assets": assets}

    def ground_draft(self, opportunity_text, publication_name, target_page=None):
        """Retrieves factual DGS proof points and asset citations to ground an outreach draft."""
        assets_res = self.match_assets(opportunity_text, limit=3)
        pages_res = self.match_target_pages(opportunity_text, limit=1)

        sources = []
        for a in assets_res.get("assets", []):
            sources.append({
                "title": a["title"],
                "url": a["url"],
                "entity_type": a["entity_type"],
            })

        top_page = (pages_res.get("target_pages", []) or [{}])[0]
        if top_page.get("page"):
            sources.append({
                "title": top_page.get("title"),
                "url": f"https://www.dgeniussolutions.com{top_page.get('page')}",
                "entity_type": "SERVICE_PAGE",
            })

        talking_points = [
            f"D'Genius Solutions offers technical expertise in {top_page.get('service_match', 'digital marketing and creative media')}.",
            "All agency campaigns leverage ethical, data-backed frameworks with transparent client delivery.",
            f"Case study and editorial reference: {sources[0]['title']} ({sources[0]['url']})" if sources else "Published frameworks available on dgeniussolutions.com.",
        ]

        return {
            "ok": True,
            "sources_used": sources,
            "talking_points": talking_points,
            "recommended_target_page": top_page.get("page") or "/services/seo-services-in-mumbai/",
        }


def make_handler(manager):
    class TurboVecRequestHandler(BaseHTTPRequestHandler):
        def address_string(self):
            if isinstance(self.client_address, tuple) and len(self.client_address) > 0:
                return str(self.client_address[0])
            return "unix-socket"

        def _check_auth(self):
            if not manager.secret:
                return True
            auth = self.headers.get("Authorization") or ""
            expected = f"Bearer {manager.secret}"
            return auth.strip() == expected.strip()

        def _send_json(self, status_code, payload):
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            path = self.path.split("?")[0]
            if path in ["/health", "/api/health"]:
                self._send_json(200, {
                    "ok": True,
                    "status": "healthy",
                    "engine": "TurboVec",
                    "version": "1.0.0",
                    "model": manager.model,
                    "dimension": manager.dim,
                    "stats": manager.status()["indexes"],
                })
            else:
                self._send_json(404, {"error": "Not found"})

        def do_POST(self):
            if not self._check_auth():
                return self._send_json(401, {"error": "Unauthorized: invalid or missing Bearer token"})

            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                data = json.loads(raw)
            except Exception as e:
                return self._send_json(400, {"error": f"Invalid JSON payload: {e}"})

            path = self.path.split("?")[0]
            try:
                if path in ["/api/status", "/status"]:
                    res = manager.status()
                elif path in ["/api/search", "/search"]:
                    res = manager.search(
                        index_name=data.get("index_name") or "dgs-content",
                        query=data.get("query") or "",
                        k=int(data.get("k") or 10),
                        limit=int(data.get("limit") or 10),
                        kinds=data.get("kinds"),
                        exclude_keys=data.get("exclude_keys"),
                        min_score=float(data.get("min_score") or -1.0),
                        allowlist=data.get("allowlist"),
                    )
                elif path in ["/api/index-batch", "/api/index", "/index"]:
                    res = manager.index_batch(
                        index_name=data.get("index_name") or "dgs-content",
                        documents=data.get("documents") or [],
                    )
                elif path in ["/api/remove", "/remove"]:
                    res = manager.remove(
                        index_name=data.get("index_name") or "dgs-content",
                        ids=data.get("ids") or [],
                    )
                elif path in ["/api/deduplicate", "/deduplicate"]:
                    res = manager.deduplicate(
                        text=data.get("text") or data.get("query") or "",
                        domain=data.get("domain"),
                        url=data.get("url"),
                        threshold_possible=float(data.get("threshold_possible") or 0.78),
                        threshold_likely=float(data.get("threshold_likely") or 0.88),
                    )
                elif path in ["/api/match-target-pages", "/match-target-pages"]:
                    res = manager.match_target_pages(
                        query=data.get("query") or data.get("text") or "",
                        region=data.get("region"),
                        limit=int(data.get("limit") or 5),
                    )
                elif path in ["/api/match-assets", "/match-assets"]:
                    res = manager.match_assets(
                        query=data.get("query") or data.get("text") or "",
                        limit=int(data.get("limit") or 4),
                    )
                elif path in ["/api/ground-draft", "/ground-draft"]:
                    res = manager.ground_draft(
                        opportunity_text=data.get("opportunity_text") or data.get("query") or "",
                        publication_name=data.get("publication_name") or "",
                        target_page=data.get("target_page"),
                    )
                elif path in ["/api/reindex", "/reindex"]:
                    index_name = data.get("index_name") or "dgs-content"
                    res = manager.index_batch(index_name=index_name, documents=data.get("documents") or [])
                else:
                    return self._send_json(404, {"error": f"Unknown endpoint '{path}'"})

                self._send_json(200, res)
            except Exception as exc:
                self._send_json(500, {"ok": False, "error": str(exc)})

        def log_message(self, format, *args):
            # Suppress normal access logging to keep stdout clean
            pass

    return TurboVecRequestHandler


def run_server(port=None, socket_path=None, manager=None):
    handler = make_handler(manager)
    server = None
    if socket_path:
        sock_p = Path(socket_path)
        if sock_p.exists():
            try:
                sock_p.unlink()
            except Exception:
                pass
        sock_p.parent.mkdir(parents=True, exist_ok=True)

        import socket as sock_mod
        class UnixHTTPServer(HTTPServer):
            address_family = sock_mod.AF_UNIX

        server = UnixHTTPServer(str(sock_p), handler)
        try:
            os.chmod(str(sock_p), 0o777)
        except Exception:
            pass
        print(f"[TURBOVEC] Service listening on Unix socket: {sock_p}", file=sys.stderr)
    else:
        server = HTTPServer(("127.0.0.1", port or DEFAULT_PORT), handler)
        print(f"[TURBOVEC] Service listening on http://127.0.0.1:{port or DEFAULT_PORT}", file=sys.stderr)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[TURBOVEC] Shutting down gracefully...", file=sys.stderr)
        server.server_close()
        if socket_path and Path(socket_path).exists():
            try:
                Path(socket_path).unlink()
            except Exception:
                pass


def run_oneshot(manager):
    try:
        req = json.loads(sys.stdin.read() or "{}")
    except Exception as exc:
        sys.stdout.write(json.dumps({"ok": False, "error": f"Invalid JSON: {exc}"}))
        sys.exit(1)

    cmd = str(req.get("command") or req.get("action") or "status").lower()
    try:
        if cmd == "status":
            res = manager.status()
        elif cmd == "search":
            res = manager.search(
                index_name=req.get("index_name") or "dgs-content",
                query=req.get("query") or "",
                k=int(req.get("k") or 10),
                limit=int(req.get("limit") or 10),
                kinds=req.get("kinds"),
                exclude_keys=req.get("exclude_keys"),
                min_score=float(req.get("min_score") or -1.0),
                allowlist=req.get("allowlist"),
            )
        elif cmd in ["reindex", "index"]:
            res = manager.index_batch(
                index_name=req.get("index_name") or "dgs-content",
                documents=req.get("documents") or [],
            )
        elif cmd == "remove":
            res = manager.remove(
                index_name=req.get("index_name") or "dgs-content",
                ids=req.get("ids") or [],
            )
        elif cmd == "deduplicate":
            res = manager.deduplicate(
                text=req.get("text") or req.get("query") or "",
                domain=req.get("domain"),
                url=req.get("url"),
            )
        elif cmd == "match_target_pages":
            res = manager.match_target_pages(
                query=req.get("query") or req.get("text") or "",
                region=req.get("region"),
                limit=int(req.get("limit") or 5),
            )
        elif cmd == "match_assets":
            res = manager.match_assets(
                query=req.get("query") or req.get("text") or "",
                limit=int(req.get("limit") or 4),
            )
        elif cmd == "ground_draft":
            res = manager.ground_draft(
                opportunity_text=req.get("opportunity_text") or req.get("query") or "",
                publication_name=req.get("publication_name") or "",
                target_page=req.get("target_page"),
            )
        else:
            res = {"ok": False, "error": f"Unknown command '{cmd}'"}
        sys.stdout.write(json.dumps(res, ensure_ascii=False))
    except Exception as exc:
        sys.stdout.write(json.dumps({"ok": False, "error": str(exc)}))


def main():
    parser = argparse.ArgumentParser(description="DGS TurboVec Semantic Intelligence Service")
    parser.add_argument("--server", action="store_true", help="Run as persistent private HTTP daemon")
    parser.add_argument("--port", type=int, default=int(os.environ.get("DGS_TURBOVEC_PORT") or DEFAULT_PORT), help="Port to listen on")
    parser.add_argument("--socket", type=str, default=os.environ.get("DGS_TURBOVEC_SOCKET"), help="Unix domain socket path to listen on")
    parser.add_argument("--oneshot", action="store_true", help="Process single request via stdin/stdout")
    args = parser.parse_args()

    manager = TurboVecManager()

    # On non-Windows, if no socket specified but production shared directory exists, default to socket
    default_socket = None
    if not args.socket and os.name != "nt":
        prod_socket = Path("/home/u188101251/production-app/shared/turbovec/turbovec.sock")
        if prod_socket.parent.exists():
            default_socket = str(prod_socket)

    effective_socket = args.socket or default_socket

    if args.server:
        run_server(port=args.port, socket_path=effective_socket, manager=manager)
    elif args.oneshot or not sys.stdin.isatty():
        run_oneshot(manager)
    else:
        # Default to server when run interactively
        run_server(port=args.port, socket_path=effective_socket, manager=manager)


if __name__ == "__main__":
    main()
