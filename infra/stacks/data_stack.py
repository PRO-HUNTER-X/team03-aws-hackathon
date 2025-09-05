from aws_cdk import (
    Stack,
    aws_dynamodb as dynamodb,
    RemovalPolicy
)
from constructs import Construct

class DataStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # DynamoDB Table for CS inquiries
        self.table = dynamodb.Table(
            self, "CSInquiryTable",
            table_name="cs-inquiries",
            partition_key=dynamodb.Attribute(
                name="inquiry_id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # GSI for company queries
        self.table.add_global_secondary_index(
            index_name="company-index",
            partition_key=dynamodb.Attribute(
                name="companyId",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="created_at",
                type=dynamodb.AttributeType.STRING
            )
        )
        
        # GSI for status queries
        self.table.add_global_secondary_index(
            index_name="status-index",
            partition_key=dynamodb.Attribute(
                name="status",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="created_at",
                type=dynamodb.AttributeType.STRING
            )
        )