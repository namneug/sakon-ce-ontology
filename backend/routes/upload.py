# Routes สำหรับอัปโหลดรูปภาพผลิตภัณฑ์
import os
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from routes.auth import require_admin

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Configure Cloudinary from environment variables
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route('/api/upload', methods=['POST'])
@require_admin
def upload_image():
    """อัปโหลดรูปภาพไปยัง Cloudinary"""
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

    # อัปโหลดไป Cloudinary
    try:
        result = cloudinary.uploader.upload(
            file,
            folder='sakon-ce-products',
            resource_type='image'
        )
        url = result['secure_url']
    except Exception as e:
        return jsonify({'error': f'อัปโหลดไป Cloudinary ไม่สำเร็จ: {str(e)}'}), 500

    return jsonify({
        'message': 'อัปโหลดสำเร็จ',
        'url': url
    })
