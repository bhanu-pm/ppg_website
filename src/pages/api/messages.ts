import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://pcg-comment-storage.s3.us-east-1.amazonaws.com/comment_db.json');
    const data = await response.json();
    
    // Set the content type to JSON
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Error fetching messages' });
  }
} 