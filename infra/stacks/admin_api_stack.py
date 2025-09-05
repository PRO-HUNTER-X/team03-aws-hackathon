from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    Duration,
    CfnOutput,
    RemovalPolicy
)
from constructs import Construct

class AdminApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, 
                 dynamodb_table: dynamodb.Table, 
                 developer: str = "", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # Lambda execution role
        lambda_role = iam.Role(
            self, "AdminLambdaExecutionRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole")
            ]
        )
        
        # Grant DynamoDB permissions to admin table
        # Create admin-specific table
        if developer:
            admin_table_name = f"cs-admin-dev-{developer}"
        else:
            admin_table_name = "cs-admin"
        
        admin_table = dynamodb.Table(
            self, "AdminTable",
            table_name=admin_table_name,
            partition_key=dynamodb.Attribute(
                name="admin_id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # Grant permissions to both tables
        dynamodb_table.grant_read_write_data(lambda_role)
        admin_table.grant_read_write_data(lambda_role)
        
        # Admin Lambda functions
        admin_login = _lambda.Function(
            self, "AdminLogin",
            runtime=_lambda.Runtime.NODEJS_18_X,
            handler="dist/login.handler",
            code=_lambda.Code.from_asset("../admin-backend"),
            timeout=Duration.seconds(10),
            memory_size=256,
            role=lambda_role,
            environment={
                "DYNAMODB_TABLE": dynamodb_table.table_name,
                "ADMIN_TABLE": admin_table.table_name,
                "JWT_SECRET": "admin-jwt-secret-key"
            }
        )
        
        admin_verify = _lambda.Function(
            self, "AdminVerify",
            runtime=_lambda.Runtime.NODEJS_18_X,
            handler="dist/verify.handler",
            code=_lambda.Code.from_asset("../admin-backend"),
            timeout=Duration.seconds(10),
            memory_size=256,
            role=lambda_role,
            environment={
                "DYNAMODB_TABLE": dynamodb_table.table_name,
                "ADMIN_TABLE": admin_table.table_name,
                "JWT_SECRET": "admin-jwt-secret-key"
            }
        )
        
        # dev 환경일 때만 개발자 이름 추가
        if developer:
            api_name = f"CS Chatbot Admin API (dev-{developer})"
        else:
            api_name = "CS Chatbot Admin API"
        
        # Admin API Gateway
        admin_api = apigateway.RestApi(
            self, "AdminAPI",
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
        
        # Admin API endpoints
        admin_v1 = admin_api.root.add_resource("admin")
        
        # Auth endpoints
        auth = admin_v1.add_resource("auth")
        auth.add_resource("login").add_method("POST", apigateway.LambdaIntegration(admin_login))
        auth.add_resource("verify").add_method("POST", apigateway.LambdaIntegration(admin_verify))
        
        self.api_url = admin_api.url
        self.api = admin_api
        self.admin_table = admin_table
        
        # Output Admin API URL
        CfnOutput(self, "AdminApiUrl", 
                 value=admin_api.url,
                 description="CS Chatbot Admin API Gateway URL")
        
        # Output Admin Table Name
        CfnOutput(self, "AdminTableName",
                 value=admin_table.table_name,
                 description="Admin DynamoDB Table Name")