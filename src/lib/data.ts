import type { Product, Category, CategoryInfo } from '@/lib/definitions';
import {
  Carrot,
  Milk,
  Beef,
  Cookie,
  Container,
  GlassWater,
  Package,
} from 'lucide-react';

export const products: Product[] = [
  { id: '1', name: 'Manzanas', category: 'Frutas y Verduras', quantity: 50, expirationDate: '2024-10-15' },
  { id: '2', name: 'Leche Entera', category: 'Lácteos y Huevos', quantity: 24, expirationDate: '2024-09-20' },
  { id: '3', name: 'Carne Molida', category: 'Carnes y Pescados', quantity: 15, expirationDate: '2024-09-10' },
  { id: '4', name: 'Pan de Molde', category: 'Panadería y Repostería', quantity: 30, expirationDate: '2024-09-05' },
  { id: '5', name: 'Atún en Lata', category: 'Enlatados y Conservas', quantity: 100, expirationDate: '2026-08-01' },
  { id: '6', name: 'Agua Embotellada', category: 'Bebidas', quantity: 8, expirationDate: '2025-01-01' },
  { id: '7', name: 'Plátanos', category: 'Frutas y Verduras', quantity: 80, expirationDate: '2024-09-08' },
  { id: '8', name: 'Huevos', category: 'Lácteos y Huevos', quantity: 120, expirationDate: '2024-09-25' },
  { id: '9', name: 'Pollo Deshuesado', category: 'Carnes y Pescados', quantity: 20, expirationDate: '2024-09-12' },
  { id: '10', name: 'Galletas de Avena', category: 'Panadería y Repostería', quantity: 40, expirationDate: '2024-12-01' },
  { id: '11', name: 'Arroz', category: 'Otros', quantity: 200, expirationDate: '2026-01-01' },
  { id: '12', name: 'Frijoles Negros Enlatados', category: 'Enlatados y Conservas', quantity: 9, expirationDate: '2025-11-20' },
];

export const categoryInfo: Record<Category, CategoryInfo> = {
  "Frutas y Verduras": { icon: Carrot, color: 'text-orange-500' },
  "Lácteos y Huevos": { icon: Milk, color: 'text-blue-300' },
  "Carnes y Pescados": { icon: Beef, color: 'text-red-500' },
  "Panadería y Repostería": { icon: Cookie, color: 'text-yellow-600' },
  "Enlatados y Conservas": { icon: Container, color: 'text-gray-500' },
  "Bebidas": { icon: GlassWater, color: 'text-cyan-400' },
  "Otros": { icon: Package, color: 'text-green-500' },
};
