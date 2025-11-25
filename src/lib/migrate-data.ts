/**
 * Script de migración para mover datos estáticos a Firestore
 * 
 * Ejecuta este script una vez para migrar los datos estáticos iniciales
 * a tu base de datos Firestore.
 * 
 * Uso:
 * 1. Asegúrate de tener configuradas las variables de entorno en .env.local
 * 2. Ejecuta: npx tsx src/lib/migrate-data.ts
 */

import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Datos estáticos originales (para migración)
const staticProducts = [
  { name: 'Manzanas', category: 'Frutas y Verduras', quantity: 50, expirationDate: '2024-10-15' },
  { name: 'Leche Entera', category: 'Lácteos y Huevos', quantity: 24, expirationDate: '2024-09-20' },
  { name: 'Carne Molida', category: 'Carnes y Pescados', quantity: 15, expirationDate: '2024-09-10' },
  { name: 'Pan de Molde', category: 'Panadería y Repostería', quantity: 30, expirationDate: '2024-09-05' },
  { name: 'Atún en Lata', category: 'Enlatados y Conservas', quantity: 100, expirationDate: '2026-08-01' },
  { name: 'Agua Embotellada', category: 'Bebidas', quantity: 8, expirationDate: '2025-01-01' },
  { name: 'Plátanos', category: 'Frutas y Verduras', quantity: 80, expirationDate: '2024-09-08' },
  { name: 'Huevos', category: 'Lácteos y Huevos', quantity: 120, expirationDate: '2024-09-25' },
  { name: 'Pollo Deshuesado', category: 'Carnes y Pescados', quantity: 20, expirationDate: '2024-09-12' },
  { name: 'Galletas de Avena', category: 'Panadería y Repostería', quantity: 40, expirationDate: '2024-12-01' },
  { name: 'Arroz', category: 'Otros', quantity: 200, expirationDate: '2026-01-01' },
  { name: 'Frijoles Negros Enlatados', category: 'Enlatados y Conservas', quantity: 9, expirationDate: '2025-11-20' },
];

async function migrateData() {
  try {
    console.log('Iniciando migración de datos a Firestore...');
    
    // Verificar si ya hay productos
    const productsRef = collection(db, 'products');
    const existingProducts = await getDocs(productsRef);
    
    if (!existingProducts.empty) {
      console.log(`⚠️  Ya existen ${existingProducts.size} productos en Firestore.`);
      console.log('Si deseas migrar los datos estáticos, primero elimina los productos existentes.');
      return;
    }
    
    // Migrar productos
    console.log(`Migrando ${staticProducts.length} productos...`);
    for (const product of staticProducts) {
      await addDoc(productsRef, product);
      console.log(`✓ Migrado: ${product.name}`);
    }
    
    console.log('\n✅ Migración completada exitosamente!');
    console.log(`Se migraron ${staticProducts.length} productos a Firestore.`);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar migración si se ejecuta directamente
if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateData };

