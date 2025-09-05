from aws_cdk import (
    Stack,
    aws_iam as iam,
    CfnOutput
)
from constructs import Construct

class GitHubStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # GitHub OIDC Provider
        github_provider = iam.OpenIdConnectProvider(
            self, "GitHubOIDCProvider",
            url="https://token.actions.githubusercontent.com",
            client_ids=["sts.amazonaws.com"],
            thumbprints=["6938fd4d98bab03faadb97b34396831e3780aea1"]
        )
        
        # GitHub Actions Role
        github_role = iam.Role(
            self, "GitHubActionsRole",
            role_name="GitHubActions-CS-Chatbot-Deploy",
            assumed_by=iam.WebIdentityPrincipal(
                identity_provider=github_provider.open_id_connect_provider_arn,
                conditions={
                    "StringEquals": {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                    },
                    "StringLike": {
                        "token.actions.githubusercontent.com:sub": "repo:PRO-HUNTER-X/team03-aws-hackathon:*"
                    }
                }
            ),
            description="GitHub Actions Role for CS Chatbot Deployment"
        )
        
        # 필요한 정책들 연결
        policies = [
            iam.ManagedPolicy.from_aws_managed_policy_name("AWSCloudFormationFullAccess"),
            iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3FullAccess"),
            iam.ManagedPolicy.from_aws_managed_policy_name("CloudFrontFullAccess"),
            iam.ManagedPolicy.from_aws_managed_policy_name("AWSLambda_FullAccess"),
            iam.ManagedPolicy.from_aws_managed_policy_name("AmazonDynamoDBFullAccess"),
            iam.ManagedPolicy.from_aws_managed_policy_name("AmazonAPIGatewayAdministrator"),
            iam.ManagedPolicy.from_aws_managed_policy_name("IAMFullAccess")
        ]
        
        for policy in policies:
            github_role.add_managed_policy(policy)
        
        # Output Role ARN
        CfnOutput(self, "GitHubRoleArn",
                 value=github_role.role_arn,
                 description="GitHub Actions Role ARN - Add to GitHub Secrets as AWS_ROLE_ARN")