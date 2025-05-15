import { Logger } from './logger';

export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  logger: Logger,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      logger.log(`Retry ${i + 1}/${maxRetries} failed: ${error.message}`);
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}