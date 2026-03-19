import type { LucideIcon } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  expirationDate: string; // ISO string date
  archived?: boolean;
  archivedAt?: string | null;
};

export type StockMovementType = "entrada" | "salida";

export type StockMovement = {
  id: string;
  type: StockMovementType;
  quantity: number;
  note: string;
  previousQuantity: number;
  newQuantity: number;
  createdAt: string;
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
