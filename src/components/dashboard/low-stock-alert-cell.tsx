'use client';

import { useEffect, useState } from 'react';
import { getLowStockAlert } from '@/lib/actions';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LowStockAlertCellProps {
  productName: string;
  currentQuantity: number;
  alertThreshold: number;
}

export function LowStockAlertCell({
  productName,
  currentQuantity,
  alertThreshold,
}: LowStockAlertCellProps) {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlert() {
      setIsLoading(true);
      const result = await getLowStockAlert({
        productName,
        currentQuantity,
        alertThreshold,
      });
      if (result.shouldAlert && result.alertMessage) {
        setAlertMessage(result.alertMessage);
      }
      setIsLoading(false);
    }
    fetchAlert();
  }, [productName, currentQuantity, alertThreshold]);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (alertMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
             <AlertCircle className="h-5 w-5 text-destructive" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{alertMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}
