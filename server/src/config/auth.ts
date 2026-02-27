export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET is required. Set it in server/.env before starting the API.');
  }
  return secret;
};
