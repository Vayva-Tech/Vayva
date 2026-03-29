/**
 * Authentication Service
 * Business logic for merchant authentication, OTP verification, and password management
 */

import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type {
  User,
  Merchant,
  JWTPayload,
  SignInResponse,
  SignUpResponse,
  VerifyOTPResponse,
  ResendOTPResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
} from './auth.types';
import {
  SignInSchema,
  SignUpSchema,
  VerifyOTPSchema,
  ResendOTPSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from './auth.schema';

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;

export class AuthService {
  constructor(private server: FastifyInstance) {}

  /**
   * Generate a 6-digit OTP code
   */
  private generateOTP(): string {
    return Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join('');
  }

  /**
   * Mask phone number for security
   */
  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 4) return '***';
    const lastFour = phone.slice(-4);
    return `+${phone[0]}***${lastFour}`;
  }

  /**
   * Sign in user with email and password
   */
  async signIn(data: z.infer<typeof SignInSchema>): Promise<SignInResponse> {
    try {
      const { email, password, otpMethod } = SignInSchema.parse(data);

      // TODO: Replace with actual database lookup
      // For now, using mock data
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Incorrect email or password',
          },
        };
      }

      // Verify password (TODO: implement bcrypt comparison)
      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Incorrect email or password',
          },
        };
      }

      // Check if OTP is required (based on user settings or security policy)
      const requiresOTP = user.twoFactorEnabled || false;

      if (requiresOTP) {
        // Generate and send OTP
        const otpCode = this.generateOTP();
        await this.saveOTPCode(email, otpCode, otpMethod || 'EMAIL');
        
        // TODO: Send OTP via email/WhatsApp
        await this.sendOTP(email, otpCode, otpMethod || 'EMAIL', user.phone);

        return {
          success: true,
          data: {
            token: '', // Empty token until OTP verified
            user: this.sanitizeUser(user),
            merchant: null,
            requiresOTP: true,
            otpMethod: otpMethod || 'EMAIL',
            maskedPhone: user.phone ? this.maskPhoneNumber(user.phone) : undefined,
          },
        };
      }

      // Generate JWT token
      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        tier: 'FREE', // TODO: Get actual subscription tier
      };

      const token = this.server.jwt.sign(payload);

      return {
        success: true,
        data: {
          token,
          user: this.sanitizeUser(user),
          merchant: null, // TODO: Load merchant data
          requiresOTP: false,
        },
      };
    } catch (error) {
      this.server.log.error(error, 'Sign in failed');
      return {
        success: false,
        error: {
          code: 'SIGN_IN_FAILED',
          message: 'Authentication failed',
        },
      };
    }
  }

  /**
   * Register new merchant account
   */
  async signUp(data: z.infer<typeof SignUpSchema>): Promise<SignUpResponse> {
    try {
      const { email, password, firstName, lastName, storeName, industrySlug, otpMethod } = 
        SignUpSchema.parse(data);

      // Check if user already exists
      const existingUser = await this.findUserByEmail(email);
      
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'An account with this email already exists',
          },
        };
      }

      // Create user (TODO: Replace with actual database insertion)
      const user = await this.createUser({
        email,
        passwordHash: await this.hashPassword(password),
        firstName,
        lastName,
        role: 'owner',
        emailVerified: false,
      });

      // Create merchant/store
      const merchant = await this.createMerchant({
        userId: user.id,
        storeName,
        industrySlug,
        subscriptionTier: 'FREE',
      });

      // Generate and send OTP
      const otpCode = this.generateOTP();
      await this.saveOTPCode(email, otpCode, otpMethod || 'EMAIL');
      
      // TODO: Send OTP via email/WhatsApp
      await this.sendOTP(email, otpCode, otpMethod || 'EMAIL');

      return {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          requiresVerification: true,
          otpMethod: otpMethod || 'EMAIL',
        },
      };
    } catch (error) {
      this.server.log.error(error, 'Sign up failed');
      return {
        success: false,
        error: {
          code: 'SIGN_UP_FAILED',
          message: 'Failed to create account',
        },
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(data: z.infer<typeof VerifyOTPSchema>): Promise<VerifyOTPResponse> {
    try {
      const { email, code, method, rememberMe } = VerifyOTPSchema.parse(data);

      // Find and validate OTP
      const otpRecord = await this.findOTPCode(email, code);
      
      if (!otpRecord) {
        return {
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: 'Invalid verification code',
          },
        };
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        return {
          success: false,
          error: {
            code: 'OTP_EXPIRED',
            message: 'Verification code has expired',
          },
        };
      }

      // Mark OTP as used
      await this.markOTPAsUsed(otpRecord.id);

      // Find user
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      // Update user email verification status
      await this.markEmailAsVerified(user.id);

      // Generate JWT token
      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        tier: 'FREE',
      };

      const token = this.server.jwt.sign(payload);

      // Load merchant data
      const merchant = await this.findMerchantByUserId(user.id);

      return {
        success: true,
        data: {
          token,
          user: this.sanitizeUser(user),
          merchant: merchant || null,
        },
      };
    } catch (error) {
      this.server.log.error(error, 'OTP verification failed');
      return {
        success: false,
        error: {
          code: 'OTP_VERIFICATION_FAILED',
          message: 'Failed to verify code',
        },
      };
    }
  }

  /**
   * Resend OTP code
   */
  async resendOTP(data: z.infer<typeof ResendOTPSchema>): Promise<ResendOTPResponse> {
    try {
      const { email, method } = ResendOTPSchema.parse(data);

      // Check if user exists
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'No account found with this email',
          },
        };
      }

      // Check rate limiting - prevent too many resend requests
      const recentOTP = await this.findRecentOTP(email);
      
      if (recentOTP && !this.isCooldownExpired(recentOTP.createdAt)) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Please wait before requesting another code',
          },
        };
      }

      // Generate new OTP
      const otpCode = this.generateOTP();
      await this.saveOTPCode(email, otpCode, method || 'EMAIL');

      // Send OTP
      await this.sendOTP(email, otpCode, method || 'EMAIL', user.phone);

      return {
        success: true,
        message: 'Verification code resent successfully',
      };
    } catch (error) {
      this.server.log.error(error, 'Resend OTP failed');
      return {
        success: false,
        error: {
          code: 'RESEND_FAILED',
          message: 'Failed to resend code',
        },
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(
    data: z.infer<typeof RequestPasswordResetSchema>
  ): Promise<RequestPasswordResetResponse> {
    try {
      const { email } = RequestPasswordResetSchema.parse(data);

      // Find user
      const user = await this.findUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return {
          success: true,
          message: 'If an account exists, a password reset email will be sent',
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await this.hashToken(resetToken);

      // Save reset token (TODO: Implement database storage)
      await this.savePasswordResetToken(user.email, hashedToken);

      // Send password reset email via Resend
      await this.sendPasswordResetEmail(user.email, resetToken);

      return {
        success: true,
        message: 'If an account exists, a password reset email will be sent',
      };
    } catch (error) {
      this.server.log.error(error, 'Password reset request failed');
      return {
        success: false,
        error: {
          code: 'PASSWORD_RESET_FAILED',
          message: 'Failed to process request',
        },
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    data: z.infer<typeof ResetPasswordSchema>
  ): Promise<ResetPasswordResponse> {
    try {
      const { token, password } = ResetPasswordSchema.parse(data);

      // Verify token
      const hashedToken = await this.hashToken(token);
      const resetRecord = await this.findPasswordResetToken(hashedToken);

      if (!resetRecord) {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token',
          },
        };
      }

      // Check if token is expired
      if (new Date() > resetRecord.expiresAt) {
        return {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Reset token has expired',
          },
        };
      }

      // Find user
      const user = await this.findUserByEmail(resetRecord.email);
      
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      // Update password
      await this.updateUserPassword(user.id, await this.hashPassword(password));

      // Mark token as used
      await this.markTokenAsUsed(resetRecord.id);

      return {
        success: true,
        message: 'Password reset successful',
      };
    } catch (error) {
      this.server.log.error(error, 'Password reset failed');
      return {
        success: false,
        error: {
          code: 'PASSWORD_RESET_FAILED',
          message: 'Failed to reset password',
        },
      };
    }
  }

  // ============================================================================
  // Database Helper Methods (TODO: Replace with actual Prisma/database calls)
  // ============================================================================

  private async findUserByEmail(email: string): Promise<any> {
    // TODO: Implement with Prisma
    // return await this.server.prisma.user.findUnique({ where: { email } });
    return null; // Mock - not found
  }

  private async createUser(data: any): Promise<User> {
    // TODO: Implement with Prisma
    // return await this.server.prisma.user.create({ data });
    return {
      id: `user_${Date.now()}`,
      email: data.email,
      role: data.role,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }

  private async createMerchant(data: any): Promise<Merchant> {
    // TODO: Implement with Prisma
    // return await this.server.prisma.merchant.create({ data });
    return {
      id: `merchant_${Date.now()}`,
      userId: data.userId,
      storeName: data.storeName,
      onboardingCompleted: false,
      subscriptionTier: 'FREE',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Merchant;
  }

  private async findMerchantByUserId(userId: string): Promise<Merchant | null> {
    // TODO: Implement with Prisma
    // return await this.server.prisma.merchant.findFirst({ where: { userId } });
    return null;
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Using bcrypt for secure password verification
    return await bcrypt.compare(password, hash);
  }

  private async hashPassword(password: string): Promise<string> {
    // Using bcrypt with salt rounds of 10 (industry standard)
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: any): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitized } = user;
    return sanitized as User;
  }

  private async saveOTPCode(email: string, code: string, method: 'EMAIL' | 'WHATSAPP'): Promise<void> {
    // TODO: Implement with Prisma
    // await this.server.prisma.oTPCode.create({
    //   data: {
    //     email,
    //     code,
    //     method,
    //     expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    //   },
    // });
  }

  private async findOTPCode(email: string, code: string): Promise<any> {
    // TODO: Implement with Prisma
    // return await this.server.prisma.oTPCode.findFirst({
    //   where: { email, code, used: false },
    // });
    return null;
  }

  private async markOTPAsUsed(id: string): Promise<void> {
    // TODO: Implement with Prisma
    // await this.server.prisma.oTPCode.update({ where: { id }, data: { used: true } });
  }

  private async markEmailAsVerified(userId: string): Promise<void> {
    // TODO: Implement with Prisma
    // await this.server.prisma.user.update({
    //   where: { id: userId },
    //   data: { emailVerified: true },
    // });
  }

  private async findRecentOTP(email: string): Promise<any> {
    // TODO: Implement with Prisma
    // return await this.server.prisma.oTPCode.findFirst({
    //   where: { email },
    //   orderBy: { createdAt: 'desc' },
    // });
    return null;
  }

  private isCooldownExpired(createdAt: Date): boolean {
    const cooldownTime = new Date(createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000);
    return new Date() > cooldownTime;
  }

  private async sendOTP(
    email: string,
    code: string,
    method: 'EMAIL' | 'WHATSAPP',
    phone?: string
  ): Promise<void> {
    if (method === 'EMAIL') {
      // Using Resend for email delivery
      try {
        const resendAPIKey = this.server.config?.RESEND_API_KEY || process.env.RESEND_API_KEY;
        
        if (!resendAPIKey) {
          this.server.log.warn('RESEND_API_KEY not configured, skipping email send');
          return;
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendAPIKey}`,
          },
          body: JSON.stringify({
            from: 'Vayva <no-reply@vayva.ng>',
            to: email,
            subject: 'Your Vayva Verification Code',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Verify Your Account</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Vayva</h1>
                              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Merchant Platform</p>
                            </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                            <td style="padding: 40px 30px;">
                              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Verify Your Account</h2>
                              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">Thank you for signing up! Please enter the verification code below to complete your registration:</p>
                              
                              <!-- OTP Code -->
                              <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                  <td align="center">
                                    <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 8px; padding: 24px 48px;">
                                      <span style="font-size: 36px; font-weight: 700; color: #059669; letter-spacing: 8px;">${code}</span>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              
                              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                This code will expire in <strong>5 minutes</strong>. For security reasons, do not share this code with anyone.
                              </p>
                              
                              <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                                If you didn't request this verification code, you can safely ignore this email.
                              </p>
                            </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                            <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 13px; text-align: center;">
                                Need help? Contact us at <a href="mailto:support@vayva.ng" style="color: #10b981; text-decoration: none;">support@vayva.ng</a>
                              </p>
                              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} Vayva. All rights reserved.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          this.server.log.error(errorData, 'Resend API error');
          throw new Error('Failed to send verification email');
        }

        this.server.log.info(`OTP email sent successfully to ${email}`);
      } catch (error) {
        this.server.log.error(error, 'Failed to send OTP email via Resend');
        throw error;
      }
    } else {
      // WhatsApp integration (to be implemented)
      this.server.log.info(`OTP would be sent via WhatsApp to ${phone}: ${code}`);
      // TODO: Implement WhatsApp integration
    }
  }

  private async savePasswordResetToken(email: string, hashedToken: string): Promise<void> {
    // TODO: Implement with Prisma
    // await this.server.prisma.passwordResetToken.create({
    //   data: {
    //     email,
    //     token: hashedToken,
    //     expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    //   },
    // });
  }

  private async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    // Using Resend for password reset emails
    try {
      const resendAPIKey = this.server.config?.RESEND_API_KEY || process.env.RESEND_API_KEY;
      
      if (!resendAPIKey) {
        this.server.log.warn('RESEND_API_KEY not configured, skipping password reset email');
        return;
      }

      const frontendUrl = process.env.FRONTEND_URL || 'https://merchant.vayva.ng';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendAPIKey}`,
        },
        body: JSON.stringify({
          from: 'Vayva Support <support@vayva.ng>',
          to: email,
          subject: 'Reset Your Vayva Password',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Request</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 40px 0;">
                      <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Vayva</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Security Alert</p>
                          </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                          <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                            <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                              <tr>
                                <td align="center">
                                  <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">Reset Password</a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                              Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 24px 0; color: #10b981; font-size: 14px; word-break: break-all;">
                              <a href="${resetUrl}" style="color: #10b981; text-decoration: none;">${resetUrl}</a>
                            </p>
                            
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
                              <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                                ⚠️ This link expires in 1 hour
                              </p>
                              <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6;">
                                For security reasons, this password reset link will expire in 1 hour. If you don't reset your password within this time, you'll need to submit another request.
                              </p>
                            </div>
                            
                            <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 13px; text-align: center;">
                              Questions? Contact us at <a href="mailto:support@vayva.ng" style="color: #10b981; text-decoration: none;">support@vayva.ng</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                              © ${new Date().getFullYear()} Vayva. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.server.log.error(errorData, 'Resend API error - password reset');
        throw new Error('Failed to send password reset email');
      }

      this.server.log.info(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.server.log.error(error, 'Failed to send password reset email via Resend');
      throw error;
    }
  }

  private async findPasswordResetToken(hashedToken: string): Promise<any> {
    // TODO: Implement with Prisma
    // return await this.server.prisma.passwordResetToken.findFirst({
    //   where: { token: hashedToken, used: false },
    // });
    return null;
  }

  private async markTokenAsUsed(id: string): Promise<void> {
    // TODO: Implement with Prisma
    // await this.server.prisma.passwordResetToken.update({
    //   where: { id },
    //   data: { used: true },
    // });
  }

  private async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    // TODO: Implement with Prisma
    // await this.server.prisma.user.update({
    //   where: { id: userId },
    //   data: { passwordHash },
    // });
  }
}
