# Guía de Instalación - PetPulse

Esta guía detalla el proceso completo para **clonar, configurar y ejecutar** el proyecto PetPulse en un entorno local, siguiendo las convenciones de ramas establecidas.

---

## Requisitos Previos

| Herramienta | Versión mínima | Verificar con |
|-------------|----------------|---------------|
| **Git** | 2.30+ | `git --version` |
| **Node.js** | 20+ | `node --version` |
| **npm** | 10+ | `npm --version` |

> **IMPORTANTE:** No se necesita Docker ni Oracle local. La base de datos (Supabase, PostgreSQL) está alojada en la nube y el proyecto corre con `npm run dev`.

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

Completa `backend/.env` con las credenciales reales:

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto en Supabase (ej. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Clave pública (anon key) del proyecto |
| `JWT_SECRET` | Secreto para firmar los tokens de sesión |
| `EMAIL_USER` / `EMAIL_PASS` | Cuenta SMTP para el envío de correos de recuperación |

> **Seguridad:** El archivo `.env` está en el `.gitignore` y **nunca** debe subirse al repositorio.

### Paso 3: Instalar dependencias e iniciar el backend

```bash
cd backend
npm install
npm run dev    # → http://localhost:3000
```

> El backend usa las tablas que ya existen en Supabase (`users`, `sessions`, `pet`, `health_event`). No hace falta crear nada localmente.

### Paso 4: Iniciar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev    # → http://localhost:5173
```

> `frontend/.env` debe contener `VITE_API_URL=http://localhost:3000` para apuntar al backend local.

### Paso 5: Verificar que todo funciona

| Servicio | URL / Comando | Resultado esperado |
|----------|---------------|-------------------|
| Backend | `http://localhost:3000/api/health` | `{"status":"ok","service":"petpulse-backend"}` |
| Backend + Supabase | `http://localhost:3000/api/db-test` | `{"count":N}` con el total de usuarios |
| Frontend | `http://localhost:5173` | Página de PetPulse |

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
| Backend, DB, DevOps, Repo | `feature/SInformacion-<tarea>` | `feature/SInformacion-auth-jwt` |
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
```

> **Regla obligatoria:** NUNCA eliminar ramas (ni locales ni en el repositorio). Una rama integrada a `develop` se conserva; si ya no se trabaja en ella, simplemente se deja de usar.

### Recomendaciones

- **Una tarea = una rama.** No mezcles varias tareas en la misma rama.
- Usa mensajes de commit descriptivos (`feat:`, `fix:`, `chore:`, `docs:`).
- Haz pull de `develop` frecuentemente para evitar conflictos.
- **NUNCA** hacer push directamente a `main`.
- **NUNCA** subir archivos `.env` ni `PETPULSE_TICKETS.md`.
- **NUNCA** agregar emojis a archivos del repositorio.

---

## Errores Comunes y Soluciones

### Error 1: `refusing to allow an OAuth App to create or update workflow`

**Causa:** El token de GitHub no tiene el permiso `workflow` para subir/modificar archivos en `.github/workflows/`.

**Solución:**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un token marcando el scope **`workflow`**
3. Actualiza el remote con el token:
```bash
git remote set-url origin https://USUARIO:TOKEN@github.com/luisAlejandro-26/petpulse.git
```

---

### Error 2: El puerto 3000 o 5173 ya está en uso

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

### Error 3: El frontend no carga pero `npm run dev` no muestra errores

**Causa:** Otra aplicación ocupa el puerto 5173, o Vite no está escuchando en `0.0.0.0`.

**Solución:** El `vite.config.ts` ya tiene `host: true`. Verifica que el puerto esté libre:
```bash
lsof -i :5173
```

---

### Error 4: `/api/db-test` devuelve 500 con un error de Supabase

**Causa:** `SUPABASE_URL` o `SUPABASE_ANON_KEY` están mal configurados en `backend/.env`, o las tablas no existen en el proyecto.

**Solución:** Verifica los valores en el dashboard de Supabase (Settings → API). Confirma que las tablas `users`, `sessions`, `pet` y `health_event` existan en el esquema.

---

### Error 5: No llega el correo de recuperación de contraseña

**Causa:** El SMTP falla, o la contraseña de aplicación de Gmail está mal.

**Solución:** Verifica que `EMAIL_USER`/`EMAIL_PASS` en `backend/.env` usen una **contraseña de aplicación** de Gmail (no la contraseña normal). Revisa también la carpeta de spam.

---

## Desarrollo del Frontend (Flujo Diario)

```bash
# 1. Iniciar el backend una sola vez
cd backend
npm install    # solo la primera vez
npm run dev    # → http://localhost:3000

# 2. En otra terminal, levantar el frontend con hot-reload
cd frontend
npm install    # solo la primera vez
npm run dev    # → http://localhost:5173
```

> Vite recarga automáticamente el navegador al guardar cambios en `frontend/src/`. No necesitas reconstruir nada.
