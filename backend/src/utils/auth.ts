import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@/config';
import { AuthTokenPayload } from '@/types';

/**
 * JWT Token utilities
 */
export class JwtUtil {
  /**
   * Generate JWT token
   */
  static generateToken(payload: AuthTokenPayload): string {
    // @ts-ignore - TypeScript has issues with jwt.sign overloads
    return jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
      issuer: 'work-redesign-platform',
      audience: 'work-redesign-users',
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, config.auth.jwtSecret, {
        issuer: 'work-redesign-platform',
        audience: 'work-redesign-users',
      }) as AuthTokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded?.exp ? new Date(decoded.exp * 1000) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Password hashing utilities
 */
export class PasswordUtil {
  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.auth.bcryptRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate random password
   */
  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }
}

/**
 * API Key utilities
 */
export class ApiKeyUtil {
  /**
   * Generate API key
   */
  static generateApiKey(): string {
    const prefix = 'wr_';
    const randomPart = Math.random().toString(36).substring(2, 15) +
                      Math.random().toString(36).substring(2, 15);
    return prefix + randomPart;
  }

  /**
   * Validate API key format
   */
  static validateApiKeyFormat(apiKey: string): boolean {
    return /^wr_[a-z0-9]{26}$/.test(apiKey);
  }
}

/**
 * Security utilities
 */
export class SecurityUtil {
  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim(); // Remove leading/trailing whitespace
  }

  /**
   * Check if email is from allowed domain (for SK SSO)
   */
  static isAllowedEmailDomain(email: string): boolean {
    const allowedDomains = ['sk.com', 'skplanet.com', 'sktelecom.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return allowedDomains.includes(domain);
  }

  /**
   * Generate CSRF token
   */
  static generateCsrfToken(): string {
    return this.generateSecureRandom(32);
  }
}