import { Router } from 'express';
import { iniciarSesion, registrar } from './user.controller';

export const rutasUsuarios = Router();
rutasUsuarios.post('/register', registrar);
rutasUsuarios.post('/login', iniciarSesion);
