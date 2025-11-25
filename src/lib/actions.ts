'use server';
import { generateLowStockAlerts, LowStockAlertsInput } from '@/ai/flows/low-stock-alerts';

export async function getLowStockAlert(input: LowStockAlertsInput) {
  try {
    const result = await generateLowStockAlerts(input);
    return result;
  } catch (error) {
    console.error('AI alert generation failed:', error);
    return { shouldAlert: false, alertMessage: 'No se pudo generar la alerta.' };
  }
}
