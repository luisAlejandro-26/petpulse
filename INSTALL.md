# Guía de Instalación - PetPulse

Esta guía detalla el proceso completo para **clonar, configurar y ejecutar** el proyecto PetPulse en un entorno local, siguiendo las convenciones de ramas establecidas.

---

## Requisitos Previos

| Herramienta | Versión mínima | Verificar con |
|-------------|----------------|---------------|
| **Docker** | 24+ (con Docker Compose v2) | `docker --version` |
| **Docker Compose** | v2 (incluido en Docker Desktop) | `docker compose version` |
| **Git** | 2.30+ | `git --version` |
| **Node.js** (opcional) | 20+ (solo si desarrollas fuera de Docker) | `node --version` |
| **SQL Developer** (opcional) | Cualquiera | Para inspeccionar la base de datos |

> **IMPORTANTE:** Para este proyecto NO necesitas instalar Oracle localmente. La base de datos corre en un contenedor Docker automáticamente.

---

## Instalación Paso a Paso

### Paso 1: Clonar el repositorio

```bash
git clone git@github.com:luisAlejandro-26/petpulse.git
cd petpulse
```

> Si usas HTTPS en vez de SSH:
> ```bash
> git clone https://github.com/luisAlejandro-26/petpulse.git
> ```

### Paso 2: Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Esto crea el archivo `.env` con los valores por defecto. **No modifiques** los valores de conexión a la base de datos (los que empiezan con `DATABASE_`) ya que están sincronizados con el `docker-compose.yml`.

> **Seguridad:** El archivo `.env` está en el `.gitignore` y **nunca** debe subirse al repositorio.

### Paso 3: Levantar la infraestructura con Docker Compose

```bash
docker-compose up --build
```

Este comando hace lo siguiente automáticamente:

1. Construye la imagen del `backend`
2. Levanta **Oracle Database Free** (primera vez tarda ~2-3 min)
3. Ejecuta el servicio **`db-init`** que crea las 4 tablas automáticamente
4. Arranca el **backend** en el puerto 3000

> Para ejecutar en segundo plano (sin ocupar la terminal):
> ```bash
> docker-compose up -d
> ```

### Paso 4: Levantar el frontend con npm (hot-reload nativo)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

> **¿Por qué no en Docker?** En desarrollo es mejor correr el frontend con `npm run dev` porque Vite tiene hot-reload nativo mucho más rápido que dentro de un contenedor. La imagen Docker del frontend (multistage + Nginx) queda disponible para **producción**:
> ```bash
> docker-compose --profile production up --build
> ```

### Paso 5: Verificar que todo funciona

| Servicio | URL / Comando | Resultado esperado |
|----------|---------------|-------------------|
| Frontend | `http://localhost:5173` | Página de PetPulse |
| Backend | `http://localhost:3000/api/health` | `{"status":"ok","service":"petpulse-backend"}` |
| Oracle | Ver comando abajo | Lista las 4 tablas |

Verificar las tablas de Oracle:

```bash
echo "SELECT table_name FROM user_tables ORDER BY table_name;" | docker exec -i petpulse-oracle-db sqlplus -s "petpulse/PetPulse2024@//localhost:1521/FREEPDB1"
```

Resultado esperado:

```
HEALTH_EVENT
PET
SESSIONS
USERS
```

---

## Comandos Útiles de Docker

```bash
# Levantar la infraestructura (Oracle + Backend, foreground)
docker-compose up

# Levantar la infraestructura (background)
docker-compose up -d

# Levantar TODO incluyendo el frontend en producción
docker-compose --profile production up --build

# Ver logs de un servicio
docker-compose logs -f oracle-db
docker-compose logs -f backend

# Ver estado de los servicios
docker-compose ps

# Detener servicios (conserva la data de Oracle)
docker-compose down

# Detener y ELIMINAR la data de Oracle (reinicio limpio de la DB)
docker-compose down -v

# Reconstruir imágenes desde cero
docker-compose up --build

# Reconstruir SOLO la base de datos desde cero (borra tablas y recrea)
docker-compose down -v
docker-compose up -d oracle-db
docker-compose up db-init
```

---

## Conectarse a Oracle desde SQL Developer

Para inspeccionar la base de datos visualmente:

| Campo | Valor |
|-------|-------|
| Nombre de conexión | PetPulse |
| Usuario | `petpulse` |
| Contraseña | `PetPulse2024` |
| Host | `localhost` |
| Puerto | `1521` |
| **Service Name** | `FREEPDB1` |

> **Importante:** Usa **Service Name = `FREEPDB1`**, NO `XEPDB1` ni `XE`. Es un error común.

---

## Distribución de Ramas (GitFlow Adaptado)

El proyecto usa un **GitFlow adaptado** con ramas de integración y ramas de feature.

### Ramas base

| Rama | Propósito |
|------|-----------|
| `main` | Versión estable / producción. Solo se mergean releases. |
| `develop` | Integración continua. Todas las features se fusionan aquí. |

### Convención de ramas de feature

| Tipo de trabajo | Prefijo | Ejemplo |
|-----------------|---------|---------|
| Backend, DB, DevOps, Docker, Repo | `feature/SInformacion-<tarea>` | `feature/SInformacion-auth-jwt` |
| Frontend React / UI | `feature/multimedia-<tarea>` | `feature/multimedia-dashboard` |

### Flujo de trabajo diario

```bash
# 1. Asegurarte de estar al día con develop
git checkout develop
git pull origin develop

# 2. Crear la rama de feature (según la convención)
git checkout -b feature/SInformacion-mi-tarea

# 3. Trabajar y hacer commits
git add .
git commit -m "feat: descripción de lo implementado"

# 4. Subir la rama al repositorio
git push -u origin feature/SInformacion-mi-tarea

# 5. (Opcional pero recomendado) Crear un Pull Request en GitHub
#    feature/SInformacion-mi-tarea → develop

# 6. Integrar en develop (merge local)
git checkout develop
git merge --no-ff feature/SInformacion-mi-tarea
git push origin develop

# 7. Eliminar la rama local ya integrada
git branch -d feature/SInformacion-mi-tarea
```

### Recomendaciones

- **Una tarea = una rama.** No mezcles varias tareas en la misma rama.
- Usa mensajes de commit descriptivos (`feat:`, `fix:`, `chore:`, `docs:`).
- Haz pull de `develop` frecuentemente para evitar conflictos.
- **NUNCA** hacer push directamente a `main`.
- **NUNCA** subir archivos `.env` o el `PETPULSE_ROADMAP.md`.
- **NUNCA** agregar emojis a archivos del repositorio.

---

## Errores Comunes y Soluciones

### Error 1: `ORA-12514: Cannot connect to database. Service XEPDB1 is not registered`

**Causa:** Usar el service name incorrecto. La imagen `gvenzl/oracle-free` usa `FREEPDB1`, no `XEPDB1`.

**Solución:** En cualquier conexión usa `FREEPDB1` como Service Name.

---

### Error 2: `refusing to allow an OAuth App to create or update workflow`

**Causa:** El token de GitHub no tiene el permiso `workflow` para subir/modificar archivos en `.github/workflows/`.

**Solución:**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un token marcando el scope **`workflow`**
3. Actualiza el remote con el token:
```bash
git remote set-url origin https://USUARIO:TOKEN@github.com/luisAlejandro-26/petpulse.git
```

---

### Error 3: El servicio `db-init` falla o las tablas no aparecen

**Causa:** Oracle aún no terminó de iniciar, o el volumen tiene data previa corrupta.

**Solución:**
```bash
docker-compose down -v
docker-compose up -d oracle-db
docker-compose up db-init
```

---

### Error 4: `docker-compose up --build` falla con `unable to prepare context: path not found`

**Causa:** Faltan directorios o archivos del monorepo.

**Solución:** Verifica que las carpetas `backend/` y `frontend/` existan con su `Dockerfile`. Si clonaste antes de que existieran, haz `git pull origin develop` en `main`/`develop`.

---

### Error 5: El puerto 3000 o 5173 ya está en uso

**Causa:** Otra aplicación está usando el puerto.

**Solución:**
```bash
# Ver qué está usando el puerto
lsof -i :3000
lsof -i :5173

# Matar el proceso (opcional)
kill -9 <PID>
```

---

### Error 6: `no rows selected` al listar tablas de Oracle

**Causa:** El usuario `petpulse` no tiene las tablas en su esquema, o `db-init` no se ejecutó.

**Solución:** Ejecutar el servicio `db-init` manualmente:
```bash
docker-compose up db-init
```

---

### Error 7: El frontend no carga pero `npm run dev` no muestra errores

**Causa:** Otra aplicación ocupa el puerto 5173, o Vite no está escuchando en `0.0.0.0`.

**Solución:** El `vite.config.ts` ya tiene `host: true`. Verifica que el puerto esté libre:
```bash
lsof -i :5173
```

---

## Reinicio Total del Entorno

Si quieres empezar **completamente de cero** (borrar la base de datos y reconstruir todo):

```bash
docker-compose down -v
docker-compose up --build
```

> Esto borra TODA la data de Oracle. Úsalo solo si es necesario.

---

## Desarrollo del Frontend (Flujo Diario)

Este es el flujo recomendado para el equipo de UI:

```bash
# 1. Levantar la infraestructura una sola vez (Oracle + Backend)
docker-compose up --build

# 2. En otra terminal, levantar el frontend con hot-reload
cd frontend
npm install      # solo la primera vez
npm run dev      # → http://localhost:5173
```

> Vite recarga automáticamente el navegador al guardar cambios en `frontend/src/`. No necesitas reconstruir nada.

## Desarrollo sin Docker (Avanzado)

Si prefieres ejecutar todo sin contenedores (recomendado solo para desarrollo de UI/Backend con Oracle ya corriendo en Docker):

```bash
# Backend
cd backend
npm install
npm run dev        # → http://localhost:3000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

> Requiere que `oracle-db` esté corriendo: `docker-compose up -d oracle-db` y `docker-compose up db-init`
