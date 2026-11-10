export class ErrorHttp extends Error {
  constructor(public codigo: number, message: string) {
    super(message);
  }
}
