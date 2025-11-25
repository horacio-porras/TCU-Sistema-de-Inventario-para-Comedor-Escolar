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
  type DocumentData,
} from 'firebase/firestore';
import type { Product } from './definitions';

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
  }
}

/**
 * Obtiene todos los productos de Firestore (cliente)
 */
export async function getProductsClient(): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(firestoreDocToProduct(doc.data(), doc.id));
    });
    
    return products;
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

