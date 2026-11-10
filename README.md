# API de tareas - Punto de control 1

Primer avance del TP integrador de Node.js: proyecto creado, conexión a MongoDB
Atlas y CRUD de tareas funcionando. Implementado con Node.js, Express,
TypeScript y Mongoose.

## Ejecutar

1. Instalar Node.js 22 o superior.
2. Ejecutar `npm ci` en esta carpeta.
3. Copiar `.env.example` como `.env` y completar `MONGO_URI` con la conexión
   propia a Atlas, incluyendo el nombre de la base `api_tareas`. En Atlas,
   configurar un usuario de base de datos y habilitar la IP de conexión.
4. Usar `PORT=3000` o dejarlo vacío para usar ese puerto.
5. Ejecutar `npm run dev`. El servidor inicia después de conectarse a MongoDB.

El `.env` personal y `node_modules` quedan fuera de Git.
Para compilar: `npm run build`. Para ejecutar lo compilado: `npm start`.

## Organización

Los archivos de tareas están en `src/components/tasks`.
La petición pasa por rutas, controlador, servicio y repositorio.
El modelo define los campos que se guardan en MongoDB.
`src/server.ts` conecta la base e inicia el servidor;
`src/config.ts` lee la configuración del `.env`.

## CRUD

URL base: `http://localhost:3000`.

| Método | Ruta | Acción | Éxito |
| --- | --- | --- | --- |
| GET | `/api/tasks` | Listar todas las tareas | 200 |
| GET | `/api/tasks/:id` | Buscar una tarea | 200 |
| POST | `/api/tasks` | Crear una tarea | 201 |
| PUT | `/api/tasks/:id` | Modificar una tarea | 200 |
| DELETE | `/api/tasks/:id` | Eliminar una tarea | 200 |

Esta etapa no requiere autenticación. Para crear una tarea, enviar JSON:

```json
{
  "title": "Estudiar Node.js",
  "priority": "alta",
  "dueDate": "2099-12-31"
}
```

`completed` es `false` inicialmente. Para modificar con PUT, enviar los cuatro
campos completos: `title`, `priority`, `dueDate` y `completed`.
La prioridad puede ser `baja`, `media` o `alta`. La fecha se envía como
`YYYY-MM-DD`, debe ser una fecha válida y se guarda en UTC.
Los datos inválidos responden 400; las tareas inexistentes, 404.
Los errores internos responden 500 sin exponer detalles al cliente.

## Probar

`npm test` verifica el CRUD con un MongoDB temporal, sin modificar Atlas.
La primera ejecución puede descargar el binario de MongoDB y necesita Internet.

Para probar manualmente, importar `thunder-client/punto-control-1.json` en
Thunder Client. Las instrucciones están en `thunder-client/GUIA.md`.
