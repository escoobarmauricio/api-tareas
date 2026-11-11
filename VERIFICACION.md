# Verificación del proyecto

Actualizado: 11 de noviembre de 2026.

- `npm run build`: correcto, TypeScript compiló sin errores.
- `npm test`: 15 pruebas aprobadas y 0 fallidas.
- Las pruebas usaron Express y un proceso MongoDB temporal real, aislado de Atlas.
- Se verificaron registro, hash Bcrypt, login, contenido y vencimiento del JWT,
  protección de POST/PUT/DELETE, CRUD persistido y validaciones.
- Se verificaron los códigos 200, 201, 400, 401, 404 y 500. Para el 500 se simuló
  una falla del repositorio dentro de la prueba, sin agregar rutas a la API.
- La última prueba recorrió las 16 peticiones del archivo de Thunder Client y
  comprobó sus códigos HTTP esperados.

## Verificación manual y entrega

- Se configuró el `.env` local y se conectó la API con MongoDB Atlas.
- Tras recuperar la entrega final se repitieron compilación y 15 pruebas con éxito.
- Se comprobó nuevamente registro, login, CRUD persistido y errores 400/401/404
  contra Atlas con datos temporales, que se eliminaron al finalizar.
- Se probaron registro, login y CRUD en Thunder Client contra Atlas.
- Se comprobó la persistencia de los cambios y la eliminación de tareas.
- Se comprobaron los errores 400, 401 y 404, incluidas las dos reglas de negocio.
- Se importó la colección y se exportó desde Thunder Client como
  `thunder-client/coleccion-final.json`, sin credenciales de Atlas ni tokens reales.
- El repositorio se publicó en https://github.com/escoobarmauricio/api-tareas.
- El profesor debe configurar su propio `.env` si ejecuta el proyecto en su equipo.

## Correspondencia con la consigna

| Requisito | Ubicación |
| --- | --- |
| Node.js, Express, TypeScript y componentes | `package.json`, `tsconfig.json`, `src/components` |
| MongoDB con Mongoose y dos modelos | `server.ts`, `user.model.ts`, `task.model.ts` |
| CRUD completo | `task.routes.ts` y sus capas |
| Rutas, controlador, servicio y acceso a datos | Cada componente tiene archivos separados |
| Dos reglas de negocio en servicio | `task.service.ts` |
| Registro y login con Bcrypt y JWT | `user.service.ts` |
| Middleware JWT en escrituras | `middlewares/auth.ts`, `task.routes.ts` |
| Códigos HTTP | Controladores y `error-handler.ts` |
| try/catch en todos los controladores | `user.controller.ts`, `task.controller.ts` |
| Variables de entorno | `config.ts`, `.env.example`, `.gitignore` |
| README y endpoints | `README.md` |
| Colección de pruebas y errores | `thunder-client/coleccion-final.json`, `thunder-client/GUIA.md` |

No se incluyeron extras opcionales.
