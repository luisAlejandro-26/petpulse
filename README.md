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
├── backend/               # API REST (Next.js)
│   ├── app/
│   │   └── api/           # Endpoints de la API
│   ├── Dockerfile         # Imagen multistage (deps → builder → runner)
│   └── package.json
├── frontend/              # SPA (React + Vite)
│   ├── src/               # Código fuente de la interfaz
│   ├── Dockerfile         # Imagen multistage con Nginx
│   └── package.json
├── database/
│   └── init.sql           # Esquema de la base de datos Oracle
├── .github/
│   └── workflows/
│       └── ci.yml         # Pipeline de integración continua
├── docker-compose.yml     # Orquestación de todos los servicios
├── README.md              # Documentación general
└── INSTALL.md             # Guía de instalación y puesta en marcha
```

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + Vite 5 + TypeScript |
| **Backend** | Next.js 14 (API Routes) + TypeScript |
| **Base de datos** | Oracle Database Free (`gvenzl/oracle-free`) |
| **Contenedores** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Storage** | AWS S3 (Fase 4) |
| **IA** | Google Gemini API (Fase 4) |

---

## Puesta en Marcha Rápida

```bash
# 1. Clonar el repositorio
git clone git@github.com:luisAlejandro-26/petpulse.git
cd petpulse

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env

# 3. Levantar todos los servicios (Oracle, Backend, Frontend)
docker-compose up --build

# 4. Acceder a la aplicación
#    Frontend → http://localhost:5173
#    Backend  → http://localhost:3000
#    Oracle   → localhost:1521 (service name: FREEPDB1)
```

> **Guía detallada:** Consulta [INSTALL.md](./INSTALL.md) para la instalación completa paso a paso, solución de errores comunes y las convenciones de ramas.

---

## Rutas de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado del backend |

> Los endpoints de autenticación y CRUD se implementarán en la **Fase 2**.

---

## Convenciones de Ramas (GitFlow Adaptado)

El proyecto sigue un **GitFlow adaptado** con un monorepo:

| Tipo de cambio | Prefijo de rama | Ejemplo |
|----------------|-----------------|---------|
| Backend, DB, DevOps, Docker, Repo | `feature/SInformacion-<tarea>` | `feature/SInformacion-setup-infraestructura` |
| Frontend React / UI | `feature/multimedia-<tarea>` | `feature/multimedia-login-component` |

**Ramas base:**
- `main` → versión estable
- `develop` → integración continua

---

## Fases del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Infraestructura y Docker | Completada |
| 2 | Backend y Autenticación (Next.js) | Próxima |
| 3 | Frontend UI (React) | Pendiente |
| 4 | Integraciones AWS S3 + Gemini AI | Pendiente |
| 5 | CI/CD y Pulido Final | Pendiente |

---

## Equipo

- **Tech Lead:** Luis Jiménez
- **Equipo:** 3 desarrolladores

---

## Licencia

Proyecto académico universitario. Sin licencia específica.
