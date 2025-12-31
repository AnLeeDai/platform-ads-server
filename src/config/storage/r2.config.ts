import { registerAs } from '@nestjs/config';

export default registerAs('r2', () => ({
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  bucket: process.env.CLOUDFLARE_R2_BUCKET,
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  publicUrl: process.env.CLOUDFLARE_R2_URL,
}));
