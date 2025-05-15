import { PublicKey } from '@solana/web3.js';
import { createBaseClient, BaseClientConfig, BaseClient } from './base-client';
import { UsersApiResponse, LoginWalletResponse } from '../types';
import { WalletManager } from '../utils/wallet-manager';
import bs58 from 'bs58';

export interface UsersClientConfig extends BaseClientConfig {
  walletManager: WalletManager;
}

export interface WalletProps {
  publicKey: PublicKey | null;
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
}

export const createUsersClient = (config: UsersClientConfig) => {
  const baseClient: BaseClient = createBaseClient(config);
  const walletManager: WalletManager = config.walletManager;

  const getChallenge = async (publicKey: string): Promise<UsersApiResponse<{ challenge: string; challengeId: string }>> => {
    return baseClient.request(
      'GET',
      `/devApi/Users/challenge?walletPublicKey=${publicKey}`,
      undefined,
      undefined,
      'users:getChallenge'
    );
  };

  const signUpWithEmail = async (email: string, password: string): Promise<UsersApiResponse<{ userId: string; }>> => {
    return baseClient.request(
      'POST',
      `/devApi/Users/signup-email`,
      {
        email,
        password
      },
      undefined,
      'users:signUpWithEmail'
    );
  };

  const verifyEmail = async (email: string, verificationCode: string): Promise<UsersApiResponse<{ userId: string; }>> => {
    return baseClient.request(
      'POST',
      `/devApi/Users/verify-email`,
      {
        email,
        verificationCode
      },
      undefined,
      'users:verifyEmail'
    );
  }

  const loginWithEmail = async (email: string, password: string): Promise<UsersApiResponse<{ userId: string; }>> => {
    return baseClient.request(
      'POST',
      `/devApi/Users/login-email`,
      {
        email,
        password
      },
      undefined,
      'users:loginWithEmail'
    );
  };

  const signUpWallet = async (wallet: WalletProps): Promise<UsersApiResponse<{ walletPublicKey: string; userId: string }>> => {
    if (!wallet.publicKey || !wallet.signMessage) {
      return { success: false, error: 'Wallet not connected or signMessage not supported' };
    }
  
    const appId = config.appId;
    const walletPublicKey = wallet.publicKey.toBase58();
  
    try {
     
      const messageString = `Prismon:signup:${appId.toLowerCase()}:${walletPublicKey}`;
      console.log('Message string to sign:', messageString);
      
    
      const messageBytes = new TextEncoder().encode(messageString);
      
      // Sign the message - exactly as in the login function
      const signedMessage = await wallet.signMessage(messageBytes);
      
      
      const signature = bs58.encode(signedMessage);

      const response = await baseClient.request<{ walletPublicKey: string; userId: string }>(
        'POST',
        '/devApi/Users/connect-wallet',
        {
          walletPublicKey: walletPublicKey,
          signature: signature
        },
        undefined,
        'users:connectUserWallet'
      );
  
      if (response.success && response.data) {
        localStorage.setItem(`prismon_userId_${appId.toLowerCase()}_${walletPublicKey}`, response.data.userId);
      }
  
      return response;
    } catch (error: any) {
      return { success: false, error: `Failed to sign up wallet: ${error.message}` };
    }
  };

  const loginWallet = async (wallet: WalletProps): Promise<UsersApiResponse<LoginWalletResponse>> => {

    const appId = config.appId;
    if (!wallet.publicKey || !wallet.signMessage) {
      return { success: false, error: 'Wallet not connected or signMessage not supported' };
    }
    
    const walletPublicKey = wallet.publicKey.toBase58();
    
    // Get challenge
    const challengeResponse = await getChallenge(walletPublicKey);
    if (!challengeResponse.success || !challengeResponse.data) {
      return { success: false, error: `Failed to get challenge: ${challengeResponse.error || 'Unknown error'}` };
    }

    const { challenge, challengeId } = challengeResponse.data;

    try {
      // Sign the challenge
      const message = new TextEncoder().encode(challenge); 
      const signedMessage = await wallet.signMessage(message);
      const signature = bs58.encode(signedMessage);

      // Send login request with signature
      const loginResponse = await baseClient.request<LoginWalletResponse>(
        'POST',
        '/devApi/Users/login-wallet',
        {
          walletPublicKey: walletPublicKey,
          signature: signature,
          challengeId,
          appId
        },
        undefined,
        'users:loginWallet'
      );
      
      // Set JWT token on success
      if (loginResponse.success && loginResponse.data?.token) {
        setJwtToken(loginResponse.data.token);
      }
      
      return loginResponse;
    } catch (error) {
      return { success: false, error: `Failed to sign message: ${error}` };
    }
  };

  const getSignedInWallet = async (): Promise<UsersApiResponse<{ walletAddress: string; }>> => {
    return baseClient.request(
      'GET',
      `/devApi/Solana/debug/wallet`,
      undefined,
      undefined,
      'users:getWallet'
    );
  };

  const setJwtToken = (token: string) => {
    baseClient.setJwtToken(token);
  };

  return {
    signUpWallet,
    loginWallet,
    getSignedInWallet,
    getChallenge,
    setJwtToken,
    signUpWithEmail,
    verifyEmail,
    loginWithEmail
  };
};