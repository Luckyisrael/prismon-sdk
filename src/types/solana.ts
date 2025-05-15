import { ApiResponse } from './common';

export enum OrderSide {
  Buy = 0,
  Sell = 1,
}

export interface TransferRequest {
  toPublicKey?: string | null;
  amount: number;
  signature?: string | null;
}

export interface MintRequest {
  mint?: string | null;
  amount: number;
  signature?: string | null;
}

export interface SwapRequest {
  fromTokenMint?: string | null;
  toTokenMint?: string | null;
  amount: number;
  signature?: string | null;
}

export interface CreateTokenRequest {
  decimals: number;
  initialSupply: number;
  freezeAuthorityEnabled: boolean;
  signature?: string | null;
}

export interface RaydiumSwapRequest {
  poolAddress?: string | null;
  amountInLamports: number;
  minimumAmountOut: number;
  orderSide: OrderSide;
  signature?: string | null;
}

export interface PumpfunBuyRequest {
  tokenMint?: string | null;
  solAmount: number;
  slippagePercent: number;
  signature?: string | null;
}

export interface PumpfunSellRequest {
  tokenMint?: string | null;
  amount: number;
  signature?: string | null;
}

export interface OreOpenProofRequest {
  signature?: string | null;
}

export interface OreMineClaimRequest {
  digest?: string | null;
  nonce?: string | null;
  amountToClaim: number;
  signature?: string | null;
}

export interface StoreBlobRequest {
  data?: string | null;
  fileName?: string | null;
  lifetimeDays: number;
  transactionId?: string | null;
}

export interface BalanceResponse {
  balance: number;
}

export interface TokenAccountsResponse {
  accounts: Array<{ mint: string; balance: number }>;
}

export interface TransferResponse {
  transactionId: string;
  signature: string;
}

export interface MintResponse {
  transactionId: string;
}

export interface TransactionResponse {
  status: string;
  details: any;
}

export interface CreateWalletResponse {
  publicKey: string;
  secretKey: string;
}

export interface SwapResponse {
  transactionId: string;
}

export interface CreateTokenResponse {
  tokenMint: string;
}

export interface RaydiumSwapResponse {
  transactionId: string;
}

export interface PumpfunBuyResponse {
  transactionId: string;
}

export interface PumpfunSellResponse {
  transactionId: string;
}

export interface OreOpenProofResponse {
  proofId: string;
}

export interface OreMineClaimResponse {
  claimId: string;
}

export interface StoreBlobResponse {
  blobId: string;
  cluster: string;
}

export interface RetrieveBlobResponse {
  data: string;
}

export interface CertifyBlobResponse {
  isAvailable: boolean;
}

export type SolanaApiResponse<T> = ApiResponse<T>;