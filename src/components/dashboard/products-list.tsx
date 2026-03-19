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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { categoryInfo } from "@/lib/data";
import {
  addProductMovementClient,
  getProductMovementsClient,
  getProductsClient,
  setProductArchivedClient,
  updateProductClient,
} from "@/lib/firestore-client";
import {
  CATEGORIES,
  type Product,
  type Category,
  type StockMovement,
  type StockMovementType,
} from "@/lib/definitions";
import { Archive, Eye, MoreHorizontal, Pencil, Search, ArrowDownUp, Calendar as CalendarIcon } from "lucide-react";
import { AddProductSheet } from "./add-product-sheet";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ALERT_THRESHOLD = 20;
type StatusFilter = "active" | "archived" | "all";

const BADGE_BASE_CLASS = "rounded-full border px-2.5 py-0.5 text-xs font-medium";
const STOCK_OK_BADGE_CLASS = `${BADGE_BASE_CLASS} border-green-200 bg-green-100 text-green-800 hover:bg-green-100`;
const STOCK_WARNING_BADGE_CLASS = `${BADGE_BASE_CLASS} border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100`;
const STOCK_DANGER_BADGE_CLASS = `${BADGE_BASE_CLASS} border-red-200 bg-red-100 text-red-800 hover:bg-red-100`;
const STOCK_ARCHIVED_BADGE_CLASS = `${BADGE_BASE_CLASS} border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-100`;

export function ProductsList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [movementProductId, setMovementProductId] = useState<string | null>(null);
  const [archiveProductId, setArchiveProductId] = useState<string | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingMovement, setSavingMovement] = useState(false);
  const [savingArchive, setSavingArchive] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<Category | "">("");
  const [editDate, setEditDate] = useState<Date | undefined>();

  const [movementType, setMovementType] = useState<StockMovementType>("entrada");
  const [movementQuantity, setMovementQuantity] = useState("");
  const [movementNote, setMovementNote] = useState("");

  useEffect(() => {
    void refreshProducts();
  }, []);

  async function refreshProducts() {
    try {
      setLoading(true);
      const fetchedProducts = await getProductsClient(true);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadMovements(productId: string) {
    try {
      setLoadingMovements(true);
      const productMovements = await getProductMovementsClient(productId);
      setMovements(productMovements);
    } catch (error) {
      console.error("Error loading movements:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de movimientos",
        variant: "destructive",
      });
    } finally {
      setLoadingMovements(false);
    }
  }

  function openDetails(product: Product) {
    setDetailsProductId(product.id);
    void loadMovements(product.id);
  }

  function openEdit(product: Product) {
    setEditProductId(product.id);
    setEditName(product.name);
    setEditCategory(product.category);
    const parsedDate = new Date(`${product.expirationDate}T00:00:00`);
    setEditDate(Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate);
  }

  function openMovement(product: Product) {
    setMovementProductId(product.id);
    setMovementType("entrada");
    setMovementQuantity("");
    setMovementNote("");
  }

  function openArchive(product: Product) {
    setArchiveProductId(product.id);
  }

  const detailsProduct = products.find((product) => product.id === detailsProductId) ?? null;
  const editProduct = products.find((product) => product.id === editProductId) ?? null;
  const movementProduct = products.find((product) => product.id === movementProductId) ?? null;
  const archiveProduct = products.find((product) => product.id === archiveProductId) ?? null;

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().startsWith(searchTerm.trim().toLowerCase())
    )
    .filter((product) =>
      categoryFilter === "all" ? true : product.category === categoryFilter
    )
    .filter((product) =>
      statusFilter === "all"
        ? true
        : statusFilter === "archived"
          ? Boolean(product.archived)
          : !product.archived
    );

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editProduct) return;

    if (!editName.trim() || !editCategory || !editDate) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingEdit(true);
      await updateProductClient(editProduct.id, {
        name: editName.trim(),
        category: editCategory as Category,
        expirationDate: format(editDate, "yyyy-MM-dd"),
      });
      await refreshProducts();
      setEditProductId(null);
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleMovementSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!movementProduct) return;

    const quantity = Number(movementQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a cero",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingMovement(true);
      await addProductMovementClient(movementProduct.id, {
        type: movementType,
        quantity,
        note: movementNote,
      });
      await refreshProducts();
      setMovementProductId(null);
      toast({
        title: "Movimiento registrado",
        description: "El inventario fue actualizado correctamente",
        className: "bg-white text-slate-900 border-slate-200",
      });
    } catch (error) {
      console.error("Error adding movement:", error);
      const description =
        error instanceof Error ? error.message : "No se pudo registrar el movimiento";
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setSavingMovement(false);
    }
  }

  async function handleArchiveSubmit() {
    if (!archiveProduct) return;

    try {
      setSavingArchive(true);
      await setProductArchivedClient(archiveProduct.id, !archiveProduct.archived);
      await refreshProducts();
      setArchiveProductId(null);
      toast({
        title: archiveProduct.archived ? "Producto restaurado" : "Producto archivado",
        description: archiveProduct.archived
          ? "El producto volvió a estar activo"
          : "El producto quedó archivado",
        className: "bg-white text-slate-900 border-slate-200",
      });
    } catch (error) {
      console.error("Error archiving product:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del producto",
        variant: "destructive",
      });
    } finally {
      setSavingArchive(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre..."
            className="h-10 w-full border-border bg-slate-100/70 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring md:w-80"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Select onValueChange={setCategoryFilter} defaultValue="all">
            <SelectTrigger className="h-10 w-full border-border bg-slate-100/70 text-foreground focus:ring-ring md:w-[200px]">
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
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="h-10 w-full border-border bg-slate-100/70 text-foreground focus:ring-ring md:w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
          <AddProductSheet onProductAdded={() => {
            void refreshProducts();
          }} />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100/70 hover:bg-slate-100/70">
              <TableHead className="font-semibold text-slate-700">Producto</TableHead>
              <TableHead className="font-semibold text-slate-700">Categoría</TableHead>
              <TableHead className="text-center font-semibold text-slate-700">Cantidad</TableHead>
              <TableHead className="font-semibold text-slate-700">Fecha de Vencimiento</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Estado</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-600">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const CategoryIcon = categoryInfo[product.category].icon;
                const isLowStock = product.quantity < ALERT_THRESHOLD;
                const isExpired = new Date(product.expirationDate) < new Date();
                const isArchived = Boolean(product.archived);

                let status: "ok" | "low" | "expired" | "archived" = "ok";
                if (isArchived) status = "archived";
                else if (isExpired) status = "expired";
                else if (isLowStock) status = "low";

                return (
                  <TableRow key={product.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-700">
                        <CategoryIcon className="h-4 w-4 text-slate-500" />
                        {product.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-800">{product.quantity}</TableCell>
                    <TableCell className="text-slate-700">
                      {new Date(product.expirationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {status === 'ok' && (
                        <Badge className={STOCK_OK_BADGE_CLASS}>
                          En Stock
                        </Badge>
                      )}
                      {status === 'low' && <Badge className={STOCK_WARNING_BADGE_CLASS}>Stock Bajo</Badge>}
                      {status === 'expired' && <Badge className={STOCK_DANGER_BADGE_CLASS}>Expirado</Badge>}
                      {status === 'archived' && <Badge className={STOCK_ARCHIVED_BADGE_CLASS}>Archivado</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Acciones del producto">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetails(product)}>
                            <Eye />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openMovement(product)}
                            disabled={Boolean(product.archived)}
                          >
                            <ArrowDownUp />
                            Movimiento
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(product)}>
                            <Pencil />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openArchive(product)}>
                            <Archive />
                            {product.archived ? "Restaurar" : "Archivar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-600">
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(detailsProduct)} onOpenChange={(open) => !open && setDetailsProductId(null)}>
        <SheetContent className="w-full border-border bg-card text-foreground sm:max-w-lg">
          <SheetHeader>
              <SheetTitle>Detalle del Producto</SheetTitle>
            <SheetDescription>
              Información general y trazabilidad de movimientos.
            </SheetDescription>
          </SheetHeader>
          {detailsProduct ? (
            <div className="mt-4 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="font-medium">{detailsProduct.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categoría</p>
                  <p className="font-medium">{detailsProduct.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cantidad actual</p>
                  <p className="font-medium">{detailsProduct.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento</p>
                  <p className="font-medium">{new Date(detailsProduct.expirationDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Movimientos</h3>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-border bg-slate-100/70 p-3">
                  {loadingMovements ? (
                    <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
                  ) : movements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay movimientos registrados.</p>
                  ) : (
                    movements.map((movement) => (
                      <div key={movement.id} className="rounded-md border border-border bg-card p-2">
                        <div className="flex items-center justify-between gap-3">
                          <Badge
                            className={
                              movement.type === "entrada"
                                ? STOCK_OK_BADGE_CLASS
                                : STOCK_DANGER_BADGE_CLASS
                            }
                          >
                            {movement.type === "entrada" ? "Entrada" : "Salida"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(movement.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">
                          Cantidad: <span className="font-medium">{movement.quantity}</span> (
                          {movement.previousQuantity} → {movement.newQuantity})
                        </p>
                        {movement.note ? (
                          <p className="text-sm text-muted-foreground">{movement.note}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(editProduct)} onOpenChange={(open) => !open && setEditProductId(null)}>
        <SheetContent className="border-border bg-card text-foreground">
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <SheetHeader>
              <SheetTitle>Editar Producto</SheetTitle>
              <SheetDescription>Actualice la información principal del producto.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  placeholder="Ej. Manzanas"
                  className="col-span-3 border-border bg-slate-100/70 text-foreground"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Categoría
                </Label>
                <Select value={editCategory} onValueChange={(value) => setEditCategory(value as Category)}>
                  <SelectTrigger
                    id="edit-category"
                    className="col-span-3 border-border bg-slate-100/70 text-foreground"
                  >
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-expiration" className="text-right">
                  Expiración
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-expiration"
                      type="button"
                      variant="outline"
                      className={cn(
                        "col-span-3 w-full justify-start border-border bg-slate-100/70 text-left font-normal text-foreground hover:bg-slate-200 hover:text-foreground",
                        !editDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDate ? format(editDate, "PPP") : <span>Elija una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <SheetFooter>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(movementProduct)}
        onOpenChange={(open) => !open && setMovementProductId(null)}
      >
        <SheetContent className="w-full border-border bg-card text-foreground sm:max-w-lg">
          <form className="space-y-4" onSubmit={handleMovementSubmit}>
            <SheetHeader>
              <SheetTitle>Registrar Movimiento</SheetTitle>
              <SheetDescription>
              Ajuste el inventario con una entrada o salida.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-2">
              <Label htmlFor="movement-type">Tipo de movimiento</Label>
              <Select
                value={movementType}
                onValueChange={(value) => setMovementType(value as StockMovementType)}
              >
                <SelectTrigger id="movement-type" className="border-border bg-slate-100/70 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-quantity">Cantidad</Label>
              <Input
                id="movement-quantity"
                type="number"
                min="1"
                placeholder="0"
                className="border-border bg-slate-100/70 text-foreground"
                value={movementQuantity}
                onChange={(event) => setMovementQuantity(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-note">Nota (opcional)</Label>
              <Textarea
                id="movement-note"
                className="border-border bg-slate-100/70 text-foreground"
                value={movementNote}
                onChange={(event) => setMovementNote(event.target.value)}
                placeholder="Motivo del movimiento"
              />
            </div>

            <SheetFooter>
              <Button type="submit" disabled={savingMovement}>
                {savingMovement ? "Guardando..." : "Registrar Movimiento"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(archiveProduct)}
        onOpenChange={(open) => !open && setArchiveProductId(null)}
      >
        <DialogContent className="border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>{archiveProduct?.archived ? "Restaurar producto" : "Archivar producto"}</DialogTitle>
            <DialogDescription>
              {archiveProduct?.archived
                ? "El producto volverá a estar visible como activo en el inventario."
                : "El producto se mantendrá en historial, pero quedará fuera de operación."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border bg-slate-100/70 text-foreground hover:bg-slate-200 hover:text-foreground"
              onClick={() => setArchiveProductId(null)}
            >
              Cancelar
            </Button>
            <Button onClick={handleArchiveSubmit} disabled={savingArchive}>
              {savingArchive
                ? "Guardando..."
                : archiveProduct?.archived
                  ? "Restaurar"
                  : "Archivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
