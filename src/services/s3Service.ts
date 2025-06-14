// src/services/s3Service.ts

// This is the new, correct import for downloading data in Amplify v6
import { downloadData } from '@aws-amplify/storage';

export const fetchCommentsFromS3 = async () => {
  try {
    // Call the new downloadData function
    const downloadResult = await downloadData({
      key: 'comment_db.json',
    }).result;
    
    // The result's body is a Blob, so we need to read it as text
    const textData = await downloadResult.body.text();
    
    // Parse the text data into JSON
    return JSON.parse(textData);
    
  } catch (error) {
    console.warn('Could not fetch comments from S3:', error);
    // Return empty array instead of throwing error
    return [];
  }
};
