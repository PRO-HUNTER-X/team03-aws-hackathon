from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3_deployment as s3deploy,
    RemovalPolicy,
    CfnOutput
)
from constructs import Construct

class FrontendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, 
                 api_url: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # S3 bucket for static website
        website_bucket = s3.Bucket(
            self, "WebsiteBucket",
            bucket_name=f"cs-chatbot-frontend-{self.account}",
            website_index_document="index.html",
            website_error_document="error.html",
            public_read_access=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ACLS,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )
        
        # CloudFront distribution
        distribution = cloudfront.Distribution(
            self, "WebsiteDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(website_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED
            ),
            default_root_object="index.html"
        )
        
        # Deploy static files to S3
        s3deploy.BucketDeployment(
            self, "DeployWebsite",
            sources=[
                s3deploy.Source.asset("../frontend/public"),
                s3deploy.Source.asset("../frontend/.next/static", destination_key_prefix="_next/static")
            ],
            destination_bucket=website_bucket,
            distribution=distribution,
            distribution_paths=["/*"],
            prune=True  # Remove old files
        )
        
        self.bucket = website_bucket
        self.distribution = distribution
        
        # Output CloudFront URL
        CfnOutput(self, "CloudFrontUrl",
                 value=f"https://{distribution.distribution_domain_name}",
                 description="CS Chatbot Frontend URL")
        
        # Output S3 bucket name
        CfnOutput(self, "S3BucketName",
                 value=website_bucket.bucket_name,
                 description="S3 Bucket for frontend files")