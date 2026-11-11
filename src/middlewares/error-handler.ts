import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ErrorHttp } from '../shared/http-error';

export const manejarErrores: ErrorRequestHandler = (error, _peticion, respuesta, _siguiente) => {
  if (error instanceof ErrorHttp) {
    respuesta.status(error.codigo).json({ message: error.message });
  } else if (error instanceof mongoose.Error.ValidationError) {
    respuesta.status(400).json({ message: 'Los datos no cumplen el modelo' });
  } else if (error?.code === 11000) {
    respuesta.status(400).json({ message: 'El email ya está registrado' });
  } else if (error?.type === 'entity.parse.failed') {
    respuesta.status(400).json({ message: 'JSON inválido' });
  } else if (error?.type === 'entity.too.large') {
    respuesta.status(400).json({ message: 'El cuerpo de la petición es demasiado grande' });
  } else {
    console.error('Error interno:', error instanceof Error ? error.name : 'Desconocido');
    respuesta.status(500).json({ message: 'Error interno del servidor' });
  }
};
