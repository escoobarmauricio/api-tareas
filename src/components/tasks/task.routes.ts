import { Router } from 'express';
import { crear, obtener, listar, eliminar, actualizar } from './task.controller';

export const rutasTareas = Router();
rutasTareas.get('/', listar);
rutasTareas.get('/:id', obtener);
rutasTareas.post('/', crear);
rutasTareas.put('/:id', actualizar);
rutasTareas.delete('/:id', eliminar);
