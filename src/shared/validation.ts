import { isObjectIdOrHexString } from 'mongoose';
import { ErrorHttp } from './http-error';

export function cuerpoObjeto(valor: unknown): Record<string, unknown> {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    throw new ErrorHttp(400, 'El cuerpo debe ser un objeto JSON');
  }
  return valor as Record<string, unknown>;
}

export function texto(valor: unknown, campo: string, maximo: number): string {
  if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > maximo) {
    throw new ErrorHttp(400, `${campo} es obligatorio y admite hasta ${maximo} caracteres`);
  }
  return valor.trim();
}

export function validarId(id: string): void {
  if (!isObjectIdOrHexString(id)) throw new ErrorHttp(400, 'ID inválido');
}
