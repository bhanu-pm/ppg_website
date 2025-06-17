export const MESSAGES_URL = process.env.NEXT_PUBLIC_MESSAGES_URL || 'https://pcg-comment-storage.s3.us-east-1.amazonaws.com/comment_db.json';

export const fetchMessages = async () => {
  try {
    const response = await fetch(MESSAGES_URL, {
      // Add cache control to prevent stale data
      cache: 'no-store',
      // Add headers to ensure we get fresh data
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}; 