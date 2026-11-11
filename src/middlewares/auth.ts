import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { configuracion } from '../config';
import { ErrorHttp } from '../shared/http-error';

export const autenticar: RequestHandler = (peticion, _respuesta, siguiente) => {
  const coincidencia = peticion.headers.authorization?.match(/^Bearer (\S+)$/i);
  if (!coincidencia) {
    siguiente(new ErrorHttp(401, 'Se requiere un token Bearer'));
    return;
  }
  try {
    const contenidoToken = jwt.verify(coincidencia[1], configuracion.secretoJwt, { algorithms: ['HS256'] });
    if (typeof contenidoToken === 'string' || typeof contenidoToken.sub !== 'string') {
      throw new Error('Token sin usuario');
    }
    siguiente();
  } catch {
    siguiente(new ErrorHttp(401, 'Token inválido o vencido'));
  }
};
