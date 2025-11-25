# Sistema de Inventario para Comedor Escolar

Sistema de inventario desarrollado con Next.js y Firebase para gestión de comedores escolares.

## Descripción

Este sistema permite gestionar el inventario de productos de un comedor escolar de manera eficiente, proporcionando herramientas para registrar productos, visualizar el inventario, recibir alertas de stock bajo y generar reportes.

## Características Principales

- **Autenticación de Usuarios**: Login seguro para personal autorizado
- **Registro de Productos**: Registro de nuevos productos con nombre, categoría, cantidad y fecha de expiración
- **Búsqueda y Filtrado**: Búsqueda rápida de productos por nombre o categoría
- **Visualización de Inventario**: Representación gráfica de los niveles de inventario
- **Alertas de Stock Bajo**: Alertas automatizadas cuando un producto está por agotarse, utilizando inteligencia artificial

## Tecnologías Utilizadas

- **Next.js 15.3.3** - Framework de React para aplicaciones web
- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **TypeScript** - Superset de JavaScript con tipado estático
- **Firebase Firestore** - Base de datos NoSQL en tiempo real
- **Genkit** - Framework para funcionalidades de IA
- **Tailwind CSS** - Framework de CSS utility-first
- **Radix UI** - Componentes de UI accesibles y sin estilos

## Guía de Instalación

Para instalar y configurar el proyecto localmente, consulta la [Guía de Instalación](./docs/installation.md).

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (ver docs/installation.md)
# Editar .env.local con tus credenciales

# Ejecutar en modo desarrollo
npm run dev
```

El servidor se iniciará en **http://localhost:9002**

## Estructura del Proyecto

```
src/
├── app/              # Páginas y rutas de Next.js
├── components/       # Componentes reutilizables
│   ├── dashboard/    # Componentes del dashboard
│   └── ui/           # Componentes de UI base
├── lib/              # Utilidades y funciones auxiliares
│   ├── firebase.ts   # Configuración de Firebase
│   └── firestore-client.ts  # Funciones de Firestore
├── ai/               # Configuración de Genkit y flujos de IA
└── hooks/            # Custom React hooks
```

## Base de Datos

El proyecto utiliza **Firebase Firestore** como base de datos. La estructura principal incluye:

- **Colección `products`**: Almacena todos los productos del inventario
  - Campos: `name`, `category`, `quantity`, `expirationDate`

Para más información sobre la configuración de la base de datos, consulta la [Guía de Instalación](./docs/installation.md).

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run typecheck` - Verifica los tipos de TypeScript
- `npm run genkit:dev` - Inicia Genkit en modo desarrollo

## Documentación

- [Guía de Instalación](./docs/installation.md) - Instrucciones detalladas de instalación y configuración
- [Blueprint](./docs/blueprint.md) - Especificaciones de diseño y características

## Licencia

Este proyecto es parte de un Trabajo Comunal Universitario (TCU).
