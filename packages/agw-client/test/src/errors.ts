//////////////////////////////////////////////////
// Errors

export type ProviderRpcErrorType = ProviderRpcError & {
  name: 'ProviderRpcError';
};
export class ProviderRpcError extends Error {
  code: number;
  details: string;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.details = message;
  }
}
