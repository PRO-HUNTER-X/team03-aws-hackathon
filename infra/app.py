#!/usr/bin/env python3
import aws_cdk as cdk
import os
from stacks.api_stack import ApiStack
from stacks.data_stack import DataStack
from stacks.frontend_stack import FrontendStack

app = cdk.App()

# Environment configuration
env = cdk.Environment(
    account=app.node.try_get_context("account"),
    region=app.node.try_get_context("region") or "us-east-1"
)

# dev 환경 설정
developer = app.node.try_get_context("developer") or os.environ.get("DEVELOPER", "")

# 스택 이름 생성 (dev 환경일 때만 개발자 이름 추가)
if developer:
    stack_prefix = f"cs-chatbot-dev-{developer}"
else:
    stack_prefix = "cs-chatbot"  # 기존 prod 환경

# Create stacks
data_stack = DataStack(app, f"{stack_prefix}-data", 
                      developer=developer,
                      env=env)
api_stack = ApiStack(app, f"{stack_prefix}-api", 
                    dynamodb_table=data_stack.table,
                    developer=developer,
                    env=env)
frontend_stack = FrontendStack(app, f"{stack_prefix}-frontend", 
                              api_url=api_stack.api_url,
                              developer=developer,
                              env=env)

app.synth()