import { ProductsList } from "@/components/dashboard/products-list";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
       <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Productos
        </h1>
        <p className="text-muted-foreground">
          Registre, consulte y visualice los productos del comedor.
        </p>
      </header>
      <ProductsList />
    </div>
  );
}
