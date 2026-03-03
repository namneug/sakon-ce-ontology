# Shared authentication utilities for admin routes — JWT stateless
import functools
import logging
import jwt
from datetime import datetime, timedelta, timezone
from flask import request, jsonify
from config import ADMIN_SECRET_KEY

logger = logging.getLogger(__name__)

JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_HOURS = 24


def create_token(username):
    """สร้าง JWT token สำหรับ admin"""
    payload = {
        'sub': username,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    token = jwt.encode(payload, ADMIN_SECRET_KEY, algorithm=JWT_ALGORITHM)
    # PyJWT < 2.0 returns bytes; ensure we always return str
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token


def require_admin(f):
    """Decorator ตรวจสอบ JWT token"""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'ต้องเข้าสู่ระบบก่อน'}), 401
        token = auth.split(' ', 1)[1]
        try:
            jwt.decode(token, ADMIN_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            logger.warning("[AUTH] JWT expired for %s %s", request.method, request.path)
            return jsonify({'error': 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่'}), 401
        except jwt.InvalidTokenError:
            logger.warning("[AUTH] Invalid JWT for %s %s", request.method, request.path)
            return jsonify({'error': 'Token ไม่ถูกต้อง'}), 401
        return f(*args, **kwargs)
    return decorated
