import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  // Add other message properties as needed
}

export const fetchMessagesFromS3 = async (bucketName: string, key: string): Promise<Message[]> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    const str = await response.Body?.transformToString();
    if (!str) {
      throw new Error('No data received from S3');
    }
    
    return JSON.parse(str);
  } catch (error) {
    console.error('Error fetching messages from S3:', error);
    throw error;
  }
}; 