import type { LucideIcon } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  expirationDate: string; // ISO string date
};

export const CATEGORIES = [
  "Frutas y Verduras",
  "Lácteos y Huevos",
  "Carnes y Pescados",
  "Panadería y Repostería",
  "Enlatados y Conservas",
  "Bebidas",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type CategoryInfo = {
  icon: LucideIcon;
  color: string;
};
