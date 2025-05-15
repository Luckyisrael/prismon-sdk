import { createSolanaClient } from './clients/solana-client';
import { createUsersClient } from './clients/users-client';
import { createWalletManager } from './utils/wallet-manager';
import { createLogger } from './utils/logger';
import { createLoadingStateManager } from './utils/loading';
import { DEFAULT_BASE_URL, DEFAULT_SOLANA_RPC_URL } from './config';
import { createPythClient } from './clients/pyth-client';
import { createAIClient } from './clients/ai-client';
import { createMagicBlockClient } from './clients/magic-block-client';

export interface PrismonConfig {
  apiKey: string;
  baseUrl?: string;
  appId: string;
  solanaRpcUrl?: string;
  enableLogging?: boolean;
  maxRetries?: number;
}

export const createPrismonClient = (config: PrismonConfig) => {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const solanaRpcUrl = config.solanaRpcUrl || DEFAULT_SOLANA_RPC_URL;
  const appId = config.appId || 'Null'
  const logger = createLogger(config.enableLogging ?? false);
  const loadingStateManager = createLoadingStateManager();
  const walletManager = createWalletManager(solanaRpcUrl, logger);

  const solana = createSolanaClient({
    apiKey: config.apiKey,
    baseUrl,
    appId: config.appId,
    walletManager,
    logger,
    maxRetries: config.maxRetries ?? 3,
    loadingStateManager,
  });

  const users = createUsersClient({
    apiKey: config.apiKey,
    baseUrl,
    appId: config.appId,
    walletManager,
    logger,
    maxRetries: config.maxRetries ?? 3,
    loadingStateManager,
  });

  const pyth = createPythClient({
    apiKey: config.apiKey,
    baseUrl,
    appId: config.appId,
    logger,
    maxRetries: config.maxRetries ?? 3,
    loadingStateManager,
  })

  const ai = createAIClient({
    apiKey: config.apiKey,
    baseUrl,
    appId: config.appId,
    logger,
    maxRetries: config.maxRetries ?? 3,
    loadingStateManager,
  })

  const magicblock = createMagicBlockClient({
    apiKey: config.apiKey,
    baseUrl,
    appId: config.appId,
    logger,
    maxRetries: config.maxRetries ?? 3,
    walletManager,
    loadingStateManager,
  })

  const setJwtToken = (token: string) => {
    solana.setJwtToken(token);
    users.setJwtToken(token);
  };

  const getLoadingStateManager = () => loadingStateManager;

  return {
    solana,
    users,
    pyth,
    ai,
    magicblock,
    setJwtToken,
    getLoadingStateManager,
  };
};

export * from './types';
export * from './utils/loading';