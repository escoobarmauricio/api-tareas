import { Router } from 'express';
import { autenticar } from '../../middlewares/auth';
import { crear, obtener, listar, eliminar, actualizar } from './task.controller';

export const rutasTareas = Router();
rutasTareas.get('/', listar);
rutasTareas.get('/:id', obtener);
rutasTareas.post('/', autenticar, crear);
rutasTareas.put('/:id', autenticar, actualizar);
rutasTareas.delete('/:id', autenticar, eliminar);
