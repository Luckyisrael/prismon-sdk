import { SolanaApiResponse, BlobContentData } from "../types";

// sdk/utils/blob-handler.ts
export class BlobHandler {
    static async downloadBlob(content: Blob, fileName: string): Promise<void> {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  
    static async blobToText(content: Blob): Promise<string> {
      return await content.text();
    }
  
    static async handleBlobResponse(
      response: SolanaApiResponse<BlobContentData>,
      options?: {
        onFileDownload?: (fileName: string) => void;
        onTextContent?: (text: string) => void;
        defaultFileName?: string;
      }
    ): Promise<string | void> {
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to handle blob response');
      }
  
      const { content, isFile, fileName, contentType } = response.data;
  
      if (isFile) {
        const downloadName = fileName || options?.defaultFileName || 'download';
        await BlobHandler.downloadBlob(
          new Blob([content], { type: contentType }),
          downloadName
        );
        options?.onFileDownload?.(downloadName);
      } else {
        const text = await BlobHandler.blobToText(content);
        options?.onTextContent?.(text);
        return text;
      }
    }
  }