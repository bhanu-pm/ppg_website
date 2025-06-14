// src/services/s3Service.ts

import { get } from '@aws-amplify/storage';

export const fetchCommentsFromS3 = async () => {
  try {
    // Use the 'get' function from Amplify Storage with the 'download' option
    const downloadResult = await get({
      key: 'comment_db.json',
      options: {
        // This ensures the file content is downloaded directly
        download: true,
      },
    });

    // The body is a Blob, so we need to read it as text
    const blob = await downloadResult.body.blob();
    const textData = await blob.text();
    
    // Parse the text data into JSON
    return JSON.parse(textData);
    
  } catch (error) {
    console.error('Error fetching and parsing comments from S3:', error);
    throw error;
  }
};