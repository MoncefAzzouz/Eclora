import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me-in-production'),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
  isProd: process.env.NODE_ENV === 'production',
};
