# Reglas de operación

## Arranque con Compose

- **Alcance:** ejecución local integrada del frontend y backend.
- **Justificación:** [docker-compose.yml](../../docker-compose.yml) publica el frontend en el puerto 5173 y el backend en el 8000.
- **Guía:** desde la raíz, inicia los servicios y comprueba su estado:

  ```bash
  docker compose up --build -d
  docker compose ps -a
  ```

  En Codespaces, abre el puerto 5173 desde **Ports**.

## Cargador de configuración de Vite

- **Alcance:** cambios al arranque del contenedor frontend o a la configuración de Vite.
- **Justificación:** [frontend/Dockerfile](../../frontend/Dockerfile) selecciona `--configLoader runner` y [vite.config.ts](../../frontend/vite.config.ts) usa `import.meta.url`. En el entorno observado, el cargador predeterminado falló con `TypeError: Cannot convert undefined or null to object`.
- **Guía:** conserva `runner` salvo que verifiques una alternativa; no generalices ese fallo observado a todos los entornos.

## Diagnóstico de servicios

- **Alcance:** fallos de arranque o de conexión entre servicios.
- **Justificación:** [docker-compose.yml](../../docker-compose.yml) declara servicios separados para frontend y backend; [App.tsx](../../frontend/src/App.tsx) depende de `/api/metrics` para cargar los datos.
- **Guía:** revisa el estado y los logs antes de atribuir el fallo a la interfaz:

  ```bash
  docker compose ps -a
  docker compose logs --tail=80 frontend
  docker compose logs --tail=80 backend
  ```

  Si la página carga pero no llegan datos, verifica además el backend y la ruta proxificada según [Testing](./testing.md).
