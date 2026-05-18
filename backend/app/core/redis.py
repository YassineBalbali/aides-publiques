import redis
import json
import os
from typing import Optional, Any

# ── Connexion Redis ────────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# ── Helpers ────────────────────────────────────────────

def cache_get(key: str) -> Optional[Any]:
    """Récupère une valeur depuis Redis."""
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
    except Exception:
        pass
    return None

def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    """Stocke une valeur dans Redis avec TTL en secondes."""
    try:
        redis_client.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass

def cache_delete(key: str) -> None:
    """Supprime une clé du cache Redis."""
    try:
        redis_client.delete(key)
    except Exception:
        pass