
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1', // Default region since process.env is not available in browser
  // AWS credentials will be handled by AWS Amplify's IAM role
  // when deployed, so we don't need to specify them here
});

export const fetchCommentsFromS3 = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: 'pcg-comment-storage',
      Key: 'comment_db.json',
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('No data received from S3');
    }

    const jsonData = await response.Body.transformToString();
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error fetching comments from S3:', error);
    throw error;
  }
};
