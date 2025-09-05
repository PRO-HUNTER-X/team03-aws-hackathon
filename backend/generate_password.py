#!/usr/bin/env python3
"""
관리자 비밀번호 해시 생성 스크립트
"""
import bcrypt

def generate_password_hash(password: str) -> str:
    """비밀번호 해시 생성"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

if __name__ == "__main__":
    password = "admin123"
    hashed = generate_password_hash(password)
    print(f"Password: {password}")
    print(f"Hashed: {hashed}")
    
    # 검증 테스트
    is_valid = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    print(f"Verification: {is_valid}")