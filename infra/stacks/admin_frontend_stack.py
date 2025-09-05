from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3_deployment as s3deploy,
    RemovalPolicy,
    Duration,
    CfnOutput
)
from constructs import Construct

class AdminFrontendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, 
                 admin_api_url: str, developer: str = "", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # dev 환경일 때만 개발자 이름 추가
        if developer:
            bucket_name = f"cs-chatbot-admin-frontend-dev-{developer}-{self.account}"
        else:
            bucket_name = f"cs-chatbot-admin-frontend-{self.account}"
        
        # S3 bucket for admin static website
        admin_website_bucket = s3.Bucket(
            self, "AdminWebsiteBucket",
            bucket_name=bucket_name,
            website_index_document="index.html",
            website_error_document="error.html",
            public_read_access=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ACLS,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )
        
        # Admin API URL을 환경변수로 설정
        self.admin_api_url = admin_api_url
        
        # Admin CloudFront distribution
        admin_distribution = cloudfront.Distribution(
            self, "AdminWebsiteDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(admin_website_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED
            ),
            default_root_object="index.html",
            # SPA 라우팅을 위한 404 에러 처리
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.minutes(5)
                ),
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.minutes(5)
                )
            ]
        )
        
        # Deploy Admin Next.js build
        s3deploy.BucketDeployment(
            self, "DeployAdminWebsite",
            sources=[s3deploy.Source.asset("../admin-frontend/out")],
            destination_bucket=admin_website_bucket,
            distribution=admin_distribution,
            distribution_paths=["/*"],
            prune=True
        )
        
        self.bucket = admin_website_bucket
        self.distribution = admin_distribution
        
        # Output Admin CloudFront URL
        CfnOutput(self, "AdminCloudFrontUrl",
                 value=f"https://{admin_distribution.distribution_domain_name}",
                 description="CS Chatbot Admin Frontend URL")
        
        # Output Admin CloudFront Distribution ID
        CfnOutput(self, "AdminDistributionId",
                 value=admin_distribution.distribution_id,
                 description="Admin CloudFront Distribution ID")
        
        # Output Admin S3 bucket name
        CfnOutput(self, "AdminS3BucketName",
                 value=admin_website_bucket.bucket_name,
                 description="S3 Bucket for admin frontend files")