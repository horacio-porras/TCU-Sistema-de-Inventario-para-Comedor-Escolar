import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/definitions";
import { LowStockAlertCell } from "./low-stock-alert-cell";

const ALERT_THRESHOLD = 20;

interface LowStockItemsProps {
  products: Product[];
}

export function LowStockItems({ products }: LowStockItemsProps) {
  const lowStockProducts = products.filter(
    (p) => p.quantity < ALERT_THRESHOLD
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Alertas de Stock Bajo</CardTitle>
        <CardDescription>
          Productos que necesitan ser reabastecidos pronto. El umbral de alerta es {ALERT_THRESHOLD} unidades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Alerta IA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">{product.quantity}</Badge>
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <LowStockAlertCell
                      productName={product.name}
                      currentQuantity={product.quantity}
                      alertThreshold={ALERT_THRESHOLD}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No hay productos con stock bajo.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
