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

class FrontendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, 
                 api_url: str, developer: str = "", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # dev 환경일 때만 개발자 이름 추가
        if developer:
            bucket_name = f"cs-chatbot-frontend-dev-{developer}-{self.account}"
        else:
            bucket_name = f"cs-chatbot-frontend-{self.account}"  # 기존 prod 환경
        
        # S3 bucket for static website
        website_bucket = s3.Bucket(
            self, "WebsiteBucket",
            bucket_name=bucket_name,
            website_index_document="index.html",
            website_error_document="error.html",
            public_read_access=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ACLS,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )
        
        # API URL을 환경변수로 설정하여 빌드 시 주입
        self.api_url = api_url
        
        # CloudFront distribution
        distribution = cloudfront.Distribution(
            self, "WebsiteDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(website_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED
            ),
            default_root_object="index.html",
            # SPA 라우팅 및 Dynamic Route 처리
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/404.html",
                    ttl=Duration.minutes(5)
                ),
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.minutes(5)
                )
            ],
            # Dynamic Route 지원을 위한 추가 비헤이비어
            additional_behaviors={
                "/status/*": cloudfront.BehaviorOptions(
                    origin=origins.S3Origin(website_bucket),
                    viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cache_policy=cloudfront.CachePolicy.CACHING_DISABLED
                ),
                "/my-inquiries/*": cloudfront.BehaviorOptions(
                    origin=origins.S3Origin(website_bucket),
                    viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cache_policy=cloudfront.CachePolicy.CACHING_DISABLED
                )
            }
        )
        
        # Deploy Next.js static export
        s3deploy.BucketDeployment(
            self, "DeployWebsite",
            sources=[
                s3deploy.Source.asset("../frontend/out")
            ],
            destination_bucket=website_bucket,
            distribution=distribution,
            distribution_paths=["/*"],
            prune=True
        )
        
        self.bucket = website_bucket
        self.distribution = distribution
        
        # Output CloudFront URL
        CfnOutput(self, "CloudFrontUrl",
                 value=f"https://{distribution.distribution_domain_name}",
                 description="CS Chatbot Frontend URL")
        
        # Output CloudFront Distribution ID
        CfnOutput(self, "DistributionId",
                 value=distribution.distribution_id,
                 description="CloudFront Distribution ID")
        
        # Output S3 bucket name
        CfnOutput(self, "S3BucketName",
                 value=website_bucket.bucket_name,
                 description="S3 Bucket for frontend files")