import { AIInvokeResponse, AIModelConfig, ApiResponse, AIInvokeParams } from "../types";
import { createBaseClient, BaseClientConfig, BaseClient } from "./base-client";

export interface AIClientConfig extends BaseClientConfig {}

export const createAIClient = (config: AIClientConfig) => {
  const baseClient: BaseClient = createBaseClient(config);
  const baseApiUrl = config.baseUrl;

  const invokeAI = async (
    params: AIInvokeParams
  ): Promise<ApiResponse<AIInvokeResponse>> => {
    try {
      const requestBody = {
        userId: params.userId,
        apiKey: config.apiKey,
        modelId: params.modelId,
        inputType: params.inputType,
        inputData: params.inputData,
      };

      //@ts-ignore
      return await baseClient.request(
        "POST",
        "/devApi/AI/invoke",
        requestBody,
        undefined,
        "prismon:invokeAI"
      );
    } catch (error: any) {
      console.error("Failed to invoke AI:", error.message);
      return {
        success: false,
        error: `Failed to invoke AI: ${error.message}`,
        data: {
          succeeded: false,
          message: error.message,
          output: "",
        },
      };
    }
  };

  const registerModel = async (
    modelConfig: AIModelConfig
  ): Promise<ApiResponse<{ message: string }>> => {
    const requestBody = {
      externalApiKey: modelConfig.externalApiKey,
      externalApiUrl: modelConfig.externalApiUrl,
      filePath: modelConfig.filePath,
      inputType: modelConfig.inputType,
      outputType: modelConfig.outputType,
      modelName: modelConfig.modelName,
      name: modelConfig.name,
      type: modelConfig.type,
    };
    try {
      //@ts-ignore
      return await baseClient.request(
        "POST",
        "/devApi/ai/models",
        requestBody,
        undefined,
        "prismon:registerModel"
      );
    } catch (error: any) {
      console.error("Failed to register model:", error.message);
      return {
        success: false,
        error: `Failed to register model: ${error.message}`,
        data: { message: "" },
      };
    }
  };

  return {
    invokeAI,
    registerModel,
  };
};