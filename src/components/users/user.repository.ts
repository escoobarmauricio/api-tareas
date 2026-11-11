import { Usuario } from './user.model';

export const repositorioUsuarios = {
  buscarPorEmail: (email: string) => Usuario.findOne({ email }).select('+password').exec(),
  crear: (datos: { name: string; email: string; password: string }) => Usuario.create(datos),
};
