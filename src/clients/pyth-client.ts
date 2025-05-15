import {
  ApiResponse,
  LatestPriceRequest,
  PriceFeedInfo,
  PriceFeedRequest,
  PriceUpdate,
  StreamPriceOptions,
  StreamPriceRequest,
} from "../types";
import { createBaseClient, BaseClientConfig, BaseClient } from "./base-client";

const hermesBaseUrl = "https://hermes.pyth.network/v2";

export interface PythClientConfig extends BaseClientConfig {}

export const createPythClient = (config: PythClientConfig) => {
  const baseClient: BaseClient = createBaseClient(config);
  const baseApiUrl = config.baseUrl; // Get baseApiUrl from config

  const getPriceFeeds = async (
    request: PriceFeedRequest
  ): Promise<ApiResponse<{ feeds: PriceFeedInfo[] }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (request.query) queryParams.append("query", request.query);
      if (request.assetType) queryParams.append("assetType", request.assetType);
      const queryString = queryParams.toString();
      //@ts-ignore
      return await baseClient.request(
        'GET',
        `/devApi/Pyth/price/feeds${queryString ? `?${queryString}` : ""}`,
        undefined,
        undefined,
        'pyth:getPriceFeeds'
      );
    } catch (error: any) {
      console.error("Failed to fetch price feeds:", error.message);
      return {
        success: false,
        error: `Failed to fetch price feeds: ${error.message}`,
        data: { feeds: [] },
      };
    }
  };

  const getLatestPrice = async (
    request: LatestPriceRequest
  ): Promise<ApiResponse<{ prices: PriceUpdate[] }>> => {
    try {
      const queryParams = new URLSearchParams();
      request.priceFeedIds.forEach((id) => queryParams.append("ids", id));
      if (request.ignoreInvalidPriceIds)
        queryParams.append("ignoreInvalidPriceIds", "true");
      const queryString = queryParams.toString();
      //@ts-ignore
      return await baseClient.request(
        'GET',
        `/devApi/Pyth/price/latest?${queryString}`,
        undefined,
        undefined,
        'pyth:getLatestPrice'
      );
    } catch (error: any) {
      console.error("Failed to fetch latest price:", error.message);
      return {
        success: false,
        error: `Failed to fetch latest price: ${error.message}`,
        data: { prices: [] },
      };
    }
  };

  const streamPrices = async (
    options: StreamPriceOptions
  ): Promise<() => Promise<void>> => {
    try {
      if (options.priceFeedIds.length === 0) {
        throw new Error("At least one price feed ID is required");
      }
      if (!options.onPriceUpdate) {
        throw new Error("onPriceUpdate callback is required");
      }
  
      const sessionId = `session-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`;
      const request: StreamPriceRequest = {
        priceFeedIds: options.priceFeedIds,
        encoding: options.encoding ?? "hex",
        parsed: options.parsed ?? true,
        allowUnordered: options.allowUnordered ?? false,
        benchmarksOnly: options.benchmarksOnly ?? false,
        ignoreInvalidPriceIds: options.ignoreInvalidPriceIds ?? true,
      };
  
      // Start server-side stream
      const startResponse = await baseClient.request(
        'POST',
        `/devApi/Pyth/price/stream/start?sessionId=${sessionId}`,
        request,
        undefined,
        'pyth:startPriceStream'
      );
  
      if (!startResponse.success) {
        throw new Error(startResponse.error || "Failed to start price stream");
      }
  
      // Initialize client-side HTTP stream
      const queryParams = new URLSearchParams();
      options.priceFeedIds.forEach((id) => queryParams.append("ids[]", id));
      queryParams.append("encoding", options.encoding ?? "hex");
      queryParams.append("parsed", (options.parsed ?? true).toString());
      if (options.allowUnordered) queryParams.append("allow_unordered", "false");
      if (options.benchmarksOnly) queryParams.append("benchmarks_only", "true");
      if (options.ignoreInvalidPriceIds)
        queryParams.append("ignore_invalid_price_ids", "true");
      const queryString = queryParams.toString();
      const streamUrl = `${hermesBaseUrl}/updates/price/stream?${queryString}`;
  
      console.log(`Streaming prices from: ${streamUrl}`);
      let isClosing = false;
      const controller = new AbortController();
  
      // Stream response
      const response = await fetch(streamUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
  
      if (!response.ok) {
        throw new Error(`Failed to stream prices: ${response.statusText}`);
      }
  
      const reader = response.body?.getReader();
      console.log("Response body:", reader);
      if (!reader) {
        throw new Error("Failed to get stream reader");
      }
  
      // Process stream
      const processStream = async () => {
        try {
          while (!isClosing) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("Price stream ended");
              break;
            }
      
            const text = new TextDecoder().decode(value);
            const lines = text.split("\n").filter((line) => line.trim());
            
            for (const line of lines) {
              try {
                console.log("Raw stream line:", line);
                
                // Check if this is an SSE data line and extract the JSON part
                if (line.startsWith('data:')) {
                  const jsonStr = line.substring(5).trim(); // Remove 'data:' prefix
                  const response = JSON.parse(jsonStr);
                  console.log("Parsed stream response:", response);
                  
                  // Check if there's parsed data in the response
                  if (response.parsed && Array.isArray(response.parsed)) {
                    // Call callback for each individual price update
                    for (const priceUpdate of response.parsed) {
                      console.log("Received price update:", JSON.stringify(priceUpdate));
                      options.onPriceUpdate(priceUpdate);
                    }
                  } else {
                    console.warn("No parsed data in stream response:", response);
                  }
                } else if (line.startsWith('{')) {
                  // Handle case where it might be direct JSON without the data: prefix
                  const response = JSON.parse(line);
                  console.log("Parsed stream response (direct JSON):", response);
                  
                  if (response.parsed && Array.isArray(response.parsed)) {
                    for (const priceUpdate of response.parsed) {
                      console.log("Received price update:", JSON.stringify(priceUpdate));
                      options.onPriceUpdate(priceUpdate);
                    }
                  }
                } else {
                  console.log("Skipping non-data line:", line);
                }
              } catch (error) {
                console.error("Error parsing stream line:", error, "Line:", line);
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          if (!isClosing) {
            await stopStream();
          }
        }
      };
  
      processStream();
  
      // Return a function to stop the stream
      const stopStream = async () => {
        if (!isClosing) {
          isClosing = true;
          controller.abort();
          try {
            await baseClient.request(
              'POST',
              `/devApi/Pyth/price/stream/stop?sessionId=${sessionId}`,
              undefined,
              undefined,
              'pyth:stopPriceStream'
            );
            console.log("Stream stopped successfully");
          } catch (error) {
            console.error("Error stopping stream:", error);
          }
        }
      };
  
      return stopStream;
    } catch (error: any) {
      console.error("Failed to start price stream:", error.message);
      throw new Error(`Failed to start price stream: ${error.message}`);
    }
  };
  

  return {
    getPriceFeeds,
    getLatestPrice,
    streamPrices,
  };
};