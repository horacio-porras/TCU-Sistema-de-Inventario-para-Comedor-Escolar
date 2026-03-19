'use client';

import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  runTransaction,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import type { Product, StockMovement, StockMovementType } from './definitions';

const COLLECTION_NAME = 'products';

/**
 * Convierte un documento de Firestore a un Product
 */
function firestoreDocToProduct(docData: DocumentData, id: string): Product {
  return {
    id,
    name: docData.name || '',
    category: docData.category || 'Otros',
    quantity: docData.quantity || 0,
    expirationDate: docData.expirationDate 
      ? (docData.expirationDate instanceof Timestamp 
          ? docData.expirationDate.toDate().toISOString().split('T')[0]
          : docData.expirationDate)
      : new Date().toISOString().split('T')[0],
    archived: Boolean(docData.archived),
    archivedAt: docData.archivedAt instanceof Timestamp
      ? docData.archivedAt.toDate().toISOString()
      : (docData.archivedAt ?? null),
  };
}

/**
 * Obtiene todos los productos de Firestore (cliente)
 */
export async function getProductsClient(includeArchived = false): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(firestoreDocToProduct(doc.data(), doc.id));
    });

    if (includeArchived) {
      return products;
    }

    return products.filter((product) => !product.archived);
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

/**
 * Agrega un nuevo producto a Firestore (cliente)
 */
export async function addProductClient(product: Omit<Product, 'id'>): Promise<string> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(productsRef, {
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      expirationDate: product.expirationDate,
      archived: false,
      archivedAt: null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

/**
 * Actualiza un producto existente en Firestore (cliente)
 */
export async function updateProductClient(
  productId: string,
  updates: Partial<Omit<Product, 'id'>>
): Promise<void> {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(productRef, updates);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Elimina un producto de Firestore (cliente)
 */
export async function deleteProductClient(productId: string): Promise<void> {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Archiva o restaura un producto en Firestore (cliente)
 */
export async function setProductArchivedClient(
  productId: string,
  archived: boolean
): Promise<void> {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(productRef, {
      archived,
      archivedAt: archived ? serverTimestamp() : null,
    });
  } catch (error) {
    console.error('Error archiving product:', error);
    throw error;
  }
}

/**
 * Obtiene historial de movimientos de un producto
 */
export async function getProductMovementsClient(productId: string): Promise<StockMovement[]> {
  try {
    const movementsRef = collection(db, COLLECTION_NAME, productId, 'movements');
    const q = query(movementsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const movements: StockMovement[] = [];
    querySnapshot.forEach((movementDoc) => {
      const data = movementDoc.data();
      movements.push({
        id: movementDoc.id,
        type: data.type === 'salida' ? 'salida' : 'entrada',
        quantity: Number(data.quantity) || 0,
        note: data.note || '',
        previousQuantity: Number(data.previousQuantity) || 0,
        newQuantity: Number(data.newQuantity) || 0,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    return movements;
  } catch (error) {
    console.error('Error getting product movements:', error);
    throw error;
  }
}

/**
 * Registra un movimiento de inventario y ajusta existencias de forma atómica
 */
export async function addProductMovementClient(
  productId: string,
  payload: {
    type: StockMovementType;
    quantity: number;
    note?: string;
  }
): Promise<void> {
  if (payload.quantity <= 0) {
    throw new Error('La cantidad del movimiento debe ser mayor a cero.');
  }

  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    const movementsRef = collection(db, COLLECTION_NAME, productId, 'movements');
    const movementRef = doc(movementsRef);

    await runTransaction(db, async (transaction) => {
      const productSnapshot = await transaction.get(productRef);
      if (!productSnapshot.exists()) {
        throw new Error('Producto no encontrado.');
      }

      const productData = productSnapshot.data();
      const currentQuantity = Number(productData.quantity) || 0;
      const isArchived = Boolean(productData.archived);

      if (isArchived) {
        throw new Error('No se pueden registrar movimientos en productos archivados.');
      }

      const delta = payload.type === 'entrada' ? payload.quantity : -payload.quantity;
      const newQuantity = currentQuantity + delta;
      if (newQuantity < 0) {
        throw new Error('No hay stock suficiente para registrar esta salida.');
      }

      transaction.update(productRef, { quantity: newQuantity });
      transaction.set(movementRef, {
        type: payload.type,
        quantity: payload.quantity,
        note: (payload.note || '').trim(),
        previousQuantity: currentQuantity,
        newQuantity,
        createdAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Error adding product movement:', error);
    throw error;
  }
}

