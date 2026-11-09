import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';

const names = ['R2_BUCKET', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'] as const;
const configured = names.some((name) => process.env[name]?.trim());

function required(name: typeof names[number]): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// No R2 settings means local disk storage, as before. Partial configuration must
// fail at startup rather than silently putting production uploads on disk.
export const r2Storage = configured ? {
  bucket: required('R2_BUCKET'),
  client: new S3Client({
    region: 'auto',
    endpoint: required('R2_ENDPOINT'),
    credentials: {
      accessKeyId: required('R2_ACCESS_KEY_ID'),
      secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  }),
} : null;

export const uploadObjectKey = (filename: string) => `uploads/${filename}`;
