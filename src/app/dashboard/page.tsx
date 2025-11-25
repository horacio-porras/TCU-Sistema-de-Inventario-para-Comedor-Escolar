"use client";

import { useEffect, useState } from "react";
import { categoryInfo } from "@/lib/data";
import { getProductsClient } from "@/lib/firestore-client";
import type { Product } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Package, AlertTriangle } from "lucide-react";
import { InventoryChart } from "@/components/dashboard/inventory-chart";
import { LowStockItems } from "@/components/dashboard/low-stock-items";

const ALERT_THRESHOLD = 20;

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const fetchedProducts = await getProductsClient();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
  const uniqueCategories = new Set(products.map(p => p.category)).size;
  const lowStockCount = products.filter(p => p.quantity < ALERT_THRESHOLD).length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Un resumen del inventario del comedor.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Productos Totales
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Unidades en inventario
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                <Boxes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueCategories}</div>
                <p className="text-xs text-muted-foreground">
                  Categorías de productos activos
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Items que necesitan atención
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <InventoryChart products={products} />
            </div>
            <div className="lg:col-span-3">
              <LowStockItems products={products} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
