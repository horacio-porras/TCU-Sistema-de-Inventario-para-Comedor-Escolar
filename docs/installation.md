# Guía de Instalación y Configuración

Esta guía te ayudará a configurar y ejecutar el Sistema de Inventario para Comedor Escolar en tu entorno local.

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn** (gestor de paquetes)

## Instalación y Ejecución Local

### 1. Instalar dependencias

Primero, instala todas las dependencias del proyecto:

```bash
npm install
```

### 2. Configurar variables de entorno

El archivo `.env.local` ya ha sido creado en la raíz del proyecto. Este archivo contiene las variables de entorno necesarias para:
- **Firebase** (base de datos y autenticación)
- **Google AI / Genkit** (funcionalidades de IA)

**Para desarrollo local sin Firebase/Google AI:**
- Puedes dejar los valores como están (con `tu_..._aqui`) y el proyecto funcionará con datos estáticos.

**Para usar Firebase y Google AI:**
- Completa las credenciales en `.env.local` siguiendo las instrucciones en la sección [Configurar Firebase Firestore](#configuración-de-firebase-firestore).

**Nota:** El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio por seguridad.

### 3. Ejecutar en modo desarrollo

Para ejecutar el proyecto en modo desarrollo, usa el siguiente comando:

```bash
npm run dev
```

El servidor de desarrollo se iniciará en **http://localhost:9002** (puerto 9002).

### 4. Abrir en el navegador

Una vez que el servidor esté corriendo, abre tu navegador y visita:

```
http://localhost:9002
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo en el puerto 9002 con Turbopack
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción (después de hacer build)
- `npm run lint` - Ejecuta el linter para verificar errores de código
- `npm run typecheck` - Verifica los tipos de TypeScript sin compilar
- `npm run genkit:dev` - Inicia Genkit en modo desarrollo
- `npm run genkit:watch` - Inicia Genkit en modo watch

## Base de Datos

### Estado Actual

El proyecto utiliza **Firebase Firestore** como base de datos. Los datos estáticos han sido eliminados y ahora todos los productos se almacenan y recuperan desde Firestore.

**Estructura de datos:**
- **Colección: `products`** - Lista de productos del inventario
  - Campos: `id` (generado automáticamente), `name`, `category`, `quantity`, `expirationDate`
- **Categorías disponibles:**
  - Frutas y Verduras
  - Lácteos y Huevos
  - Carnes y Pescados
  - Panadería y Repostería
  - Enlatados y Conservas
  - Bebidas
  - Otros

### Ver los Datos en Firestore

1. **Desde la aplicación:**
   - Ejecuta `npm run dev`
   - Visita `http://localhost:9002/dashboard/products`
   - Los productos se cargarán desde Firestore

2. **Desde Firebase Console:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Haz clic en **Firestore Database**
   - Verás la colección `products` con todos los documentos

3. **Usando Firebase Emulator (desarrollo local):**
   - Ejecuta `firebase emulators:start`
   - Visita `http://localhost:4000` para la interfaz del emulador

### Migrar Datos Estáticos a Firestore (Opcional)

Si deseas migrar los datos estáticos originales a Firestore, puedes usar el script de migración:

```bash
# Asegúrate de tener configuradas las variables de entorno en .env.local
npx tsx src/lib/migrate-data.ts
```

**Nota:** Este script solo migrará datos si la colección `products` está vacía.

## Configuración de Firebase Firestore

El proyecto ya está configurado para usar Firebase Firestore. Si necesitas verificar o actualizar la configuración:

### 1. Instalar Firebase CLI (si no lo tienes)

```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase

```bash
firebase login
```

### 3. Inicializar Firebase en el proyecto

```bash
firebase init firestore
```

Esto creará un archivo `firebase.json` y `firestore.rules`.

### 4. Verificar variables de entorno

El archivo `.env.local` ya ha sido creado en la raíz del proyecto. Asegúrate de que tenga tus credenciales de Firebase configuradas:

**Para Firebase:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Configuración del proyecto** (ícono de engranaje) → **Tus aplicaciones**
4. Si no tienes una app web, haz clic en **Agregar app** → **Web** (</>)
5. Copia las credenciales y pégalas en `.env.local`:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

**Para Google AI (Genkit):**
1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Haz clic en **Get API Key** o **Crear clave de API**
3. Copia la clave y pégala en `.env.local` como `GOOGLE_GENAI_API_KEY`

**Nota:** Si aún no tienes estas credenciales, el proyecto funcionará con datos estáticos. Puedes configurar Firebase y Google AI más adelante.

### 5. Usar Firebase Emulator Suite (Desarrollo Local)

Para ver y trabajar con la base de datos localmente sin afectar producción:

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Iniciar los emuladores
firebase emulators:start
```

Los emuladores se iniciarán en:
- **Firestore Emulator:** http://localhost:8080
- **Firebase Emulator UI:** http://localhost:4000 (interfaz visual para ver y editar datos)

### 6. Crear la Base de Datos Firestore (IMPORTANTE)

**⚠️ Si solo ves la opción de "Crear base de datos" en Firebase Console, significa que la base de datos aún no ha sido creada. Sin esto, los datos NO se están guardando realmente.**

**Pasos para crear la base de datos:**

1. **Ve a Firebase Console:**
   - Abre [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto

2. **Crea Firestore Database:**
   - En el menú lateral, haz clic en **"Firestore Database"** o **"Firestore"**
   - Verás un botón que dice **"Create database"** o **"Crear base de datos"**
   - Haz clic en ese botón

3. **Configura la base de datos:**
   - **Modo de seguridad:**
     - Para desarrollo: Selecciona **"Start in test mode"** (permite lectura/escritura por 30 días)
     - Para producción: Selecciona **"Start in production mode"** (requiere reglas de seguridad)
   - **Ubicación (Location):**
     - Selecciona la región más cercana a ti (ej: `us-central`, `southamerica-east1`, etc.)
     - Esta ubicación no se puede cambiar después
   - Haz clic en **"Enable"** o **"Habilitar"**

4. **Espera a que se cree:**
   - Firebase creará la base de datos (puede tomar 1-2 minutos)
   - Una vez creada, verás la interfaz de Firestore Database

5. **Verifica que esté creada:**
   - Deberías ver una pantalla con el mensaje "No collections yet" o "Aún no hay colecciones"
   - Esto significa que la base de datos está lista para usar

**Después de crear la base de datos:**
- Los datos que agregues desde tu aplicación se guardarán en Firestore
- Podrás verlos en Firebase Console
- Los datos persistirán incluso si cierras la aplicación

### 7. Ver la Base de Datos en Firebase Console

Para ver tus tablas (colecciones) y datos en Firebase Console:

**Paso 1: Acceder a Firebase Console**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google (la misma que usaste para crear el proyecto)

**Paso 2: Seleccionar tu proyecto**
1. En la lista de proyectos, busca y selecciona tu proyecto
   - Si no lo ves, verifica que estés usando la cuenta correcta

**Paso 3: Abrir Firestore Database**
1. En el menú lateral izquierdo, busca la sección **"Build"** (Construir)
2. Haz clic en **"Firestore Database"** o **"Firestore"**
3. **Si ya creaste la base de datos** (ver sección anterior), verás la interfaz de Firestore
4. **Si aún no la has creado**, sigue los pasos de la sección "Crear la Base de Datos Firestore" arriba

**Paso 4: Ver tus colecciones (tablas)**
1. Una vez en Firestore Database, verás:
   - **Colecciones (Collections)**: Estas son tus "tablas"
   - La colección principal es: **`products`**
2. Haz clic en la colección **`products`** para ver todos los documentos (registros)
3. Cada documento representa un producto con sus campos:
   - `name` (nombre del producto)
   - `category` (categoría)
   - `quantity` (cantidad)
   - `expirationDate` (fecha de expiración)

**Funciones útiles en Firebase Console:**
- **Agregar documento**: Haz clic en "Add document" para crear un producto manualmente
- **Editar documento**: Haz clic en un documento para editarlo
- **Eliminar documento**: Haz clic en un documento y luego en el ícono de eliminar
- **Filtrar/Buscar**: Usa la barra de búsqueda para encontrar documentos específicos
- **Ver datos en tiempo real**: Los cambios se reflejan automáticamente

**Nota:** Si no ves la colección `products`, significa que aún no has agregado ningún producto desde la aplicación. Agrega un producto desde la interfaz web y luego vuelve a Firebase Console para verlo.

### Estructura de Colecciones en Firestore

La estructura recomendada es:

```
firestore/
  ├── products/          (Colección de productos)
  │   ├── {productId}/  (Documento individual)
  │   │   ├── id: string
  │   │   ├── name: string
  │   │   ├── category: string
  │   │   ├── quantity: number
  │   │   └── expirationDate: string
  │   └── ...
  └── categories/        (Opcional: Colección de categorías)
      └── ...
```

## Estructura del Proyecto

- `src/app/` - Páginas y rutas de Next.js
- `src/components/` - Componentes reutilizables
- `src/lib/` - Utilidades y funciones auxiliares
- `src/ai/` - Configuración de Genkit y flujos de IA
- `src/hooks/` - Custom React hooks

## Solución de Problemas

### Error: "Permission denied" al intentar guardar datos

- Verifica que hayas creado la base de datos Firestore (ver sección 6)
- Verifica que las reglas de seguridad de Firestore permitan lectura/escritura
- Si estás en modo test, las reglas expiran después de 30 días

### Error: "Firebase: Error (auth/configuration-not-found)"

- Verifica que todas las variables de entorno en `.env.local` estén configuradas correctamente
- Asegúrate de que las credenciales de Firebase sean válidas

### Los datos no aparecen en Firebase Console

- Verifica que hayas creado la base de datos Firestore
- Asegúrate de estar viendo el proyecto correcto en Firebase Console
- Verifica que los datos se estén guardando correctamente desde la aplicación (revisa la consola del navegador)

