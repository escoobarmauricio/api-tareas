import type { RequestHandler } from 'express';
import { servicioUsuarios } from './user.service';

export const registrar: RequestHandler = async (peticion, respuesta, siguiente) => {
  try {
    respuesta.status(201).json(await servicioUsuarios.registrar(peticion.body));
  } catch (error) {
    siguiente(error);
  }
};

export const iniciarSesion: RequestHandler = async (peticion, respuesta, siguiente) => {
  try {
    respuesta.status(200).json(await servicioUsuarios.iniciarSesion(peticion.body));
  } catch (error) {
    siguiente(error);
  }
};
