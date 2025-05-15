export type SolanaApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any; // For additional error details
};

export interface UsersApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TestApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SwapRequest {
  fromTokenMint?: string;
  toTokenMint: string;
  amount: number;
}

export interface SwapResponse {
  transactionId: string;
}

export interface CreateTokenRequest {
  decimals: number;
  name: string;
  symbol: string;
}

export interface CreateTokenResponse {
  tokenMint: string;
}

export interface RaydiumSwapRequest {
  poolAddress?: string;
  amountInLamports: number;
  minimumAmountOut: number;
  orderSide: number;
}

export interface RaydiumSwapResponse {
  transactionId: string;
}

export interface PumpfunBuyRequest {
  tokenMint?: string;
  amount: number;
  slippagePercent: number;
}

export interface PumpfunBuyResponse {
  transactionId: string;
}

export interface PumpfunSellRequest {
  tokenMint?: string;
  amount: number;
}

export interface PumpfunSellResponse {
  transactionId: string;
}

export interface OreOpenProofRequest {
  proofId?: string;
}

export interface OreOpenProofResponse {
  transactionId: string;
}

export interface OreMineClaimRequest {
  amountToClaim: number;
}

export interface OreMineClaimResponse {
  transactionId: string;
}

export interface StoreBlobOptions {
  epochs?: number; // Default: 1
  sendObjectTo?: string; // Optional Sui address
  deletable?: boolean; // Default: false
}


export interface StoreBlobResponse {
  blobId: string;
}

export interface RetrieveBlobResponse {
  data: string;
  fileName: string;
}

export interface LoginWalletResponse {
  userId: string;
  token: string;
  succeeded: boolean;
  message: string;
}

export interface PriceFeedInfo {
  id: string;
  attributes: {
    asset_type: string;
    base: string;
    description: string;
    display_symbol: string;
    generic_symbol: string;
    quote_currency: string;
    schedule: string;
    symbol: string;
  };
}

export interface PriceUpdate {
  id: string;
  price: {
    conf: string;
    expo: number;
    price: string;
    publish_time: number;
  };
  ema_price: {
    conf: string;
    expo: number;
    price: string;
    publish_time: number;
  };
  metadata: {
    prev_publish_time: number;
    proof_available_time: number;
    slot: number;
  };
}

export interface PriceFeedRequest {
  query?: string;
  assetType?: string;
}

export interface LatestPriceRequest {
  priceFeedIds: string[];
  ignoreInvalidPriceIds?: boolean;
}

export interface StreamPriceRequest {
  priceFeedIds: string[];
  encoding?: string;
  parsed?: boolean;
  allowUnordered?: boolean;
  benchmarksOnly?: boolean;
  ignoreInvalidPriceIds?: boolean;
}

export interface StreamPriceOptions {
  priceFeedIds: string[];
  encoding?: string;
  parsed?: boolean;
  allowUnordered?: boolean;
  benchmarksOnly?: boolean;
  ignoreInvalidPriceIds?: boolean;
  onPriceUpdate: (data: PriceUpdate) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface AIInvokeResponse {
  succeeded: boolean;
  message: string;
  output: string;
}

export interface AIModelConfig {
  name: string;
  type: 'LocalML' | 'ExternalAPI' | 'MCP';
  filePath?: string;
  externalApiUrl?: string;
  externalApiKey?: string;
  inputType: 'Text' | 'Image' | 'Json';
  outputType: 'Text' | 'Json';
  modelName?: string;
}

export interface AIInvokeParams {
  userId: string;
  modelId: string;
  inputType: "Text" | "Image" | "Json";
  inputData: string;
  mcpTransport?: 'StreamableHTTP';
  modelName?: string;
}

export type BlobContentData = {
  content: any; // Can be string, Blob, ArrayBuffer, etc.
  isFile?: boolean;
  fileName?: string;
  contentType?: string;
};

export type BlobRetrievalOptions = {
  contentDisposition?: string;
  contentType?: string;
  contentEncoding?: string;
  contentLanguage?: string;
  contentLocation?: string;
};

export type ResponseHeaders = {
  'content-disposition'?: string;
  'content-type'?: string;
  'content-encoding'?: string;
  'content-language'?: string;
  'content-location'?: string;
  [key: string]: any; // For other headers
};


export interface PlayerRequest {
  userPublicKey: string;
  username: string;
  nftMeta: string;
}

export interface LeaderboardRequest {
  gamePublicKey: string;
  description: string;
  nftMeta: string;
  scoresToRetain: number;
  isAscending: boolean;
}

export interface ScoreRequest {
  playerPublicKey: string;
  gamePublicKey: string;
  leaderboardPublicKey: string;
  score: number;
}

export interface AchievementRequest {
  gamePublicKey: string;
  title: string;
  description: string;
  nftMeta: string;
}

export interface ClaimRequest {
  playerPublicKey: string;
  gamePublicKey: string;
  targetPublicKey: string; // Can be leaderboard or achievement
}
