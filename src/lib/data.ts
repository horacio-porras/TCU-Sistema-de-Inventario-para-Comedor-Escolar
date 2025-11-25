import type { Category, CategoryInfo } from '@/lib/definitions';
import {
  Carrot,
  Milk,
  Beef,
  Cookie,
  Container,
  GlassWater,
  Package,
} from 'lucide-react';

// Información de categorías (configuración estática)
export const categoryInfo: Record<Category, CategoryInfo> = {
  "Frutas y Verduras": { icon: Carrot, color: 'text-orange-500' },
  "Lácteos y Huevos": { icon: Milk, color: 'text-blue-300' },
  "Carnes y Pescados": { icon: Beef, color: 'text-red-500' },
  "Panadería y Repostería": { icon: Cookie, color: 'text-yellow-600' },
  "Enlatados y Conservas": { icon: Container, color: 'text-gray-500' },
  "Bebidas": { icon: GlassWater, color: 'text-cyan-400' },
  "Otros": { icon: Package, color: 'text-green-500' },
};
