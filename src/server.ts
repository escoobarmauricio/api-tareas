import mongoose from 'mongoose';
import { aplicacion } from './app';
import { configuracion } from './config';

async function iniciar() {
  await mongoose.connect(configuracion.uriMongo, { serverSelectionTimeoutMS: 10000 });
  aplicacion.listen(configuracion.puerto, () => {
    console.log(`API disponible en http://localhost:${configuracion.puerto}`);
  });
}

iniciar().catch(() => {
  console.error('No se pudo iniciar la API. Revisá la conexión y la configuración.');
  process.exit(1);
});
