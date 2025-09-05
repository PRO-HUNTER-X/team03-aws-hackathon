import boto3
from typing import Dict, Any
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class EmailService:
    def __init__(self):
        self.ses = boto3.client('ses', region_name='us-east-1')
        self.sender_email = 'noreply@cs-chatbot.com'
    
    def send_escalation_email(self, inquiry: Dict[str, Any], reason: str) -> bool:
        """에스컬레이션 이메일 발송"""
        try:
            # 실제 구현에서는 SES로 이메일 발송
            # 현재는 로깅만 수행
            logger.info(f"Escalation email sent for inquiry {inquiry.get('inquiry_id')}")
            return True
        except Exception as e:
            logger.error(f"Error sending escalation email: {str(e)}")
            return False
    
    def send_escalation_notification(self, inquiry: Dict[str, Any], reason: str) -> bool:
        """에스컬레이션 알림 발송 (관리자용)"""
        try:
            # 관리자에게 에스컬레이션 알림 발송
            admin_email = "admin@company.com"  # 실제로는 회사 설정에서 가져옴
            
            subject = f"[긴급] 문의 에스컬레이션: {inquiry.get('title', 'N/A')}"
            body = f"""
문의 ID: {inquiry.get('inquiry_id')}
제목: {inquiry.get('title')}
고객 이메일: {inquiry.get('customerEmail')}
에스컬레이션 사유: {reason}

즉시 대응이 필요합니다.
            """
            
            logger.info(f"Escalation notification sent to {admin_email} for inquiry {inquiry.get('inquiry_id')}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Reason: {reason}")
            
            return True
        except Exception as e:
            logger.error(f"Error sending escalation notification: {str(e)}")
            return False