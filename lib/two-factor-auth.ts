import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export function generateTwoFactorSecret(userEmail: string): TwoFactorSetup {
  const secret = authenticator.generateSecret();
  const serviceName = 'Salem Primitive Baptist Church';
  const otpauth = authenticator.keyuri(userEmail, serviceName, secret);
  
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  return {
    secret,
    qrCodeUrl: otpauth,
    backupCodes
  };
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export async function generateQRCode(otpauth: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauth);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}