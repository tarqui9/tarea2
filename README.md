# FinanzaPro

Gestor de finanzas personales y metas de ahorro con analíticas.

- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, cors, dotenv
- **Base de datos:** MongoDB Atlas (conexión online por URI)
- **Frontend:** React + Vite, Tailwind CSS, Lucide-React, Axios
- **Infraestructura:** Docker y Docker Compose (`backend` + `frontend` → MongoDB Atlas)

## Estructura

```
finanzapro/
├── docker-compose.yml
├── .env.example
├── backend/    config/ models/ controllers/ routes/ middleware/ server.js Dockerfile
└── frontend/   src/{components,pages,context,services,utils} Dockerfile nginx.conf
```

## Puesta en marcha con Docker

1. **MongoDB Atlas**: crea un cluster gratuito, un usuario de base de datos y, en *Network Access*, permite tu IP (o `0.0.0.0/0` solo para pruebas). Copia la cadena de conexión (*Drivers → Node.js*).
2. **Variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` y completa `MONGO_URI` (con el nombre de BD, p. ej. `/finanzapro`) y `JWT_SECRET`.
   Genera un secreto con:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
3. **Levanta los servicios**:
   ```bash
   docker compose up --build -d
   ```
4. Abre **http://localhost:3000** (frontend). La API responde en **http://localhost:5000/api/health**.

Comandos útiles: `docker compose logs -f backend`, `docker compose down`.

### Cómo se conectan las variables

| Variable | Definida en | Usada por |
|---|---|---|
| `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGIN` | `.env` → `docker-compose.yml` (`environment`) | backend |
| `VITE_API_URL` | `.env` → `docker-compose.yml` (`build.args`) → `frontend/Dockerfile` (`ARG`/`ENV`) | frontend (se incrusta al compilar) |
| `FRONTEND_PORT` | `.env` → `docker-compose.yml` (`ports`) | mapeo del puerto del frontend |

> `VITE_API_URL` es la URL del API **vista desde el navegador**. Si cambias su valor, o despliegas en otro dominio, reconstruye con `docker compose up --build`. Si cambias el puerto o dominio del frontend, actualiza también `CORS_ORIGIN`.

## Desarrollo local (sin Docker)

```bash
# Backend  (lee ../.env o backend/.env)
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && cp .env.example .env && npm run dev   # http://localhost:5173
```
Para desarrollo con Vite añade `http://localhost:5173` a `CORS_ORIGIN` (ya está permitido si no defines la variable).

## API REST (todas las rutas, salvo auth, requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro (`nombre`, `email`, `password`) |
| POST | `/api/auth/login` | Login → `{ token, user }` |
| GET | `/api/auth/me` | Usuario de la sesión |
| GET | `/api/transactions?tipo=&categoria=&mes=&anio=` | Lista filtrada + resumen |
| POST / PUT / DELETE | `/api/transactions[/:id]` | CRUD de movimientos |
| GET / POST | `/api/goals` | Listar / crear metas |
| PUT / DELETE | `/api/goals/:id` | Editar / eliminar meta |
| POST | `/api/goals/:id/contribute` | Abonar `{ monto, registrarMovimiento }` |
| GET | `/api/dashboard?mes=&anio=` | KPIs, gastos por categoría, metas activas, últimos movimientos |

## Reglas de negocio y seguridad

- **Aislamiento de datos:** toda consulta incluye `usuario: req.user._id`; un recurso ajeno responde 404.
- **Validaciones:** `monto > 0`, tipos y categorías con enum, contraseña ≥ 6 caracteres, email único. Contraseñas con bcrypt; JWT con expiración configurable.
- **Abonos a metas:** incrementan `montoActual`. Si marcas "registrar movimiento", se crea un egreso (categoría *Otros*) vinculado a la meta. Ese egreso **reduce el Balance total** pero **no cuenta como gasto del mes** ni aparece en el desglose por categoría.
- **Progreso y estado** de cada meta se calculan en el backend (`progreso`, `estado`: *En progreso* / *Completada*).
- **Total ahorrado** = suma de `montoActual` de todas las metas.
- Las fechas se guardan en UTC a medianoche para evitar desfases por zona horaria.

## Personalización

- Moneda y formato regional: `frontend/src/utils/format.js` (`CURRENCY`, `LOCALE`; por defecto BOB / es-BO).
- Categorías: `backend/models/Transaction.js` y `frontend/src/utils/constants.js`.

## Notas para producción

Pon el sitio detrás de HTTPS (proxy inverso o balanceador), usa un `JWT_SECRET` largo y único, restringe en Atlas las IP que pueden conectarse y fija `CORS_ORIGIN` al dominio real del frontend.

## Despliegue en la nube (Atlas + Render + Vercel)

1. **Atlas:** cluster M0 → usuario con lectura/escritura → Network Access `0.0.0.0/0` → copiar URI (añadir `/finanzapro` antes de `?`).
2. **Render** (New + > Web Service, o New + > Blueprint usando `render.yaml`): Root Directory `backend`, Build `npm install`, Start `npm start`, Health check `/api/health`. Variables: `PORT=5000`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`.
3. **Vercel:** importar el repo, preset **Vite**, Root Directory `frontend`, variable `VITE_API_URL=https://<tu-backend>.onrender.com/api`. `frontend/vercel.json` ya incluye la reescritura SPA (evita 404 al recargar `/metas` o `/movimientos`).
4. **CORS final:** en Render, `CORS_ORIGIN=http://localhost:5173,https://<tu-app>.vercel.app,https://<tu-app>-*.vercel.app` (el comodín cubre los *preview deploys*). Render redespliega solo al guardar.

> El plan gratuito de Render duerme el servicio tras 15 min sin uso; la primera petición puede tardar ~50 s (el frontend espera hasta 60 s).
