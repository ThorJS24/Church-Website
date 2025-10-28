import { createHash } from 'crypto';

export interface SecurityLog {
  timestamp: string;
  type: 'login_attempt' | 'suspicious_activity' | 'failed_login' | 'security_breach';
  ip: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityManager {
  private static failedAttempts = new Map<string, number>();
  private static blockedIPs = new Set<string>();
  private static suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /onload/i,
    /onerror/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
    /<.*>/,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i
  ];

  static validateInput(input: string): boolean {
    return !this.suspiciousPatterns.some(pattern => pattern.test(input));
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  static hashPassword(password: string, salt: string): string {
    return createHash('sha256').update(password + salt).digest('hex');
  }

  static generateSalt(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  static isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  static recordFailedAttempt(ip: string): void {
    const attempts = this.failedAttempts.get(ip) || 0;
    this.failedAttempts.set(ip, attempts + 1);
    
    if (attempts >= 5) {
      this.blockedIPs.add(ip);
      this.logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: 'security_breach',
        ip,
        userAgent: '',
        details: `IP blocked after ${attempts + 1} failed login attempts`,
        severity: 'high'
      });
    }
  }

  static resetFailedAttempts(ip: string): void {
    this.failedAttempts.delete(ip);
  }

  static logSecurityEvent(event: SecurityLog): void {
    console.warn('SECURITY EVENT:', event);
    
    // Send to email if critical
    if (event.severity === 'critical' || event.severity === 'high') {
      this.sendSecurityAlert(event);
    }
    
    // Store in database
    this.storeSecurityLog(event);
  }

  private static async sendSecurityAlert(event: SecurityLog): Promise<void> {
    try {
      await fetch('/api/security/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  private static async storeSecurityLog(event: SecurityLog): Promise<void> {
    try {
      await fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to store security log:', error);
    }
  }

  static detectSuspiciousActivity(userAgent: string, ip: string): boolean {
    const suspiciousUserAgents = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];

    return suspiciousUserAgents.some(pattern => pattern.test(userAgent));
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && this.validateInput(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    if (!this.validateInput(password)) {
      errors.push('Password contains invalid characters');
    }

    return { valid: errors.length === 0, errors };
  }
}