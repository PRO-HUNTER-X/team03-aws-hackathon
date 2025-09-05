"""
AWS Bedrock AI 모델 설정 및 관리
환경변수를 통한 동적 모델 스위칭 지원
"""
import os
from typing import Dict, Any, Optional
from enum import Enum

class ModelType(Enum):
    """지원되는 AI 모델 타입"""
    CLAUDE_4_1_OPUS = "claude-4-1-opus"
    CLAUDE_4_OPUS = "claude-4-opus"
    CLAUDE_4_SONNET = "claude-4-sonnet"

class ModelSelectionStrategy(Enum):
    """모델 선택 전략"""
    FIXED = "fixed"
    ADAPTIVE = "adaptive"
    COST_OPTIMIZED = "cost_optimized"

# 기본 AI 모델 설정
AI_MODEL_CONFIG = {
    "default_model": ModelType.CLAUDE_4_1_OPUS.value,
    "fallback_model": ModelType.CLAUDE_4_OPUS.value,
    "fast_model": ModelType.CLAUDE_4_SONNET.value,
    "max_tokens": 4096,
    "temperature": 0.7,
    "model_selection_strategy": ModelSelectionStrategy.ADAPTIVE.value
}

DEFAULT_AI_MODEL_CONFIG = AI_MODEL_CONFIG

class AIModelConfig:
    """AI 모델 설정 관리 클래스"""
    
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """환경변수에서 모델 설정 로드"""
        return {
            "default_model": os.getenv("BEDROCK_DEFAULT_MODEL", DEFAULT_AI_MODEL_CONFIG["default_model"]),
            "fallback_model": os.getenv("BEDROCK_FALLBACK_MODEL", DEFAULT_AI_MODEL_CONFIG["fallback_model"]),
            "fast_model": os.getenv("BEDROCK_FAST_MODEL", DEFAULT_AI_MODEL_CONFIG["fast_model"]),
            "max_tokens": int(os.getenv("BEDROCK_MAX_TOKENS", str(DEFAULT_AI_MODEL_CONFIG["max_tokens"]))),
            "temperature": float(os.getenv("BEDROCK_TEMPERATURE", str(DEFAULT_AI_MODEL_CONFIG["temperature"]))),
            "model_selection_strategy": os.getenv("BEDROCK_SELECTION_STRATEGY", DEFAULT_AI_MODEL_CONFIG["model_selection_strategy"])
        }
    
    def get_model_for_request(self, complexity: str = "medium", priority: str = "normal") -> str:
        """요청 특성에 따른 최적 모델 선택"""
        strategy = self.config["model_selection_strategy"]
        
        if strategy == ModelSelectionStrategy.FIXED.value:
            return self.config["default_model"]
        elif strategy == ModelSelectionStrategy.ADAPTIVE.value:
            return self._adaptive_model_selection(complexity, priority)
        elif strategy == ModelSelectionStrategy.COST_OPTIMIZED.value:
            return self._cost_optimized_selection(complexity)
        
        return self.config["default_model"]
    
    def _adaptive_model_selection(self, complexity: str, priority: str) -> str:
        """적응형 모델 선택 로직"""
        if priority == "high":
            return self.config["default_model"]  # Claude 4.1 Opus (최고 품질)
        
        if complexity == "simple":
            return self.config["fast_model"]     # Claude 4 Sonnet (빠른 응답)
        elif complexity == "complex":
            return self.config["default_model"]  # Claude 4.1 Opus (복잡한 문의)
        else:
            return self.config["fallback_model"] # Claude 4 Opus (일반적인 문의)
    
    def _cost_optimized_selection(self, complexity: str) -> str:
        """비용 최적화 모델 선택"""
        if complexity == "simple":
            return self.config["fast_model"]
        else:
            return self.config["default_model"]
    
    def get_model_parameters(self, model_id: Optional[str] = None) -> Dict[str, Any]:
        """모델 파라미터 반환"""
        return {
            "modelId": model_id or self.config["default_model"],
            "contentType": "application/json",
            "accept": "application/json",
            "body": {
                "max_tokens": self.config["max_tokens"],
                "temperature": self.config["temperature"]
            }
        }
    
    def get_fallback_model(self) -> str:
        """폴백 모델 반환"""
        return self.config["fallback_model"]

# 전역 설정 인스턴스
ai_model_config = AIModelConfig()

def analyze_request_complexity(message: str, category: str = "general") -> str:
    """요청 복잡도 분석"""
    message_length = len(message)
    
    if message_length < 50:
        return "simple"
    elif message_length > 200 or any(keyword in message.lower() for keyword in 
                                   ["복잡한", "상세한", "분석", "설명", "해결방법"]):
        return "complex"
    else:
        return "medium"

def get_request_priority(urgency: str = "normal") -> str:
    """요청 우선순위 결정"""
    urgency_mapping = {
        "low": "normal",
        "normal": "normal", 
        "medium": "normal",
        "high": "high",
        "urgent": "high",
        "critical": "high"
    }
    return urgency_mapping.get(urgency.lower(), "normal")