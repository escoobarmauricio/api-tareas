import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.MONGO_URI = 'mongodb://127.0.0.1/test';
let aplicacion: typeof import('../src/app')['aplicacion'];
let mongoTemporal: MongoMemoryServer;

before(async () => {
  ({ aplicacion } = await import('../src/app'));
  mongoTemporal = await MongoMemoryServer.create();
  await mongoose.connect(mongoTemporal.getUri());
}, { timeout: 180000 });

after(async () => {
  await mongoose.disconnect();
  await mongoTemporal?.stop();
});

test('CRUD completo sin token: crear, listar, buscar, modificar y eliminar', async () => {
  const coleccion = JSON.parse(readFileSync('thunder-client/punto-control-1.json', 'utf8'));
  let idTarea = '';
  for (const elemento of coleccion.item) {
    const datos = elemento.request;
    const ruta = datos.url.raw.replace('{{baseUrl}}', '').replace('{{taskId}}', idTarea);
    const metodo = datos.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
    const solicitud = request(aplicacion)[metodo](ruta);
    if (datos.body) solicitud.send(JSON.parse(datos.body.raw));
    const respuesta = await solicitud;
    assert.equal(respuesta.status, Number(elemento.name.match(/- (\d{3})$/)?.[1]), elemento.name);
    if (metodo === 'post') {
      idTarea = respuesta.body._id;
      assert.ok(idTarea);
      assert.equal(respuesta.body.completed, false);
    }
    if (metodo === 'get' && Array.isArray(respuesta.body)) {
      assert.equal(respuesta.body.length, 1);
      assert.equal(respuesta.body[0]._id, idTarea);
    }
    if (elemento.name.startsWith('05')) assert.equal(respuesta.body.completed, true);
  }
  const lista = await request(aplicacion).get('/api/tasks').expect(200);
  assert.deepEqual(lista.body, []);
});

test('datos inválidos y recursos inexistentes tienen respuestas claras', async () => {
  await request(aplicacion).post('/api/tasks').send({}).expect(400);
  await request(aplicacion).get('/api/tasks/id-invalido').expect(400);
  await request(aplicacion).get('/ruta-inexistente').expect(404);
});
