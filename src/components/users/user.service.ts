import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configuracion } from '../../config';
import { ErrorHttp } from '../../shared/http-error';
import { cuerpoObjeto, texto } from '../../shared/validation';
import { repositorioUsuarios } from './user.repository';

function credenciales(cuerpo: Record<string, unknown>) {
  const email = texto(cuerpo.email, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErrorHttp(400, 'Email inválido');
  }
  // Bcrypt utiliza hasta 72 bytes: se rechazan contraseñas que excedan ese límite.
  if (typeof cuerpo.password !== 'string' || cuerpo.password.length < 8 ||
      Buffer.byteLength(cuerpo.password, 'utf8') > 72) {
    throw new ErrorHttp(400, 'La contraseña debe tener al menos 8 caracteres y hasta 72 bytes');
  }
  return { email, contrasena: cuerpo.password };
}

export const servicioUsuarios = {
  async registrar(entrada: unknown) {
    const cuerpo = cuerpoObjeto(entrada);
    const nombre = texto(cuerpo.name, 'name', 80);
    const { email, contrasena } = credenciales(cuerpo);
    if (await repositorioUsuarios.buscarPorEmail(email)) {
      throw new ErrorHttp(400, 'El email ya está registrado');
    }
    const usuario = await repositorioUsuarios.crear({
      name: nombre, email, password: await bcrypt.hash(contrasena, 10),
    });
    return { _id: usuario.id, name: usuario.name, email: usuario.email };
  },

  async iniciarSesion(entrada: unknown) {
    const { email, contrasena } = credenciales(cuerpoObjeto(entrada));
    const usuario = await repositorioUsuarios.buscarPorEmail(email);
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.password))) {
      throw new ErrorHttp(401, 'Email o contraseña incorrectos');
    }
    const token = jwt.sign({}, configuracion.secretoJwt, {
      subject: usuario.id, algorithm: 'HS256', expiresIn: '1h',
    });
    return { token };
  },
};
