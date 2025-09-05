from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    Duration,
    CfnOutput
)
from constructs import Construct

class ApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, 
                 dynamodb_table: dynamodb.Table, 
                 developer: str = "", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # Lambda execution role
        lambda_role = iam.Role(
            self, "LambdaExecutionRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole")
            ]
        )
        
        # Grant DynamoDB permissions
        dynamodb_table.grant_read_write_data(lambda_role)
        
        # Bedrock permissions
        lambda_role.add_to_policy(
            iam.PolicyStatement(
                actions=[
                    "bedrock:InvokeModel",
                    "bedrock:GetModel",
                    "bedrock:ListModels"
                ],
                resources=["*"]
            )
        )
        
        # Lambda functions
        health_check = _lambda.Function(
            self, "HealthCheck",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="handlers/health_check.lambda_handler",
            code=_lambda.Code.from_asset("../backend"),
            timeout=Duration.seconds(10),
            memory_size=128,
            environment={
                "DYNAMODB_TABLE": dynamodb_table.table_name
            }
        )
        
        inquiry_handler = _lambda.Function(
            self, "InquiryHandler",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="handlers/inquiry_handler.lambda_handler",
            code=_lambda.Code.from_asset("../backend"),
            timeout=Duration.seconds(30),
            memory_size=512,
            role=lambda_role,
            environment={
                "DYNAMODB_TABLE": dynamodb_table.table_name,
                "BEDROCK_DEFAULT_MODEL": "claude-4-1-opus",
                "BEDROCK_FALLBACK_MODEL": "claude-4-opus",
                "BEDROCK_FAST_MODEL": "claude-4-sonnet",
                "BEDROCK_MAX_TOKENS": "4096",
                "BEDROCK_TEMPERATURE": "0.7",
                "BEDROCK_SELECTION_STRATEGY": "adaptive"
            }
        )
        
        ai_response_generator = _lambda.Function(
            self, "AIResponseGenerator",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="handlers/ai_response_generator.lambda_handler",
            code=_lambda.Code.from_asset("../backend"),
            timeout=Duration.seconds(30),
            memory_size=512,
            role=lambda_role,
            environment={
                "DYNAMODB_TABLE": dynamodb_table.table_name,
                "BEDROCK_DEFAULT_MODEL": "claude-4-1-opus",
                "BEDROCK_FALLBACK_MODEL": "claude-4-opus",
                "BEDROCK_FAST_MODEL": "claude-4-sonnet",
                "BEDROCK_MAX_TOKENS": "4096",
                "BEDROCK_TEMPERATURE": "0.7",
                "BEDROCK_SELECTION_STRATEGY": "adaptive"
            }
        )
        
        # dev 환경일 때만 개발자 이름 추가
        if developer:
            api_name = f"CS Chatbot API (dev-{developer})"
        else:
            api_name = "CS Chatbot API"  # 기존 prod 환경
        
        # API Gateway
        api = apigateway.RestApi(
            self, "CSChatbotAPI",
            rest_api_name=api_name,
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=apigateway.Cors.ALL_ORIGINS,
                allow_methods=apigateway.Cors.ALL_METHODS,
                allow_headers=[
                    "Content-Type", 
                    "Authorization", 
                    "X-Requested-With",
                    "Accept",
                    "Origin",
                    "Access-Control-Request-Method",
                    "Access-Control-Request-Headers"
                ],
                max_age=Duration.seconds(86400)
            )
        )
        
        # API endpoints
        # Health check at root path
        api.root.add_method("GET", apigateway.LambdaIntegration(health_check))
        
        # API v1 resource
        api_v1 = api.root.add_resource("api")
        
        # Inquiries endpoints
        inquiries = api_v1.add_resource("inquiries")
        inquiries.add_method("POST", apigateway.LambdaIntegration(inquiry_handler))  # Create inquiry
        inquiries.add_method("GET", apigateway.LambdaIntegration(inquiry_handler))   # List inquiries
        
        # Individual inquiry endpoints
        inquiry_by_id = inquiries.add_resource("{id}")
        inquiry_by_id.add_method("GET", apigateway.LambdaIntegration(inquiry_handler))  # Get inquiry
        
        # AI response endpoint
        ai_response = api_v1.add_resource("ai-response")
        ai_response.add_method("POST", apigateway.LambdaIntegration(ai_response_generator))
        
        self.api_url = api.url
        self.api = api
        
        # Output API URL
        CfnOutput(self, "ApiUrl", 
                 value=api.url,
                 description="CS Chatbot API Gateway URL")