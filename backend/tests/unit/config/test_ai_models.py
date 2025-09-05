"""
✅ AI 모델 설정 테스트
환경변수 기반 모델 스위칭 기능 검증
"""
import pytest
import os
from unittest.mock import patch
import sys

# config 모듈 import를 위한 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
from config.ai_models import (
    AIModelConfig, 
    ModelType, 
    ModelSelectionStrategy,
    analyze_request_complexity,
    get_request_priority,
    ai_model_config
)

class TestAIModelConfig:
    """AI 모델 설정 클래스 테스트"""
    
    def test_기본_모델_설정_로드(self):
        """기본 모델 설정이 올바르게 로드되는지 테스트"""
        config = AIModelConfig()
        
        assert config.config["default_model"] == ModelType.CLAUDE_4_1_OPUS.value
        assert config.config["fallback_model"] == ModelType.CLAUDE_4_OPUS.value
        assert config.config["fast_model"] == ModelType.CLAUDE_4_SONNET.value
        assert config.config["max_tokens"] == 4096
        assert config.config["temperature"] == 0.7
        assert config.config["model_selection_strategy"] == ModelSelectionStrategy.ADAPTIVE.value
    
    @patch.dict(os.environ, {
        'BEDROCK_DEFAULT_MODEL': 'test-claude-4-1-opus',
        'BEDROCK_FALLBACK_MODEL': 'test-claude-4-opus',
        'BEDROCK_FAST_MODEL': 'test-claude-4-sonnet',
        'BEDROCK_MAX_TOKENS': '2048',
        'BEDROCK_TEMPERATURE': '0.5',
        'BEDROCK_SELECTION_STRATEGY': 'fixed'
    })
    def test_환경변수_기반_설정_로드(self):
        """환경변수로 모델 설정이 오버라이드되는지 테스트"""
        config = AIModelConfig()
        
        assert config.config["default_model"] == "test-claude-4-1-opus"
        assert config.config["fallback_model"] == "test-claude-4-opus"
        assert config.config["fast_model"] == "test-claude-4-sonnet"
        assert config.config["max_tokens"] == 2048
        assert config.config["temperature"] == 0.5
        assert config.config["model_selection_strategy"] == "fixed"
    
    def test_적응형_모델_선택_간단한_요청(self):
        """간단한 요청에 대해 빠른 모델이 선택되는지 테스트"""
        config = AIModelConfig()
        
        selected_model = config.get_model_for_request(complexity="simple", priority="normal")
        
        assert selected_model == config.config["fast_model"]
    
    def test_적응형_모델_선택_복잡한_요청(self):
        """복잡한 요청에 대해 기본 모델이 선택되는지 테스트"""
        config = AIModelConfig()
        
        selected_model = config.get_model_for_request(complexity="complex", priority="normal")
        
        assert selected_model == config.config["default_model"]
    
    def test_적응형_모델_선택_높은_우선순위(self):
        """높은 우선순위 요청에 대해 기본 모델이 선택되는지 테스트"""
        config = AIModelConfig()
        
        selected_model = config.get_model_for_request(complexity="medium", priority="high")
        
        assert selected_model == config.config["default_model"]
    
    def test_모델_파라미터_반환(self):
        """모델 파라미터가 올바르게 반환되는지 테스트"""
        config = AIModelConfig()
        
        params = config.get_model_parameters("test-model-id")
        
        assert params["modelId"] == "test-model-id"
        assert params["contentType"] == "application/json"
        assert params["accept"] == "application/json"
        assert params["body"]["max_tokens"] == config.config["max_tokens"]
        assert params["body"]["temperature"] == config.config["temperature"]

class TestRequestAnalysis:
    """요청 분석 함수 테스트"""
    
    def test_간단한_메시지_복잡도_분석(self):
        """짧은 메시지가 간단함으로 분류되는지 테스트"""
        message = "안녕하세요"
        
        complexity = analyze_request_complexity(message)
        
        assert complexity == "simple"
    
    def test_복잡한_메시지_복잡도_분석(self):
        """긴 메시지나 복잡한 키워드가 포함된 메시지가 복잡함으로 분류되는지 테스트"""
        message = "상세한 분석이 필요한 복잡한 문제입니다. 해결방법을 알려주세요." * 5
        
        complexity = analyze_request_complexity(message)
        
        assert complexity == "complex"
    
    def test_우선순위_매핑_정상(self):
        """우선순위 매핑이 올바르게 작동하는지 테스트"""
        assert get_request_priority("low") == "normal"
        assert get_request_priority("normal") == "normal"
        assert get_request_priority("high") == "high"
        assert get_request_priority("urgent") == "high"