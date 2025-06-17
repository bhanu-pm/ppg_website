export const S3_CONFIG = {
  bucket: 'pcg-comment-storage',
  region: 'us-east-1',
  // Since this is a public bucket, we don't need credentials
  // The bucket should have a public read policy
}; 