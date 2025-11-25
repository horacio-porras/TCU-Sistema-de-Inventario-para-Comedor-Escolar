"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Product, Category } from "@/lib/definitions";

interface InventoryChartProps {
  products: Product[];
}

export function InventoryChart({ products }: InventoryChartProps) {
  const data = products.reduce((acc, product) => {
    const category = acc.find((c) => c.name === product.category);
    if (category) {
      category.total += product.quantity;
    } else {
      acc.push({ name: product.category, total: product.quantity });
    }
    return acc;
  }, [] as { name: Category; total: number }[]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Visualización de Inventario</CardTitle>
        <CardDescription>Cantidad total de productos por categoría.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
             <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ 
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
