import express from 'express';
import { rutasTareas } from './components/tasks/task.routes';
import { manejarErrores } from './middlewares/error-handler';

export const aplicacion = express();
aplicacion.disable('x-powered-by');
aplicacion.use(express.json({ limit: '16kb' }));
aplicacion.use('/api/tasks', rutasTareas);
aplicacion.use((_peticion, respuesta) => { respuesta.status(404).json({ message: 'Ruta no encontrada' }); });
aplicacion.use(manejarErrores);
