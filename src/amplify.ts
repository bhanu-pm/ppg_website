import { Amplify } from 'aws-amplify';

Amplify.configure({
  Storage: {
    AWSS3: {
      bucket: 'pcg-comment-storage',
      region: 'us-east-1',
    }
  }
}); 