import { getUrl, downloadData } from '@aws-amplify/storage';

export const fetchCommentsFromStorage = async () => {
  try {
    console.log('Attempting to fetch comments from storage...');
    const result = await downloadData('comment_db.json');

    if (!result) {
      console.log('No data received from storage, returning empty array');
      return [];
    }

    const textData = await result.text();
    console.log('Successfully downloaded data from storage');
    
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
    
    console.error('Error fetching comments from storage:', error);
    return []; // Return empty array for any other errors
  }
}; 