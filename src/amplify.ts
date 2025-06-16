import { Amplify } from 'aws-amplify';

Amplify.configure({
  Storage: {
    AWSS3: {
      bucket: 'ppg-comment-amplify-bucket',
      region: 'us-east-1',
    }
  }
}); 