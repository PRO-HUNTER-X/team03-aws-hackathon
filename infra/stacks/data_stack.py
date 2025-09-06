from aws_cdk import (
    Stack,
    aws_dynamodb as dynamodb,
    RemovalPolicy,
    CfnOutput
)
from constructs import Construct

class DataStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, 
                 developer: str = "", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # dev 환경일 때만 개발자 이름 추가
        if developer:
            inquiry_table_name = f"cs-inquiries-dev-{developer}"
            admin_inquiries_table_name = f"admin-inquiries-dev-{developer}"
            admin_users_table_name = f"admin-users-dev-{developer}"
            qna_table_name = f"qna-data-dev-{developer}"
            companies_table_name = f"companies-dev-{developer}"
        else:
            inquiry_table_name = "cs-inquiries"  # 기존 prod 환경
            admin_inquiries_table_name = "admin-inquiries"
            admin_users_table_name = "admin-users"
            qna_table_name = "qna-data"
            companies_table_name = "companies"
        
        # DynamoDB Table for CS inquiries
        self.inquiry_table = dynamodb.Table(
            self, "CSInquiryTable",
            table_name=inquiry_table_name,
            partition_key=dynamodb.Attribute(
                name="inquiry_id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # GSI for company queries
        self.inquiry_table.add_global_secondary_index(
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
        self.inquiry_table.add_global_secondary_index(
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
        
        # DynamoDB Table for Admin Inquiries (별도)
        self.admin_inquiries_table = dynamodb.Table(
            self, "AdminInquiriesTable",
            table_name=admin_inquiries_table_name,
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # GSI for status queries (admin)
        self.admin_inquiries_table.add_global_secondary_index(
            index_name="status-created-index",
            partition_key=dynamodb.Attribute(
                name="status",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="createdAt",
                type=dynamodb.AttributeType.STRING
            )
        )
        
        # GSI for urgency queries (admin)
        self.admin_inquiries_table.add_global_secondary_index(
            index_name="urgency-created-index",
            partition_key=dynamodb.Attribute(
                name="urgency",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="createdAt",
                type=dynamodb.AttributeType.STRING
            )
        )
        
        # DynamoDB Table for Admin Users
        self.admin_users_table = dynamodb.Table(
            self, "AdminUsersTable",
            table_name=admin_users_table_name,
            partition_key=dynamodb.Attribute(
                name="username",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # DynamoDB Table for QnA Data
        self.qna_table = dynamodb.Table(
            self, "QnADataTable",
            table_name=qna_table_name,
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # GSI for category queries
        self.qna_table.add_global_secondary_index(
            index_name="category-created-index",
            partition_key=dynamodb.Attribute(
                name="category",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="createdAt",
                type=dynamodb.AttributeType.STRING
            )
        )
        
        # DynamoDB Table for Companies
        self.companies_table = dynamodb.Table(
            self, "CompaniesTable",
            table_name=companies_table_name,
            partition_key=dynamodb.Attribute(
                name="companyId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # Outputs
        CfnOutput(self, "InquiryTableName",
                 value=self.inquiry_table.table_name,
                 description="CS Inquiry DynamoDB Table Name")
        
        CfnOutput(self, "AdminInquiriesTableName",
                 value=self.admin_inquiries_table.table_name,
                 description="Admin Inquiries DynamoDB Table Name")
        
        CfnOutput(self, "AdminUsersTableName",
                 value=self.admin_users_table.table_name,
                 description="Admin Users DynamoDB Table Name")
        
        CfnOutput(self, "QnATableName",
                 value=self.qna_table.table_name,
                 description="QnA Data DynamoDB Table Name")
        
        CfnOutput(self, "CompaniesTableName",
                 value=self.companies_table.table_name,
                 description="Companies DynamoDB Table Name")
        
        # 기존 호환성을 위한 출력
        CfnOutput(self, "TableName",
                 value=self.inquiry_table.table_name,
                 description="DynamoDB Table Name")
        
        # 기존 호환성을 위한 출력 (기존 table 속성 유지)
        self.table = self.inquiry_table