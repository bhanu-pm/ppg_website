import { GetServerSideProps } from 'next';
import { Messages } from '@/components/Messages';

interface Message {
  id: string;
  content: string;
  timestamp: string;
}

interface MessagesPageProps {
  initialMessages: Message[];
  error?: {
    message: string;
    code: string;
  };
}

export default function MessagesPage({ initialMessages, error }: MessagesPageProps) {
  return <Messages initialMessages={initialMessages} initialError={error} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await fetch('https://pcg-comment-storage.s3.us-east-1.amazonaws.com/comment_db.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const messages = await response.json();

    // Validate the data structure
    if (!Array.isArray(messages)) {
      throw new Error('Invalid data format: expected an array of messages');
    }

    // Validate each message
    const isValidMessage = (msg: any): msg is Message => {
      return (
        typeof msg === 'object' &&
        msg !== null &&
        typeof msg.id === 'string' &&
        typeof msg.content === 'string' &&
        typeof msg.timestamp === 'string'
      );
    };

    if (!messages.every(isValidMessage)) {
      throw new Error('Invalid message format in data');
    }

    return {
      props: {
        initialMessages: messages,
      },
    };
  } catch (error) {
    console.error('Server-side error fetching messages:', error);
    
    // Handle specific error cases
    let errorMessage = 'Failed to load messages';
    let errorCode = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      if (error.message.includes('HTTP error')) {
        errorCode = 'HTTP_ERROR';
        errorMessage = 'Server error while fetching messages';
      } else if (error.message.includes('Invalid data format')) {
        errorCode = 'INVALID_FORMAT';
        errorMessage = 'Invalid message data format';
      } else if (error.message.includes('Invalid message format')) {
        errorCode = 'INVALID_MESSAGE';
        errorMessage = 'Invalid message structure';
      }
    }

    return {
      props: {
        initialMessages: [],
        error: {
          message: errorMessage,
          code: errorCode,
        },
      },
    };
  }
}; 