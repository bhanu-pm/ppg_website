// src/services/s3Service.ts

// This is the new, correct import for downloading data in Amplify v6
import { downloadData } from '@aws-amplify/storage';

export const fetchCommentsFromS3 = async () => {
  try {
    console.log('Attempting to fetch comments from S3...');
    const downloadResult = await downloadData({
      key: 'comment_db.json',
    }).result;
    
    console.log('Successfully downloaded data from S3');
    const textData = await downloadResult.body.text();
    
    try {
      const parsedData = JSON.parse(textData);
      console.log('Successfully parsed JSON data:', parsedData);
      return parsedData;
    } catch (parseError) {
      console.error('Failed to parse JSON data:', parseError);
      throw new Error('Invalid JSON format in S3 file');
    }
    
  } catch (error) {
    console.error('Error fetching comments from S3:', error);
    if (error instanceof Error) {
      throw new Error(`S3 fetch failed: ${error.message}`);
    }
    throw new Error('Unknown error occurred while fetching from S3');
  }
};
