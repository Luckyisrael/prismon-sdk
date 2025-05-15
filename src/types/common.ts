export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  export class PrismonError extends Error {
    constructor(message: string, public status?: number) {
      super(message);
      this.name = 'PrismonError';
    }
  }