# Shared authentication utilities for admin routes
import os
import functools
import logging
from flask import request, jsonify

logger = logging.getLogger(__name__)

# In-memory token store (shared across blueprints)
admin_tokens = set()


def require_admin(f):
    """Decorator ตรวจสอบ Bearer token"""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        logger.info("[AUTH] %s %s | Authorization: %s | PID: %s | tokens_count: %d",
                     request.method, request.path,
                     'present' if auth else 'MISSING',
                     os.getpid(), len(admin_tokens))
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'ต้องเข้าสู่ระบบก่อน'}), 401
        token = auth.split(' ', 1)[1]
        if token not in admin_tokens:
            logger.warning("[AUTH] Token NOT found in admin_tokens (PID %s, %d tokens stored)",
                           os.getpid(), len(admin_tokens))
            return jsonify({'error': 'Token ไม่ถูกต้องหรือหมดอายุ'}), 401
        return f(*args, **kwargs)
    return decorated
