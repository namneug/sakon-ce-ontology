# ฟังก์ชันช่วยเหลือ
from config import SCE_NAMESPACE


def strip_namespace(uri):
    """ตัด namespace ออกจาก URI เหลือแค่ local name"""
    if '#' in uri:
        return uri.split('#')[-1]
    if '/' in uri:
        return uri.split('/')[-1]
    return uri


def build_uri(local_name):
    """สร้าง full URI จากชื่อ local"""
    return f"{SCE_NAMESPACE}{local_name}"
