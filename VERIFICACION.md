# Punto de control 1

Alcance: proyecto Node.js con TypeScript y Express, conexión a MongoDB con
Mongoose y cinco endpoints del CRUD de tareas. No hay registro, login ni tokens.

`npm run build` comprueba la compilación. `npm test` recorre las siete peticiones
de la colección del CRUD y comprueba que los cambios se guardan y que una tarea
eliminada deja de existir. Usa un MongoDB temporal aislado de Atlas.

Las pruebas manuales previas comprobaron el acceso a Atlas; al presentar esta
versión hay que reiniciar el servidor y usar la colección `punto-control-1.json`.
