import { Logger } from '../utils/logger';
import { LoadingStateManager, LoadingState } from '../utils/loading';

export interface BaseClientConfig {
  apiKey: string;
  baseUrl: string;
  appId: string;
  logger: Logger;
  maxRetries?: number;
  loadingStateManager: LoadingStateManager;
}

export interface BaseClient {
  request: <T>(
    method: string,
    path: string,
    body?: any,
    config?: {
      headers?: Record<string, string>;
      responseType?: 'json' | 'blob' | 'text';
    },
    loadingKey?: string
  ) => Promise<{
    success: boolean;
    data?: T;
    error?: string;
    headers?: Headers;
    status?: number;
  }>;
  setJwtToken: (token: string) => void;
}

export const createBaseClient = (config: BaseClientConfig): BaseClient => {
  const { apiKey, baseUrl, appId, logger, maxRetries = 3, loadingStateManager } = config;
  let jwtToken: string | null = null;

  const request = async <T>(
    method: string,
    path: string,
    body?: any,
    config?: {
      headers?: Record<string, string>;
      responseType?: 'json' | 'blob' | 'text';
    },
    loadingKey?: string
  ) => {
    if (loadingKey) {
      loadingStateManager.updateState(loadingKey, { status: 'loading' });
    }

    const url = `${baseUrl}${path}`;
    const defaultHeaders: Record<string, string> = {
      'X-API-Key': apiKey,
      ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
      ...(config?.headers || {}),
    };

    if (!(body instanceof FormData) && !config?.headers?.['Content-Type']) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const responseType = config?.responseType || 'json';

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const response = await fetch(url, {
          method,
          headers: defaultHeaders,
          body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        });

        const result = {
          success: response.ok,
          headers: response.headers,
          status: response.status,
        };

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

          let data: any;
        switch (responseType) {
          case 'blob':
            data = await response.blob();
            break;
          case 'text':
            data = await response.text();
            break;
          case 'json':
            try {
              data = await response.json();
            } catch (e) {
              const text = await response.text();
              throw new Error(`Failed to parse JSON: ${text}`);
            }
            break;
        }

        if (loadingKey) {
          loadingStateManager.updateState(loadingKey, { status: 'success' });
        }
        
        return { ...result, data };
      } catch (error: any) {
        attempt++;
        logger.error(`Request failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
        if (attempt >= maxRetries) {
          if (loadingKey) {
            loadingStateManager.updateState(loadingKey, { status: 'error', error: error.message });
          }
          return { success: false, error: error.message };
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    return { success: false, error: 'Max retries reached' };
  };

  const setJwtToken = (token: string) => {
    jwtToken = token;
  };

  return {
    request,
    setJwtToken,
  };
};