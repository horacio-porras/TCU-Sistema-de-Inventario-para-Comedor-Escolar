"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/definitions";
import { addProductClient } from "@/lib/firestore-client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AddProductSheetProps {
  onProductAdded?: () => void;
}

export function AddProductSheet({ onProductAdded }: AddProductSheetProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [quantity, setQuantity] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !quantity || !date) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await addProductClient({
        name,
        category: category as Category,
        quantity: parseInt(quantity, 10),
        expirationDate: format(date, "yyyy-MM-dd"),
      });
      
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      });
      
      // Reset form
      setName("");
      setCategory("");
      setQuantity("");
      setDate(undefined);
      setOpen(false);
      
      // Notify parent component
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Registrar Producto
        </Button>
      </SheetTrigger>
      <SheetContent className="border-border bg-card text-foreground">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Registrar Nuevo Producto</SheetTitle>
            <SheetDescription>
              Añada los detalles del nuevo producto al inventario.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                placeholder="Ej. Manzanas"
                className="col-span-3 border-border bg-slate-100/70 text-foreground"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                <SelectTrigger className="col-span-3 border-border bg-slate-100/70 text-foreground">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                className="col-span-3 border-border bg-slate-100/70 text-foreground"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expirationDate" className="text-right">
                Expiración
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start border-border bg-slate-100/70 text-left font-normal text-foreground hover:bg-slate-200 hover:text-foreground",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Elija una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
