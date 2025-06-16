import { defineStorage } from '@aws-amplify/backend';

export const ppg_comment_amplify_bucket = defineStorage({
    name: 'ppg-comment-amplify-bucket',
    isDefault: true,
})