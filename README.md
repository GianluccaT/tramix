# TRAMIX

Plataforma web de seguimiento documental de operaciones de importación.

Proyecto de Desarrollo de Aplicaciones Web — Ingeniería Informática, Universidad Americana.
Integrantes: Gianlucca Torreani · Yevgeni Butlerov · Docente: Silvia C. Vázquez N.

## Propósito

En una importación, el importador y su despachante intercambian facturas, conocimientos de embarque,
packing lists y certificados por correo y WhatsApp, y nadie tiene a mano qué documento llegó, cuál
falta y en qué etapa está la carga. TRAMIX centraliza ese seguimiento: cada operación tiene su
checklist documental (que se arma solo según el medio de transporte) y su etapa.

## Acceso

| Entorno | Aplicación | API |
|---|---|---|
| Local | http://localhost:3000 | http://localhost:3000/api/operaciones |
| Desplegado (Render) | https://tramix.onrender.com | https://tramix.onrender.com/api/operaciones |

Usuarios de demostración (ficticios, para probar): `jgimenez@tramix.com.py` (despachante),
`compras@agroinsumos.com.py` (importador) y `admin@tramix.com.py` (administrador). Clave: `tramix123`.

> En el plan gratuito de Render el servicio se duerme después de 15 minutos sin uso. La primera
> vez que se abre puede tardar cerca de un minuto en responder.

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript (sin framework), consumo de la API con `fetch()`.
- **Backend:** Node.js 18 o superior con Express 5. API REST con respuestas JSON.
- **Base de datos:** MySQL 8 en local; TiDB Cloud Starter (compatible con MySQL) en la nube.
  Acceso con la librería `mysql2` y consultas parametrizadas.
- **Despliegue:** Render (servicio web gratuito) + TiDB Cloud Starter (plan gratuito).

## Arquitectura

El backend (Express) entrega las pantallas del frontend y también la API, así que todo sale de una
sola dirección: en local `http://localhost:3000` y en la nube la URL de Render. Por eso el frontend
llama a la API con la ruta relativa `/api` y no hace falta CORS. Esquema: [docs/arquitectura.png](docs/arquitectura.png).

## Estructura del repositorio

```
tramix/
├── frontend/                  Pantallas: login, panel, listado, alta y detalle
│   ├── css/estilos.css
│   └── js/                    Lógica de cada pantalla; api.js tiene la URL de la API
├── backend/                   API y servidor del frontend
│   ├── servidor.js            Arranca Express, monta /api y sirve la carpeta frontend
│   ├── conexion.js            Conexión con MySQL a partir de las variables de entorno
│   ├── rutas/operaciones.js   Endpoints GET y POST /api/operaciones
│   ├── datos/plantillas.js    Documentos del checklist según el transporte
│   ├── base_datos/            Script tramix.sql y modelo de datos
│   ├── scripts/crear-base.js  Ejecuta tramix.sql (npm run db:init)
│   ├── pruebas.http           Pruebas de la API (REST Client)
│   ├── .env.example           Variables de entorno que hacen falta (sin valores reales)
│   └── package.json           Dependencias y comandos
├── docs/
│   ├── arquitectura.png       Esquema local y de despliegue
│   └── evidencias/            Capturas de las pruebas
├── render.yaml                Configuración del servicio en Render
└── .gitignore                 Deja afuera node_modules y .env
```

## Requisitos previos

- Node.js 18 o superior (`node -v` para verificar).
- MySQL 8 instalado y corriendo (o una base en la nube compatible con MySQL).
- Git, solo si se clona el repositorio.

## Instalación y ejecución local

1. Descargar o clonar el repositorio y entrar a la carpeta del backend:

   ```
   cd tramix/backend
   ```

2. Instalar las dependencias:

   ```
   npm install
   ```

3. Crear el archivo de variables de entorno a partir del ejemplo y completarlo con los datos de tu MySQL:

   ```
   cp .env.example .env
   ```

   (en Windows: `copy .env.example .env`)

4. Preparar la base de datos (crea la base `tramix`, las tablas y los datos de ejemplo):

   ```
   npm run db:init
   ```

   Tiene que aparecer `Base lista. Operaciones cargadas: 6`.
   Si preferís hacerlo a mano: `mysql -u root -p < base_datos/tramix.sql`.

5. Arrancar el servidor:

   ```
   npm start
   ```

   Tiene que aparecer `Servidor de TRAMIX corriendo en el puerto 3000`.

6. Abrir http://localhost:3000 en el navegador. Las pantallas y la API salen del mismo servidor,
   no hace falta levantar nada más.

## Variables de entorno

| Variable | Para qué sirve | Local | Nube (TiDB) |
|---|---|---|---|
| `DB_HOST` | Servidor de la base | `localhost` | el host que da TiDB |
| `DB_PORT` | Puerto de la base | `3306` | `4000` |
| `DB_USER` | Usuario | tu usuario de MySQL | el usuario que da TiDB (`xxxx.root`) |
| `DB_PASSWORD` | Contraseña | tu contraseña | la que genera TiDB |
| `DB_NAME` | Nombre de la base | `tramix` | `tramix` |
| `DB_SSL` | Conexión cifrada | `false` | `true` (TiDB la exige) |
| `PORT` | Puerto del servidor | no hace falta (usa 3000) | lo pone Render solo |

Las contraseñas van solo en el `.env` (local) o en el panel de Render (nube). Nunca en el código ni en el repo.

## Endpoints

| Método | Ruta | Propósito | Respuestas |
|---|---|---|---|
| GET | `/api/operaciones` | Consultar las operaciones guardadas, con su checklist | 200 |
| POST | `/api/operaciones` | Registrar una operación nueva y generar su checklist | 201, 400, 409 |

El POST recibe `numero`, `importadorId`, `proveedor`, `paisOrigen`, `transporte`
(`maritimo`, `terrestre` o `aereo`), `fechaArribo` y `descripcion`. Responde 400 si falta algún
dato, si el transporte no es válido o si el importador no existe, y 409 si el número ya está registrado.

## Funciones

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Listado de operaciones con búsqueda y filtros | Implementada | Datos desde la API y la base |
| Alta de operación con checklist automático | Implementada | POST a la API, se guarda en la base; validación en frontend y backend |
| Inicio de sesión por rol | Parcial | Simulado en el navegador con usuarios de demostración, sin JWT |
| Panel de indicadores | Parcial | Calcula sobre los datos del navegador |
| Detalle, adjuntos y cambio de etapa | Parcial | Funciona en el navegador, todavía no se guarda en la base |
| Autenticación con JWT y permisos en el backend | Futura | |
| Carga real de archivos y gestión de usuarios | Futura | |

## Despliegue (Render + TiDB Cloud)

**1. Base de datos en TiDB Cloud Starter (gratis, sin tarjeta)**

1. Crear una cuenta en https://tidbcloud.com y crear una instancia **Starter**.
2. Entrar a la instancia → **Connect** → Connection Type **Public** → **Generate Password**.
   Anotar host, puerto (4000), usuario y contraseña.
3. En tu compu, poner esos datos en `backend/.env` con `DB_SSL=true` y correr `npm run db:init`.
   Eso crea la base `tramix` en la nube con sus tablas y datos de ejemplo.

**2. Código en GitHub**

1. Crear un repositorio y subir la carpeta `tramix` completa (sin `node_modules` ni `.env`,
   el `.gitignore` ya los deja afuera).

**3. Servicio web en Render (gratis)**

1. En https://render.com → **New** → **Web Service** → conectar el repositorio de GitHub.
2. Completar: Root Directory `backend` · Build Command `npm install` · Start Command `npm start` ·
   Instance Type **Free**. (También se puede usar **New → Blueprint**, que lee el `render.yaml`.)
3. En **Environment** cargar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DB_SSL`
   con los datos de TiDB. `PORT` no se carga: Render lo pone solo.
4. **Create Web Service** y esperar a que el log diga `Servidor de TRAMIX corriendo`.
   Render da la URL pública con HTTPS (`https://<nombre>.onrender.com`).
5. Pegar esa URL en la tabla de **Acceso** de este README.

Cada vez que se sube un cambio a GitHub, Render vuelve a desplegar solo.

## Limitaciones

- Solo el listado y el alta de operaciones usan la API y la base. El login, el panel, el detalle,
  los adjuntos, el cambio de etapa y el historial siguen trabajando con el `localStorage` del navegador.
- El login es simulado: no hay autenticación real ni control de permisos en el backend.
- Los adjuntos son simulados: se guarda el nombre del archivo, no el archivo.
- En Render gratis el servicio se duerme a los 15 minutos sin uso y tarda cerca de un minuto en despertar.
- `npm run db:init` borra y vuelve a crear las tablas: es para preparar la base, no para usar con datos reales.
