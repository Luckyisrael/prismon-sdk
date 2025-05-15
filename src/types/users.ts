import { ApiResponse } from './common';

export interface ConnectWalletRequest {
  walletPublicKey?: string | null;
}

export interface RegisterEmailRequest {
  email?: string | null;
  password?: string | null;
}

export interface VerifyEmailRequest {
  email?: string | null;
  verificationCode?: string | null;
}

export interface LoginEmailRequest {
  email?: string | null;
  password?: string | null;
}

export interface LoginWalletRequest {
  walletPublicKey?: string | null;
  signature?: string | null;
  challengeId: string;
}

export interface UpdateProfileRequest {
  email?: string | null;
  password?: string | null;
}

export interface ChallengeResponse {
  challenge: string;
  challengeId: string;
}

export interface ConnectWalletResponse {
  succeeded: boolean;
  message: string;
  userId: string;
  verificationCode: string | null;
}

export interface RegisterEmailResponse {
  succeeded: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  succeeded: boolean;
  message: string;
}

export interface LoginEmailResponse {
  token: string;
}

export interface LoginWalletResponse {
  succeeded: boolean;
  message: string;
  userId: string;
  token: string;
}

export interface UpdateProfileResponse {
  succeeded: boolean;
  message: string;
}

export type UsersApiResponse<T> = ApiResponse<T>;