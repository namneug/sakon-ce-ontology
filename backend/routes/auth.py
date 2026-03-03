# Shared authentication utilities for admin routes
import functools
from flask import request, jsonify

# In-memory token store (shared across blueprints)
admin_tokens = set()


def require_admin(f):
    """Decorator ตรวจสอบ Bearer token"""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'ต้องเข้าสู่ระบบก่อน'}), 401
        token = auth.split(' ', 1)[1]
        if token not in admin_tokens:
            return jsonify({'error': 'Token ไม่ถูกต้องหรือหมดอายุ'}), 401
        return f(*args, **kwargs)
    return decorated
