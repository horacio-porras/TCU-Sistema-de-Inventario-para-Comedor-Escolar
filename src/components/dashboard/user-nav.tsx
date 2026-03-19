"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase";

export function UserNav() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const displayName = useMemo(() => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    return "Personal";
  }, [currentUser?.displayName]);

  const displayEmail = currentUser?.email ?? "Sin correo";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error during sign-out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group relative h-9 w-9 rounded-full bg-transparent hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Avatar className="h-9 w-9 transition-transform duration-200 group-hover:scale-[1.02] group-data-[state=open]:scale-[1.02]">
            <AvatarFallback className="bg-sidebar/90 text-sidebar-foreground transition-all duration-200 group-hover:bg-sidebar/80 group-hover:shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border))] group-data-[state=open]:bg-sidebar/80 group-data-[state=open]:shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border))]">
              <User />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Settings className="mr-2" />
            <span>Configuración</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
            <LogOut className="mr-2" />
            <span>{isSigningOut ? "Cerrando..." : "Cerrar Sesión"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
