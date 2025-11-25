"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryInfo } from "@/lib/data";
import { getProductsClient } from "@/lib/firestore-client";
import { CATEGORIES, type Product, type Category } from "@/lib/definitions";
import { Search } from "lucide-react";
import { AddProductSheet } from "./add-product-sheet";

const ALERT_THRESHOLD = 20;

export function ProductsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
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

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) =>
      categoryFilter === "all" ? true : product.category === categoryFilter
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-10 w-full md:w-80"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Select onValueChange={setCategoryFilter} defaultValue="all">
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddProductSheet onProductAdded={() => {
            getProductsClient().then(setProducts).catch(console.error);
          }} />
        </div>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead>Fecha de Vencimiento</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const CategoryIcon = categoryInfo[product.category].icon;
                const isLowStock = product.quantity < ALERT_THRESHOLD;
                const isExpired = new Date(product.expirationDate) < new Date();
                
                let status: "ok" | "low" | "expired" = "ok";
                if(isExpired) status = "expired";
                else if (isLowStock) status = "low";

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        {product.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{product.quantity}</TableCell>
                    <TableCell>
                      {new Date(product.expirationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {status === 'ok' && <Badge variant="secondary">En Stock</Badge>}
                      {status === 'low' && <Badge variant="destructive">Stock Bajo</Badge>}
                      {status === 'expired' && <Badge variant="destructive">Expirado</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
