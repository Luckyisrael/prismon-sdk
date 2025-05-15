export interface Logger {
  log: (message: string) => void;
  error: (message: string) => void;
}

export const createLogger = (enabled: boolean): Logger => {
  const log = (message: string) => {
    if (enabled) {
      console.log(`[Prismon] ${message}`);
    }
  };

  const error = (message: string) => {
    if (enabled) {
      console.error(`[Prismon] ${message}`);
    }
  };

  return { log, error };
};