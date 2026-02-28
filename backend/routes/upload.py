# Routes สำหรับอัปโหลดรูปภาพผลิตภัณฑ์
import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route('/api/upload', methods=['POST'])
def upload_image():
    """อัปโหลดรูปภาพ - รับ multipart/form-data"""
    if 'file' not in request.files:
        return jsonify({'error': 'ไม่พบไฟล์ในคำขอ'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'ไม่ได้เลือกไฟล์'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น'}), 400

    # ตรวจขนาดไฟล์
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return jsonify({'error': 'ขนาดไฟล์ต้องไม่เกิน 5MB'}), 400

    # สร้างชื่อไฟล์ด้วย UUID
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    return jsonify({
        'message': 'อัปโหลดสำเร็จ',
        'filename': filename,
        'url': f'/api/uploads/{filename}'
    })


@upload_bp.route('/api/uploads/<filename>')
def serve_upload(filename):
    """Serve ไฟล์รูปภาพที่อัปโหลด"""
    safe_name = secure_filename(filename)
    return send_from_directory(UPLOAD_FOLDER, safe_name)
