import { PublicKey, Transaction } from "@solana/web3.js";
import { createBaseClient, BaseClientConfig, BaseClient } from "./base-client";
import {
  SolanaApiResponse,
  SwapRequest,
  SwapResponse,
  CreateTokenRequest,
  CreateTokenResponse,
  RaydiumSwapRequest,
  RaydiumSwapResponse,
  PumpfunBuyRequest,
  PumpfunBuyResponse,
  PumpfunSellRequest,
  PumpfunSellResponse,
  OreOpenProofRequest,
  OreOpenProofResponse,
  OreMineClaimRequest,
  OreMineClaimResponse,
  StoreBlobResponse,
  RetrieveBlobResponse,
  StoreBlobOptions,
  BlobRetrievalOptions,
  BlobContentData,
} from "../types";
import { WalletManager } from "../utils/wallet-manager";
import { Logger } from "../utils/logger";
import { getFileNameFromContentDisposition } from "../utils/helper";
import { BlobHandler } from "../utils/blob-handle";

export interface SolanaClientConfig extends BaseClientConfig {
  walletManager: WalletManager;
}

export interface WalletProps {
  publicKey: PublicKey | null;
  signTransaction?: ((tx: Transaction) => Promise<Transaction>) | undefined;
  signMessage?: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
}

export const createSolanaClient = (config: SolanaClientConfig) => {
  const baseClient: BaseClient = createBaseClient(config);
  const walletManager: WalletManager = config.walletManager;

  const swap = async (
    request: SwapRequest,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<SwapResponse>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:swap:${request.fromTokenMint || "unknown"}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/swap",
      { ...request, signature: txId },
      undefined,
      "solana:swap"
    );
  };

  const createToken = async (
    request: CreateTokenRequest,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<CreateTokenResponse>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:token-create:${request.decimals}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/token/create",
      { ...request, signature: txId },
      undefined,
      "solana:createToken"
    );
  };

  const pumpfunSell = async (
    request: PumpfunSellRequest,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<PumpfunSellResponse>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:pumpfun-sell:${request.tokenMint || "unknown"}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/pumpfun/sell",
      { ...request, signature: txId },
      undefined,
      "solana:pumpfunSell"
    );
  };

  const oreOpenProof = async (
    request: OreOpenProofRequest,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<OreOpenProofResponse>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:ore-open-proof:${request.proofId || "unknown"}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/ore/open-proof",
      { ...request, signature: txId },
      undefined,
      "solana:oreOpenProof"
    );
  };

  const oreMineClaim = async (
    request: OreMineClaimRequest,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<OreMineClaimResponse>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:ore-mine-claim:${request.amountToClaim}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/ore/mine-claim",
      { ...request, signature: txId },
      undefined,
      "solana:oreMineClaim"
    );
  };

  const getBalance = async (
    publicKey: string
  ): Promise<SolanaApiResponse<{ balance: number }>> => {
    return baseClient.request(
      "GET",
      `/devApi/Solana/balance?walletPublicKey=${publicKey}`,
      undefined,
      undefined,
      "solana:getBalance"
    );
  };

  const createWallet = async (): Promise<
    SolanaApiResponse<{ publicKey: string; secretKey: string }>
  > => {
    return baseClient.request(
      "POST",
      "/devApi/Solana/create-wallet",
      {},
      undefined,
      "solana:createWallet"
    );
  };

  const transfer = async (
    request: { toPublicKey: string; amount: number },
    wallet: WalletProps
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:transfer:${request.toPublicKey}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/transfer",
      { ...request, signature: txId },
      undefined,
      "solana:transfer"
    );
  };

  const mint = async (
    request: { mint: string; amount: number },
    wallet: WalletProps
  ): Promise<SolanaApiResponse<{ transactionId: string }>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserTransaction(
      wallet.publicKey,
      wallet.signTransaction,
      `Prismon:mint:${request.mint}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/mint",
      { ...request, signature: txId },
      undefined,
      "solana:mint"
    );
  };

  const pumpfunBuy = async (
    request: PumpfunBuyRequest,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<PumpfunBuyResponse>> => {
    if (!wallet.publicKey || !wallet.signMessage) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    console.log("Wallet public key:", wallet.publicKey);
    console.log("Wallet signMessage:", wallet.signMessage);
    console.log("Request:", request);

    const txId = await walletManager.signUserMessage(
      wallet.publicKey,
      wallet.signMessage,
      `Prismon:pumpfun-buy:${request.tokenMint || "unknown"}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/pumpfun/buy",
      { ...request, signature: txId },
      undefined,
      "solana:pumpfunBuy"
    );
  };

  const raydiumSwap = async (
    request: RaydiumSwapRequest,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<RaydiumSwapResponse>> => {
    if (!wallet.publicKey || !wallet.signMessage) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }
    const txId = await walletManager.signUserMessage(
      wallet.publicKey,
      wallet.signMessage,
      `Prismon:raydium-swap:${request.poolAddress || "unknown"}`
    );
    return baseClient.request(
      "POST",
      "/devApi/Solana/raydium/swap",
      { ...request, signature: txId },
      undefined,
      "solana:raydiumSwap"
    );
  };

  const storeBlob = async (
    data: string,
    fileName: string,
    options: StoreBlobOptions,
    wallet: WalletProps
  ): Promise<SolanaApiResponse<StoreBlobResponse>> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or signTransaction not supported");
    }

    try {
      const txId = await walletManager.signUserTransaction(
        new PublicKey(wallet.publicKey),
        wallet.signTransaction,
        `Prismon:store:${fileName}`
      );

      const response = await baseClient.request(
        "POST",
        "/devApi/Solana/blob/store",
        {
          data,
          fileName,
          options: {
            epochs: options.epochs ?? 1,
            sendObjectTo: options.sendObjectTo,
            deletable: options.deletable ?? false,
          },
          transactionId: txId,
        },
        undefined,
        "solana:storeBlob"
      );
      console.log("API response:", JSON.stringify(response));
      return response as any;
    } catch (error: any) {
      console.error("Failed to store blob:", error.message);
      throw new Error(`Failed to store blob: ${error.message}`);
    }
  };

  const retrieveBlob = async (
    blobId: string,
    wallet: WalletProps,
    options?: {
      // Response handling options
      autoHandle?: boolean;
      defaultFileName?: string;
      onFileDownload?: (fileName: string) => void;
      onTextContent?: (text: string) => void;

      // Request options
      contentDisposition?: string;
      contentType?: string;
    }
  ): Promise<SolanaApiResponse<BlobContentData> | string | void> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return {
        success: false,
        error: "Wallet not connected or signTransaction not supported",
      };
    }

    try {
      const txId = await walletManager.signUserTransaction(
        new PublicKey(wallet.publicKey),
        wallet.signTransaction,
        `Prismon:retrieve:${blobId}`
      );

      const params = new URLSearchParams({ transactionId: txId });
      if (options?.contentDisposition)
        params.append("contentDisposition", options.contentDisposition);
      if (options?.contentType)
        params.append("contentType", options.contentType);

      const response = await baseClient.request<Blob>(
        "GET",
        `/devApi/Solana/blob/retrieve/${blobId}?${params.toString()}`,
        undefined,
        {
          responseType: "blob",
          headers: { Accept: "*/*" },
        },
        "solana:retrieveBlob"
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to retrieve blob");
      }

      const contentDisposition = response.headers?.get("content-disposition");
      const contentType = response.headers?.get("content-type");

      const apiResponse: SolanaApiResponse<BlobContentData> = {
        success: true,
        data: {
          content: response.data,
          isFile: !!contentDisposition,
          fileName: contentDisposition
            ? getFileNameFromContentDisposition(contentDisposition)
            : undefined,
          contentType: contentType || "application/octet-stream",
        },
      };

      if (options?.autoHandle) {
        return await BlobHandler.handleBlobResponse(apiResponse, {
          onFileDownload: options.onFileDownload,
          onTextContent: options.onTextContent,
          defaultFileName: options.defaultFileName,
        });
      }

      return apiResponse;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to retrieve blob",
        details: error.response?.data,
      };
    }
  };

  const downloadBlob = async (
    blobId: string,
    wallet: WalletProps,
    fileName?: string,
    options?: Omit<Parameters<typeof retrieveBlob>[2], "autoHandle">
  ): Promise<void> => {
    await retrieveBlob(blobId, wallet, {
      ...options,
      contentDisposition: `attachment${
        fileName ? `; filename="${fileName}"` : ""
      }`,
      autoHandle: true,
    });
  };

  const getBlobAsText = async (
    blobId: string,
    wallet: WalletProps,
    options?: Omit<Parameters<typeof retrieveBlob>[2], "autoHandle">
  ): Promise<string> => {
    return (await retrieveBlob(blobId, wallet, {
      ...options,
      autoHandle: true,
    })) as unknown as Promise<string>;
  };
  const setJwtToken = (token: string) => {
    baseClient.setJwtToken(token);
  };

  return {
    swap,
    createToken,
    raydiumSwap,
    pumpfunBuy,
    pumpfunSell,
    oreOpenProof,
    oreMineClaim,
    getBalance,
    createWallet,
    storeBlob,
    retrieveBlob,
    transfer,
    mint,
    setJwtToken,
    downloadBlob,
    getBlobAsText,
  };
};
