# Pruebas del primer punto de control

1. Iniciar la API con `npm run dev`.
2. Importar `punto-control-1.json` en Thunder Client (formato Postman 2.1).
3. Crear un entorno llamado `Pruebas CRUD` y activarlo.
4. Agregar `baseUrl` con valor `http://localhost:3000` y `taskId` vacío.
5. Ejecutar las peticiones en orden.
6. Después de crear la tarea, copiar el `_id` recibido en `taskId` y guardar.

No se necesita token. El código del nombre de cada petición indica la respuesta
esperada. Después de modificar, comprobar `completed: true` al consultarla.
La última petición debe responder 404 porque se acaba de eliminar la tarea.
