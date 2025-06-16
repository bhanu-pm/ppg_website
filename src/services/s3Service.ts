// src/services/s3Service.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  // AWS credentials will be handled by AWS Amplify's IAM role
  // when deployed, so we don't need to specify them here
});

export const fetchCommentsFromS3 = async () => {
  try {
    console.log('Attempting to fetch comments from S3...');
    const command = new GetObjectCommand({
      Bucket: 'pcg-comment-storage',
      Key: 'comment_db.json',
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      console.log('No data received from S3, returning empty array');
      return [];
    }

    const textData = await response.Body.transformToString();
    console.log('Successfully downloaded data from S3');
    
    try {
      const parsedData = JSON.parse(textData);
      console.log('Successfully parsed JSON data:', parsedData);
      return parsedData;
    } catch (parseError) {
      console.error('Failed to parse JSON data:', parseError);
      return []; // Return empty array instead of throwing error
    }
    
  } catch (error) {
    // If the file doesn't exist or there's an access error, return empty array
    if (error instanceof Error && 
        (error.message.includes('NoSuchKey') || 
         error.message.includes('AccessDenied'))) {
      console.log('File not found or access denied, returning empty array');
      return [];
    }
    
    console.error('Error fetching comments from S3:', error);
    return []; // Return empty array for any other errors
  }
};
