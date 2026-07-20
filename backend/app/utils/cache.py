import time
from typing import Any, Dict, Optional

class InMemoryCache:
    def __init__(self):
        self._cache: Dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            val, expiry = self._cache[key]
            now = time.time()
            if expiry > now:
                print(f"[CACHE HIT] Key: '{key}'. Expires in: {expiry - now:.2f}s")
                return val
            else:
                print(f"[CACHE EXPIRED] Key: '{key}'")
                del self._cache[key]
        else:
            print(f"[CACHE MISS] Key: '{key}'")
        return None

    def set(self, key: str, val: Any, ttl: float = 60.0):
        print(f"[CACHE SET] Key: '{key}' with TTL: {ttl}s")
        self._cache[key] = (val, time.time() + ttl)

    def clear(self):
        print("[CACHE CLEAR] Clearing all keys")
        self._cache.clear()

global_cache = InMemoryCache()
