import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import bs58 from 'bs58';
import { Logger } from './logger';

export interface WalletManager {
  signUserTransaction: (
    publicKey: PublicKey | null,
    signTransaction: ((tx: Transaction) => Promise<Transaction>) | undefined,
    memo: string
  ) => Promise<string>;
  signUserMessage: (
    publicKey: PublicKey | null,
    signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined,
    message: string
  ) => Promise<string>;
}

export const createWalletManager = (rpcUrl: string, logger: Logger): WalletManager => {
  const connection = new Connection(rpcUrl, 'confirmed');

  const signUserTransaction = async (
    publicKey: PublicKey | null,
    signTransaction: ((tx: Transaction) => Promise<Transaction>) | undefined,
    memo: string
  ): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected or signTransaction not supported');
    }

    try {
      const tx = new Transaction().add({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: Buffer.from(memo),
      });
      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      logger.log(`Transaction before signing: feePayer=${tx.feePayer.toBase58()}, memo=${memo}`);
      const signedTx = await signTransaction(tx);
      console.log('Signed transaction signatures:', signedTx.signatures.map(s => s.publicKey.toBase58()));
      const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      console.log('Transaction ID:', txId);
       // Confirm transaction
       const confirmation = await connection.confirmTransaction(txId, 'confirmed');
       if (confirmation.value.err) {
         logger.error(`Transaction confirmation failed: ${confirmation.value.err}`);
         throw new Error('Transaction confirmation failed');
       }
logger.log(`Transaction confirmed: ${txId}`);
       return txId;
      return txId;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw new Error('Transaction signing failed');
    }
  };

  const signUserMessage = async (
    publicKey: PublicKey | null,
    signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined,
    message: string
  ): Promise<string> => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or signMessage not supported');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      return bs58.encode(signature);
    } catch (error: any) {
      logger.error(`Failed to sign message: ${error.message}`);
      throw error;
    }
  };

  return {
    signUserTransaction,
    signUserMessage,
  };
};