'use server';

/**
 * @fileOverview Flow for generating low stock alerts for the school canteen inventory.
 *
 * - generateLowStockAlerts - A function that triggers the low stock alert generation process.
 * - LowStockAlertsInput - The input type for the generateLowStockAlerts function, which includes the product name and current quantity.
 * - LowStockAlertsOutput - The return type for the generateLowStockAlerts function, indicating whether a low stock alert should be raised.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LowStockAlertsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  currentQuantity: z.number().describe('The current quantity of the product in stock.'),
  alertThreshold: z.number().describe('The quantity below which an alert should be triggered.'),
});
export type LowStockAlertsInput = z.infer<typeof LowStockAlertsInputSchema>;

const LowStockAlertsOutputSchema = z.object({
  shouldAlert: z.boolean().describe('Whether a low stock alert should be raised.'),
  alertMessage: z.string().optional().describe('A message to display in the alert, if shouldAlert is true.'),
});
export type LowStockAlertsOutput = z.infer<typeof LowStockAlertsOutputSchema>;

export async function generateLowStockAlerts(input: LowStockAlertsInput): Promise<LowStockAlertsOutput> {
  return lowStockAlertsFlow(input);
}

const shouldRaiseAlert = ai.defineTool({
  name: 'shouldRaiseAlert',
  description: 'Determines if a low stock alert should be raised based on current quantity and alert threshold.',
  inputSchema: z.object({
    currentQuantity: z.number().describe('The current quantity of the product.'),
    alertThreshold: z.number().describe('The quantity below which an alert should be triggered.'),
    productName: z.string().describe('The name of the product.'),
  }),
  outputSchema: z.boolean(),
},
async (input) => {
  return input.currentQuantity < input.alertThreshold;
});

const lowStockAlertsPrompt = ai.definePrompt({
  name: 'lowStockAlertsPrompt',
  input: {schema: LowStockAlertsInputSchema},
  output: {schema: LowStockAlertsOutputSchema},
  tools: [shouldRaiseAlert],
  prompt: `Based on the current stock level of {{productName}}, determine if a low stock alert should be raised.

Consider the alert threshold and the current quantity of the product.

Use the shouldRaiseAlert tool to make the determination. If the tool determines that an alert should be raised, generate a message indicating that the product is running low and needs to be replenished.
`,
});

const lowStockAlertsFlow = ai.defineFlow(
  {
    name: 'lowStockAlertsFlow',
    inputSchema: LowStockAlertsInputSchema,
    outputSchema: LowStockAlertsOutputSchema,
  },
  async input => {
    const {output} = await lowStockAlertsPrompt(input);
    return output!;
  }
);
