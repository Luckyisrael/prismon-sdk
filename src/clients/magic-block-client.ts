import { PublicKey, Transaction } from "@solana/web3.js";
import { createBaseClient, BaseClientConfig, BaseClient } from "./base-client";
import { AchievementRequest, ClaimRequest, LeaderboardRequest, PlayerRequest, ScoreRequest, SolanaApiResponse } from "../types";
import { WalletManager } from "../utils/wallet-manager";
import { Logger } from "../utils/logger";

export interface MagicBlockClientConfig extends BaseClientConfig {
  walletManager: WalletManager;
}

export interface WalletProps {
  publicKey: PublicKey | null;
  signTransaction?: ((tx: Transaction) => Promise<Transaction>) | undefined;
  signMessage?: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
}

export const createMagicBlockClient = (config: MagicBlockClientConfig) => {
  const baseClient: BaseClient = createBaseClient(config);
  const walletManager: WalletManager = config.walletManager;

  const registerPlayer = async (
    request: PlayerRequest,
    wallet: WalletProps,
    programId: string
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:soar:register-player:${request.username}`
    );
    return baseClient.request(
      "POST",
      `/devApi/Solana/soar/player?programId=${programId}`,
      { ...request, signature: txId },
      undefined,
      "soar:registerPlayer"
    );
  };

  const getPlayer = async (
    playerPublicKey: string,
    programId: string
  ): Promise<SolanaApiResponse<any>> => {
    return baseClient.request(
      "GET",
      `/devApi/Solana/soar/player?playerPublicKey=${playerPublicKey}&programId=${programId}`,
      undefined,
      undefined,
      "soar:getPlayer"
    );
  };

  const createLeaderboard = async (
    request: LeaderboardRequest,
    wallet: WalletProps,
    programId: string
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:soar:create-leaderboard:${request.gamePublicKey}`
    );
    return baseClient.request(
      "POST",
      `/devApi/Solana/soar/leaderboard?programId=${programId}`,
      { ...request, signature: txId },
      undefined,
      "soar:createLeaderboard"
    );
  };

  const submitScore = async (
    request: ScoreRequest,
    wallet: WalletProps,
    programId: string
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:soar:submit-score:${request.leaderboardPublicKey}`
    );
    return baseClient.request(
      "POST",
      `/devApi/Solana/soar/score?programId=${programId}`,
      { ...request, signature: txId },
      undefined,
      "soar:submitScore"
    );
  };

  const createAchievement = async (
    request: AchievementRequest,
    wallet: WalletProps,
    programId: string
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:soar:create-achievement:${request.title}`
    );
    return baseClient.request(
      "POST",
      `/devApi/Solana/soar/achievement?programId=${programId}`,
      { ...request, signature: txId },
      undefined,
      "soar:createAchievement"
    );
  };

  const claimAchievement = async (
    request: ClaimRequest,
    wallet: WalletProps,
    programId: string
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:soar:claim-achievement:${request.targetPublicKey}`
    );
    return baseClient.request(
      "POST",
      `/devApi/Solana/soar/claim-achievement?programId=${programId}`,
      { ...request, signature: txId },
      undefined,
      "soar:claimAchievement"
    );
  };

  const claimReward = async (
    request: ClaimRequest,
    wallet: WalletProps,
    programId: string
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:soar:claim-reward:${request.targetPublicKey}`
    );
    return baseClient.request(
      "POST",
      `/devApi/Solana/soar/claim-reward?programId=${programId}`,
      { ...request, signature: txId },
      undefined,
      "soar:claimReward"
    );
  };

  const setJwtToken = (token: string) => {
    baseClient.setJwtToken(token);
  };

  return {
    registerPlayer,
    getPlayer,
    createLeaderboard,
    submitScore,
    createAchievement,
    claimAchievement,
    claimReward,
    setJwtToken,
  };
};