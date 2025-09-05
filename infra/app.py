#!/usr/bin/env python3
import aws_cdk as cdk
from stacks.api_stack import ApiStack
from stacks.data_stack import DataStack
from stacks.frontend_stack import FrontendStack

app = cdk.App()

# Environment configuration
env = cdk.Environment(
    account=app.node.try_get_context("account"),
    region=app.node.try_get_context("region") or "us-east-1"
)

# Create stacks
data_stack = DataStack(app, "cs-chatbot-data", env=env)
api_stack = ApiStack(app, "cs-chatbot-api", 
                    dynamodb_table=data_stack.table,
                    env=env)
frontend_stack = FrontendStack(app, "cs-chatbot-frontend", 
                              api_url=api_stack.api_url,
                              env=env)

app.synth()