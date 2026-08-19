# PetPulse

> **SPA de Control Veterinario** para gestionar la salud de tus mascotas: registra mascotas, vacunas, controles, desparasitaciones y cirugías, todo en un solo lugar.

---

## Descripción del Proyecto

PetPulse es una aplicación web (SPA) que permite a los dueños de mascotas llevar un **control completo de la salud** de sus animales. El sistema permite registrar mascotas y los eventos de salud que estas experimentan a lo largo de su vida.

### Funcionalidades principales

- **Registro de mascotas** (perro, gato, conejo, pájaro, otro)
- **Eventos de salud** (vacunas, controles, desparasitaciones, cirugías, otros)
- **Fechas de vencimiento** para próximos eventos
- **Gestión de usuarios** con roles (USER / ADMIN)
- **Imágenes de perfil** de mascotas y usuarios
- **Chatbot de consejos veterinarios** con IA (Fase 4)
- **Almacenamiento en la nube** de imágenes (Fase 4)

---

## Arquitectura del Proyecto

Proyecto en **monorepo** con la siguiente estructura:

```
petpulse/
├── backend/               # API REST (Next.js) - se corre con npm run dev
│   ├── app/
│   │   └── api/           # Endpoints de la API
│   └── package.json
├── frontend/              # SPA (React + Vite) - se corre con npm run dev
│   └── src/               # Código fuente de la interfaz
├── .github/
│   └── workflows/
│       └── ci.yml         # Pipeline de integración continua
├── README.md              # Documentación general
└── INSTALL.md             # Guía de instalación y puesta en marcha
```

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + Vite 5 + TypeScript |
| **Backend** | Next.js 14 (API Routes) + TypeScript |
| **Base de datos** | Supabase (PostgreSQL) |
| **CI/CD** | GitHub Actions |
| **Storage** | AWS S3 (Fase 4) |
| **IA** | Google Gemini API (Fase 4) |

---

## Puesta en Marcha Rápida

> **Requisito previo:** Node.js 20+ y `npm`. No se necesita Docker; la base de datos (Supabase) ya está en la nube.

```bash
# 1. Clonar el repositorio
git clone git@github.com:luisAlejandro-26/petpulse.git
cd petpulse

# 2. Configurar variables de entorno del backend
cp backend/.env.example backend/.env
#    Editar backend/.env con las credenciales de Supabase y el SMTP

# 3. Instalar dependencias e iniciar el backend
cd backend
npm install
npm run dev   # → http://localhost:3000

# 4. En otra terminal, iniciar el frontend
cd frontend
npm install
npm run dev   # → http://localhost:5173

# 5. Acceder a la aplicación
#    Frontend → http://localhost:5173
#    Backend  → http://localhost:3000
```

> **Guía detallada:** Consulta [INSTALL.md](./INSTALL.md) para la instalación completa paso a paso, solución de errores comunes y las convenciones de ramas.

---

## Rutas de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado del backend |
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Inicio de sesión (JWT) |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado |
| `PUT` | `/api/auth/profile` | Actualizar perfil |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `POST` | `/api/auth/forgot-password` | Enviar código de recuperación |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña |

---

## Convenciones de Ramas (GitFlow Adaptado)

El proyecto sigue un **GitFlow adaptado** con un monorepo:

| Tipo de cambio | Prefijo de rama | Ejemplo |
|----------------|-----------------|---------|
| Backend, DB, DevOps, Repo | `feature/SInformacion-<tarea>` | `feature/SInformacion-setup-infraestructura` |
| Frontend React / UI | `feature/multimedia-<tarea>` | `feature/multimedia-login-component` |

**Ramas base:**
- `main` → versión estable
- `develop` → integración continua

---

## Fases del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Infraestructura (setup del monorepo) | Completada |
| 2 | Backend y Autenticación (Next.js + Supabase) | En curso |
| 3 | Frontend UI (React) | Pendiente |
| 4 | Integraciones AWS S3 + Gemini AI | Pendiente |
| 5 | CI/CD y Pulido Final | Pendiente |



## Licencia

Proyecto académico universitario. Sin licencia específica.
