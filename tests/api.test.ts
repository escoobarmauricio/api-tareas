import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Solo las pruebas usan esta base temporal y este secreto efímero.
process.env.MONGO_URI = 'mongodb://127.0.0.1/test';
process.env.JWT_SECRET = randomBytes(32).toString('hex');
let aplicacion: typeof import('../src/app')['aplicacion'];
let Usuario: typeof import('../src/components/users/user.model')['Usuario'];
let repositorioTareas: typeof import('../src/components/tasks/task.repository')['repositorioTareas'];
let mongoTemporal: MongoMemoryServer;
let token: string;
let idTarea: string;
const idInexistente = new mongoose.Types.ObjectId().toString();
const credenciales = { email: 'ana@example.com', password: 'ClavePrueba123!' };
const tarea = { title: 'Estudiar Node.js', priority: 'alta', dueDate: '2099-12-31' };
const autorizacion = () => ({ Authorization: `Bearer ${token}` });

before(async () => {
  ({ aplicacion } = await import('../src/app'));
  ({ Usuario } = await import('../src/components/users/user.model'));
  ({ repositorioTareas } = await import('../src/components/tasks/task.repository'));
  mongoTemporal = await MongoMemoryServer.create();
  await mongoose.connect(mongoTemporal.getUri());
  await Usuario.init();
}, { timeout: 180000 });

after(async () => {
  await mongoose.disconnect();
  await mongoTemporal?.stop();
});

test('registro: 201, contraseña hasheada y sin secretos en la respuesta', async () => {
  const respuesta = await request(aplicacion).post('/api/auth/register').send({ name: 'Ana', ...credenciales }).expect(201);
  assert.equal(respuesta.body.email, credenciales.email);
  assert.equal(respuesta.body.password, undefined);
  const usuario = await Usuario.findOne({ email: credenciales.email }).select('+password');
  assert.ok(usuario);
  assert.notEqual(usuario.password, credenciales.password);
  assert.equal(await bcrypt.compare(credenciales.password, usuario.password), true);
});

test('registro: duplicado, email incorrecto y contraseña corta dan 400', async () => {
  for (const datos of [
    { name: 'Ana', ...credenciales },
    { name: 'Ana', ...credenciales, email: 'invalido' },
    { name: 'Ana', ...credenciales, password: '123' },
  ]) await request(aplicacion).post('/api/auth/register').send(datos).expect(400);
});

test('login: 200 y JWT con ID y vencimiento, sin datos sensibles', async () => {
  const respuesta = await request(aplicacion).post('/api/auth/login').send(credenciales).expect(200);
  token = respuesta.body.token;
  const contenidoToken = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
  assert.deepEqual(Object.keys(contenidoToken).sort(), ['exp', 'iat', 'sub']);
  assert.equal(contenidoToken.exp! - contenidoToken.iat!, 3600);
});

test('login: credenciales incorrectas dan 401', async () => {
  await request(aplicacion).post('/api/auth/login').send({ ...credenciales, password: 'Incorrecta123' }).expect(401);
  await request(aplicacion).post('/api/auth/login').send({ ...credenciales, email: 'nadie@example.com' }).expect(401);
});

test('POST, PUT y DELETE exigen JWT válido', async () => {
  const vencido = jwt.sign({}, process.env.JWT_SECRET!, { subject: idInexistente, expiresIn: -1 });
  const falsificado = jwt.sign({}, 'otro-secreto', { subject: idInexistente });
  for (const metodo of ['post', 'put', 'delete'] as const) {
    const ruta = metodo === 'post' ? '/api/tasks' : `/api/tasks/${idInexistente}`;
    for (const valor of ['', 'Bearer invalido', `Bearer ${vencido}`, `Bearer ${falsificado}`]) {
      await request(aplicacion)[metodo](ruta).set('Authorization', valor).send(tarea).expect(401);
    }
  }
});

test('crear: 201, valor por defecto y persistencia', async () => {
  const respuesta = await request(aplicacion).post('/api/tasks').set(autorizacion()).send(tarea).expect(201);
  idTarea = respuesta.body._id;
  assert.equal(respuesta.body.completed, false);
  assert.equal(respuesta.body.title, tarea.title);
});

test('listar y buscar por ID: 200 sin autenticación', async () => {
  const respuestaLista = await request(aplicacion).get('/api/tasks').expect(200);
  assert.equal(respuestaLista.body.length, 1);
  const respuesta = await request(aplicacion).get(`/api/tasks/${idTarea}`).expect(200);
  assert.equal(respuesta.body._id, idTarea);
});

test('reglas y tipos incorrectos dan 400', async () => {
  for (const datos of [
    { ...tarea, priority: 'urgente' },
    { ...tarea, dueDate: '2000-01-01' },
    { ...tarea, dueDate: '2099-02-30' },
    { ...tarea, dueDate: 'mañana' },
    { ...tarea, title: ' ' },
    { ...tarea, completed: 'false' },
    null, [],
  ]) await request(aplicacion).post('/api/tasks').set(autorizacion()).send(datos).expect(400);
});

test('la fecha actual UTC se acepta', async () => {
  const respuesta = await request(aplicacion).post('/api/tasks').set(autorizacion())
    .send({ ...tarea, dueDate: new Date().toISOString().slice(0, 10) }).expect(201);
  await request(aplicacion).delete(`/api/tasks/${respuesta.body._id}`).set(autorizacion()).expect(200);
});

test('PUT reemplaza campos, ignora operadores y permite completar una tarea vencida', async () => {
  await request(aplicacion).put(`/api/tasks/${idTarea}`).set(autorizacion()).send({ completed: true }).expect(400);
  await request(aplicacion).put(`/api/tasks/${idTarea}`).set(autorizacion())
    .send({ ...tarea, completed: true, priority: 'urgente' }).expect(400);
  const respuesta = await request(aplicacion).put(`/api/tasks/${idTarea}`).set(autorizacion()).send({
    ...tarea, title: 'Terminada', completed: true, dueDate: '2000-01-01',
    $set: { title: 'No permitido' },
  }).expect(200);
  assert.equal(respuesta.body.title, 'Terminada');
  assert.equal(respuesta.body.completed, true);
  const guardada = await request(aplicacion).get(`/api/tasks/${idTarea}`).expect(200);
  assert.equal(guardada.body.title, 'Terminada');
});

test('ID mal formado: 400; ID válido inexistente: 404 en GET, PUT y DELETE', async () => {
  for (const metodo of ['get', 'put', 'delete'] as const) {
    await request(aplicacion)[metodo]('/api/tasks/mal-id').set(autorizacion()).send({ ...tarea, completed: false }).expect(400);
    await request(aplicacion)[metodo](`/api/tasks/${idInexistente}`).set(autorizacion()).send({ ...tarea, completed: false }).expect(404);
  }
});

test('JSON roto, cuerpo grande y rutas desconocidas tienen respuestas claras', async () => {
  await request(aplicacion).post('/api/auth/login').set('Content-Type', 'application/json').send('{').expect(400);
  await request(aplicacion).post('/api/auth/login').send({ value: 'x'.repeat(20000) }).expect(400);
  await request(aplicacion).get('/ruta-inexistente').expect(404);
});

test('un fallo de acceso a datos responde 500 sin filtrar detalles internos', async (prueba) => {
  const simulacion = prueba.mock.method(repositorioTareas, 'buscarTodas', () => { throw new Error('detalle privado'); });
  try {
    const respuesta = await request(aplicacion).get('/api/tasks').expect(500);
    assert.deepEqual(respuesta.body, { message: 'Error interno del servidor' });
  } finally {
    simulacion.mock.restore();
  }
});

test('eliminar: 200 y la tarea deja de existir', async () => {
  await request(aplicacion).delete(`/api/tasks/${idTarea}`).set(autorizacion()).expect(200);
  await request(aplicacion).get(`/api/tasks/${idTarea}`).expect(404);
  const respuesta = await request(aplicacion).get('/api/tasks').expect(200);
  assert.deepEqual(respuesta.body, []);
});

test('las 16 peticiones de la colección cumplen los estados esperados', async () => {
  await Usuario.deleteMany({});
  const coleccion = JSON.parse(readFileSync('thunder-client/coleccion-final.json', 'utf8'));
  let tokenColeccion = '';
  let idTareaColeccion = '';
  for (const elemento of coleccion.requests) {
    const ruta = elemento.url.replace('{{baseUrl}}', '').replace('{{taskId}}', idTareaColeccion);
    const metodo = elemento.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
    const solicitud = request(aplicacion)[metodo](ruta);
    for (const cabecera of elemento.headers) {
      solicitud.set(cabecera.name, cabecera.value.replace('{{token}}', tokenColeccion));
    }
    if (elemento.body) {
      const contenido = Array.isArray(elemento.body.raw)
        ? elemento.body.raw.join('\n') : elemento.body.raw;
      solicitud.send(JSON.parse(contenido));
    }
    const respuesta = await solicitud;
    assert.equal(respuesta.status, Number(elemento.name.match(/- (\d{3})$/)?.[1]), elemento.name);
    if (elemento.url.endsWith('/login') && respuesta.status === 200) tokenColeccion = respuesta.body.token;
    if (elemento.method === 'POST' && elemento.url.endsWith('/tasks') && respuesta.status === 201) {
      idTareaColeccion = respuesta.body._id;
    }
  }
});
