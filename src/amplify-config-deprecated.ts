// src/amplify-config.ts

const amplifyConfig = {
    Storage: {
      S3: {
        // This should be your S3 bucket's region (e.g., 'us-east-1')
        region: 'us-east-1', 
        // This is your S3 bucket name
        bucket: 'pcg-comment-storage',
        allowGuestAccess: true
      }
    }
  };
  
  export default amplifyConfig;
  