import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import config from '../config/envValidation';

export interface DecodedToken extends JwtPayload {
  id: string;
  iat: number;
}

export async function verifyToken(token: string, secret: string): Promise<DecodedToken | null> {
  try {
    const decoded = (await jwt.verify(token, secret)) as DecodedToken;
    return decoded;
  } catch (err) {
    console.error('Invalid or expired token:', err);
    return null;
  }
}

export function signAccessToken(id: string): string {
  return jwt.sign(
    { id },
    config.jwt.accessSecret as Secret,
    {
      expiresIn: config.jwt.accessExpiresIn, // 10m
    } as SignOptions,
  );
}

export function signRefreshToken(id: string) {
  return jwt.sign(
    { id },
    config.jwt.refreshSecret as Secret,
    {
      expiresIn: config.jwt.refreshExpiresIn, // 7d
    } as SignOptions,
  );
}
