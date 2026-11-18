# Stack Tecnológico

Documento que describe lenguajes, frameworks, herramientas e infraestructura del proyecto. Las versiones se basan en la lectura de archivos de configuración; para verificar que están instaladas correctamente, consultar [operacion basica](./README.md#operacion-basica).

## Frontend

| Elemento | Versión / Dependencia | Fuente | Propósito |
| --- | --- | --- | --- |
| **Lenguaje** | TypeScript ~6.0.2 | [package.json](../frontend/package.json) | Tipado estático para JavaScript |
| **Runtime** | Node.js 24-alpine | [frontend/Dockerfile](../frontend/Dockerfile) | Contenedor base para construcción y desarrollo |
| **Framework UI** | React 19.2.4 | [package.json](../frontend/package.json) | Framework de componentes para la interfaz |
| **Build & Dev Server** | Vite 8.0.4 | [package.json](../frontend/package.json), [vite.config.ts](../frontend/vite.config.ts) | Empaquetador y servidor de desarrollo con soporte ES modules; proxy de `/api` a `http://backend:8000` |
| **Styling** | Tailwind CSS 4.2.2 | [package.json](../frontend/package.json), [vite.config.ts](../frontend/vite.config.ts) | Framework CSS utilities; integrado en Vite mediante plugin |
| **Utilidades CSS** | tailwind-merge 3.5.0, clsx 2.1.1 | [package.json](../frontend/package.json) | Composición de clases Tailwind; manejo condicional |
| **Gráficas** | Recharts 3.8.1 | [package.json](../frontend/package.json) | Componentes de gráficas reactivos usados en [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) y [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx) |
| **Iconos** | lucide-react 1.8.0 | [package.json](../frontend/package.json) | Librería de iconos SVG |
| **Variantes de componentes** | class-variance-authority 0.7.1 | [package.json](../frontend/package.json) | Patrón de variantes para componentes reutilizables |

### Testing y Calidad (Frontend)

| Herramienta | Versión | Fuente | Uso |
| --- | --- | --- | --- |
| Vitest | 4.1.4 | [package.json](../frontend/package.json) | Framework de testing rápido compatible con Vite |
| @vitest/coverage-v8 | 4.1.4 | [package.json](../frontend/package.json) | Cobertura de tests |
| ESLint | 9.39.4 | [package.json](../frontend/package.json), [eslint.config.js](../frontend/eslint.config.js) | Linting de JavaScript/TypeScript |
| typescript-eslint | 8.58.0 | [package.json](../frontend/package.json) | Reglas ESLint para TypeScript |
| eslint-plugin-react-hooks | 7.0.1 | [package.json](../frontend/package.json) | Linting de hooks de React |

**Comando de tests:** `npm run test` (ver [package.json](../frontend/package.json) scripts)

### Configuración (Frontend)

| Archivo | Propósito |
| --- | --- |
| [vite.config.ts](../frontend/vite.config.ts) | Configuración de Vite: plugins de React y Tailwind, proxy a backend, alias `@` → `frontend/src` |
| [tsconfig.json](../frontend/tsconfig.json) | Referencias a [tsconfig.app.json](../frontend/tsconfig.app.json) y [tsconfig.node.json](../frontend/tsconfig.node.json) |
| [eslint.config.js](../frontend/eslint.config.js) | Configuración de linting |

## Backend

| Elemento | Versión / Dependencia | Fuente | Propósito |
| --- | --- | --- | --- |
| **Lenguaje** | Python 3.13-slim | [backend/Dockerfile](../backend/Dockerfile) | Contenedor base; versión slim para reducir tamaño |
| **Framework Web** | FastAPI | [requirements.txt](../backend/requirements.txt) | Framework asincrónico para APIs REST; genera documentación interactiva en `/docs` |
| **ASGI Server** | uvicorn[standard] | [requirements.txt](../backend/requirements.txt) | Servidor ASGI para FastAPI |
| **Validación de datos** | Pydantic (incluido en FastAPI) | [routes.py](../backend/app/routes.py) | Define modelos como `FinancialMovement`, `MetricsFacets`, etc. |
| **Debugger** | debugpy | [requirements.txt](../backend/requirements.txt), [backend/Dockerfile](../backend/Dockerfile) | Permite attach en puerto 5678 |

### Testing y Calidad (Backend)

| Herramienta | Versión | Fuente | Uso |
| --- | --- | --- | --- |
| pytest | (en requirements.txt) | [requirements.txt](../backend/requirements.txt) | Framework de testing |
| pytest-cov | (en requirements.txt) | [requirements.txt](../backend/requirements.txt) | Plugin para cobertura de tests |
| httpx | (en requirements.txt) | [requirements.txt](../backend/requirements.txt) | Cliente HTTP para pruebas; usado en [test_routes.py](../backend/tests/test_routes.py) |

**Comando de tests:** `pytest` desde `/backend` (referenciado en [reglas de testing](../.agents/rules/testing.md))

### Estructura del Backend

| Ruta | Contenido |
| --- | --- |
| [app/main.py](../backend/app/main.py) | Punto de entrada; importa rutas |
| [app/routes.py](../backend/app/routes.py) | Modelos Pydantic, generación de movimientos simulados, funciones de filtrado y cálculo, endpoints REST |
| [tests/](../backend/tests) | Pruebas unitarias |
| [requirements.txt](../backend/requirements.txt) | Dependencias de Python |

## Infraestructura

| Componente | Especificación | Fuente |
| --- | --- | --- |
| **Containerización** | Docker | [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile) |
| **Orquestación** | Docker Compose | [docker-compose.yml](../docker-compose.yml) |
| **Frontend port** | 5173 | [docker-compose.yml](../docker-compose.yml), [frontend/Dockerfile](../frontend/Dockerfile) |
| **Backend port** | 8000 (API), 5678 (debugpy) | [docker-compose.yml](../docker-compose.yml), [backend/Dockerfile](../backend/Dockerfile) |
| **Volúmenes** | Hot reload para frontend y backend | [docker-compose.yml](../docker-compose.yml) |
| **Dependencias de servicio** | Frontend depende de backend | [docker-compose.yml](../docker-compose.yml) |

**Inicio:** `docker compose up --build -d` (ver [reglas de operación](../.agents/rules/operations.md))

## Resumen de lenguajes y versiones

| Lenguaje | Versión | Contexto |
| --- | --- | --- |
| TypeScript | ~6.0.2 | Frontend |
| JavaScript | ES modules (via Vite) | Frontend |
| Python | 3.13-slim | Backend |
| Node.js | 24-alpine | Frontend (Docker) |

## Notas

- El frontend usa el plugin `@tailwindcss/vite` en lugar de PostCSS tradicional.
- El proxy de Vite enrutiza `/api/*` a `http://backend:8000`; configurado en [vite.config.ts](../frontend/vite.config.ts).
- El backend inicia con `debugpy` escuchando en puerto 5678, permitiendo attach remoto.
- Las pruebas de frontend no ejecutan un navegador; usan Vitest. Las pruebas de backend usan `TestClient` de FastAPI.
- Ninguna herramienta de linting o testing está configurada para ejecutarse automáticamente en commits; requiere invocación manual.
