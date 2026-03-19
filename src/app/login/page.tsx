
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    if (!next || !next.startsWith("/")) {
      return "/dashboard";
    }
    return next;
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(nextPath);
      }
    });

    return unsubscribe;
  }, [nextPath, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace(nextPath);
    } catch (error: unknown) {
      console.error("Error during sign-in:", error);
      setErrorMessage("Credenciales inválidas o configuración de autenticación incompleta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center pb-4">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={128} 
                height={128} 
                priority
                loading="eager"
                className="object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight font-headline">
              Inventario de Comedor Escolar
            </CardTitle>
            <CardDescription>
              Acceso para personal autorizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="personal@escuela.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Sistema de Inventario para Comedor Escolar © {new Date().getFullYear()}</p>
        <p>Escuela San Rafael de Santa Ana</p>
      </footer>
    </main>
  );
}
