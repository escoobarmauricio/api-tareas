import type { RequestHandler } from 'express';
import { servicioTareas } from './task.service';

type ManejadorTarea = RequestHandler<{ id: string }>;

export const listar: RequestHandler = async (_peticion, respuesta, siguiente) => {
  try {
    respuesta.status(200).json(await servicioTareas.listar());
  } catch (error) {
    siguiente(error);
  }
};

export const obtener: ManejadorTarea = async (peticion, respuesta, siguiente) => {
  try {
    respuesta.status(200).json(await servicioTareas.obtener(peticion.params.id));
  } catch (error) {
    siguiente(error);
  }
};

export const crear: RequestHandler = async (peticion, respuesta, siguiente) => {
  try {
    respuesta.status(201).json(await servicioTareas.crear(peticion.body));
  } catch (error) {
    siguiente(error);
  }
};

export const actualizar: ManejadorTarea = async (peticion, respuesta, siguiente) => {
  try {
    respuesta.status(200).json(await servicioTareas.actualizar(peticion.params.id, peticion.body));
  } catch (error) {
    siguiente(error);
  }
};

export const eliminar: ManejadorTarea = async (peticion, respuesta, siguiente) => {
  try {
    respuesta.status(200).json(await servicioTareas.eliminar(peticion.params.id));
  } catch (error) {
    siguiente(error);
  }
};
