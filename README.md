# API REST de tareas

Trabajo práctico integrador de Node.js. API individual con usuarios y tareas,
construida con Node.js, Express, TypeScript, MongoDB Atlas, Mongoose, Bcrypt y JWT.

## Requisitos

- Node.js 22 o superior y npm.
- Un clúster de MongoDB Atlas y su cadena de conexión.
- Thunder Client en VS Code para las pruebas manuales.

## Instalación y ejecución

1. Abrir una terminal dentro de esta carpeta y ejecutar `npm ci`.
2. Copiar `.env.example` como `.env`.
3. Completar `MONGO_URI` con la cadena de Atlas, incluyendo el nombre de la base
   (por ejemplo, `api_tareas`). En Atlas hay que crear un usuario de base de datos
   y habilitar la IP desde la que se ejecuta el proyecto.
4. Completar `JWT_SECRET` con un secreto aleatorio de al menos 32 caracteres.
   Se puede generar con:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

5. Configurar `PORT=3000` o dejarlo vacío para usar ese puerto.
6. Ejecutar `npm run dev`. La API inicia después de conectarse a MongoDB.

Para compilar y ejecutar sin el modo de desarrollo:

```sh
npm run build
npm start
```

El archivo `.env` se excluye de Git. No publicar credenciales, tokens ni cadenas
de conexión. `.env.example` incluye solo los nombres de las variables.

## Organización

```text
src/
  app.ts                 Configura Express y monta las rutas
  server.ts              Conecta MongoDB e inicia el servidor
  config.ts              Lee y verifica las variables de entorno
  components/
    users/               Modelo, rutas, controlador, servicio y repositorio
    tasks/               Modelo, rutas, controlador, servicio y repositorio
  middlewares/           Autenticación y manejo centralizado de errores
  shared/                Error HTTP y validaciones reutilizables
tests/                   Pruebas automatizadas
thunder-client/          Colección y guía de pruebas manuales
```

Una petición sigue este recorrido: **ruta → controlador → servicio → repositorio
→ MongoDB**. El controlador maneja HTTP; el servicio valida y aplica las reglas;
el repositorio consulta la base; el modelo define los datos persistidos.
Todos los controladores tienen `try/catch` y derivan errores al middleware común.

## Modelos

**User:** `name`, `email` único y `password` hasheada con Bcrypt (10 rondas).
El email se normaliza a minúsculas. La contraseña exige al menos 8 caracteres
y un máximo de 72 bytes UTF-8. La API nunca devuelve la contraseña ni su hash.

**Task:** `title` (1 a 120 caracteres), `priority` (`baja`, `media` o `alta`),
`dueDate` (fecha límite) y `completed` (booleano, inicialmente `false`).
MongoDB genera `_id` para ambos modelos.

### Reglas de negocio en el servicio

1. La prioridad solo puede ser `baja`, `media` o `alta`.
2. Al crear una tarea, su fecha límite no puede ser anterior al día actual UTC.

Las fechas se envían como `YYYY-MM-DD`, deben existir en el calendario y se
guardan a medianoche UTC. La respuesta muestra el formato ISO de MongoDB.
Al modificar se permiten fechas pasadas para poder completar tareas vencidas.

## Endpoints

URL base: `http://localhost:3000`.

| Método | Ruta | Token | Éxito | Acción |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | No | 201 | Registrar usuario |
| POST | `/api/auth/login` | No | 200 | Obtener JWT |
| GET | `/api/tasks` | No | 200 | Listar tareas |
| GET | `/api/tasks/:id` | No | 200 | Buscar tarea |
| POST | `/api/tasks` | Sí | 201 | Crear tarea |
| PUT | `/api/tasks/:id` | Sí | 200 | Reemplazar campos de una tarea |
| DELETE | `/api/tasks/:id` | Sí | 200 | Eliminar tarea |

Registro:

```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "password": "ClavePrueba123!"
}
```

Login:

```json
{
  "email": "ana@example.com",
  "password": "ClavePrueba123!"
}
```

El login responde `{ "token": "..." }`. Para las escrituras, enviarlo como
cabecera `Authorization: Bearer TU_TOKEN`. El JWT vence en una hora y contiene
solo el ID del usuario (`sub`) y las marcas de emisión y vencimiento.

Crear una tarea:

```json
{
  "title": "Estudiar Node.js",
  "priority": "alta",
  "dueDate": "2099-12-31"
}
```

Modificar con `PUT` exige los cuatro campos completos:

```json
{
  "title": "Estudiar Node.js",
  "priority": "media",
  "dueDate": "2099-12-31",
  "completed": true
}
```

Los campos adicionales no se guardan. Las tareas son compartidas: cualquier
persona puede consultarlas y cualquier usuario autenticado puede escribirlas.
No se implementan extras de roles, filtros, propietarios ni logging.
No se requiere una interfaz web para usar esta API.

### Respuestas de error

Todas tienen la forma `{ "message": "Descripción del error" }`.

| Código | Situación |
| --- | --- |
| 400 | Datos inválidos, ID mal formado, email duplicado o JSON inválido |
| 401 | Credenciales incorrectas, token ausente, inválido o vencido |
| 404 | ID válido sin tarea asociada o ruta inexistente |
| 500 | Error interno inesperado, sin exponer detalles al cliente |

Eliminar responde `200` con `{ "message": "Tarea eliminada" }`.

## Pruebas

```sh
npm test
```

Las pruebas levantan un proceso MongoDB temporal y aislado usando
`mongodb-memory-server`; no usan ni modifican la base de Atlas. La primera
ejecución necesita Internet para descargar el binario de MongoDB.
Comprueban autenticación, contraseñas hasheadas, persistencia del CRUD,
validaciones, JWT vencidos y códigos 400, 401, 404 y 500.
El error 500 se prueba simulando una falla de acceso a datos solo dentro del test;
no existe una ruta de producción que provoque errores deliberadamente.

La colección y los pasos de Thunder Client están en
[`thunder-client/GUIA.md`](thunder-client/GUIA.md).

## Entrega final

El proyecto incluye los requisitos obligatorios de la consigna y la colección
`thunder-client/coleccion-final.json`, exportada y probada en Thunder Client.
La correspondencia de los requisitos con los archivos está en `VERIFICACION.md`.
No se incluyeron los extras opcionales.

Para repetir las pruebas manuales en otra computadora, configurar un `.env`
propio y las variables del entorno indicadas en `thunder-client/GUIA.md`.
No compartir `.env`, tokens ni credenciales. `node_modules` y `dist` se generan
localmente con los comandos de instalación y compilación.
