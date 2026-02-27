"""
Rate Limiting using slowapi
ป้องกัน brute force และ API abuse
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Global limiter instance — key by IP address
limiter = Limiter(key_func=get_remote_address)


def setup_limiter(app):
    """Register rate limiter with the FastAPI app."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
