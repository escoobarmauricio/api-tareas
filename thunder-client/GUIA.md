# Pruebas con Thunder Client

1. Iniciar la API con un `.env` válido y `npm run dev`.
2. En Thunder Client, abrir Collections e importar `coleccion-final.json`.
3. Crear y seleccionar un entorno con estas variables:

   | Variable | Valor inicial |
   | --- | --- |
   | baseUrl | `http://localhost:3000` |
   | token | Vacío |
   | taskId | Vacío |

4. Ejecutar las peticiones en el orden de su nombre.
5. Después de **02 Login**, copiar el campo `token` de la respuesta a la variable
   `token` del entorno, sin comillas ni el prefijo Bearer.
6. Después de **03 Crear tarea**, copiar `_id` de la respuesta a `taskId`.

Los nombres de las peticiones indican el estado esperado. La colección incluye
los siete endpoints y los errores 400, 401 y 404. Usa datos de ejemplo y ningún
token real. Para repetir el registro, usar otro email en registro y login, o
esperar 400 por email duplicado si el usuario ya existe.

La fecha de ejemplo es `2099-12-31`. Cambiarla si fuera necesario. La petición
de fecha pasada usa `2000-01-01` y debe fallar con 400.

En **07 Modificar**, verificar `completed: true`; en **08 Consultar cambio**,
verificar que el cambio persistió. Después de **15 Eliminar**, **16 Buscar
eliminada** debe devolver 404.

La colección `coleccion-final.json` fue exportada desde Thunder Client después
de comprobar el CRUD, registro, login, validaciones y errores en la interfaz
contra MongoDB Atlas. Es el archivo que hay que importar para repetir las pruebas.

Las variables del entorno se completan en cada computadora. Usar un nombre de
entorno como `Pruebas API`; `Local` y `Global` son nombres reservados de Thunder
Client. La variable de dirección se llama exactamente `baseUrl`.
