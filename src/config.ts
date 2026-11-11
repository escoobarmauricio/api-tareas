import 'dotenv/config';

function requerido(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor?.trim()) throw new Error(`Falta configurar ${nombre} en .env`);
  return valor;
}

export const configuracion = {
  uriMongo: requerido('MONGO_URI'),
  secretoJwt: requerido('JWT_SECRET'),
  puerto: Number(process.env.PORT || 3000),
};

if (configuracion.secretoJwt.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
}
if (!Number.isInteger(configuracion.puerto) || configuracion.puerto < 1 || configuracion.puerto > 65535) {
  throw new Error('PORT debe ser un entero entre 1 y 65535');
}
