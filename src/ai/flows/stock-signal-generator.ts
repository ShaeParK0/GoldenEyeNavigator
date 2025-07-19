'use server';

/**
 * @fileOverview A stock signal generator AI agent.
 *
 * - generateStockSignal - A function that handles the stock signal generation process.
 * - StockSignalInput - The input type for the generateStockSignal function.
 * - StockSignalOutput - The return type for the generateStockSignal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StockSignalInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  tradingStrategy: z
    .string()
    .optional()
    .describe(
      'The desired trading strategy/timing (e.g., short-term volatility, long-term buy and hold).'
    ),
});
export type StockSignalInput = z.infer<typeof StockSignalInputSchema>;

const StockSignalOutputSchema = z.object({
  indicator1: z.string().describe('The first recommended technical indicator.'),
  indicator2: z.string().describe('The second recommended technical indicator.'),
  indicator3: z.string().describe('The third recommended technical indicator.'),
  signal: z
    .string()
    .describe(
      'The overall buy/sell signal based on the three indicators (e.g., Strong Buy, Buy, Hold, Sell, Strong Sell).'
    ),
});
export type StockSignalOutput = z.infer<typeof StockSignalOutputSchema>;

export async function generateStockSignal(
  input: StockSignalInput
): Promise<StockSignalOutput> {
  return stockSignalGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockSignalGeneratorPrompt',
  input: {schema: StockSignalInputSchema},
  output: {schema: StockSignalOutputSchema},
  prompt: `You are an AI assistant specializing in stock technical analysis.

  Based on the stock ticker and trading strategy provided, you will recommend three technical indicators and provide an overall buy/sell signal.

  Stock Ticker: {{{ticker}}}
  Trading Strategy: {{{tradingStrategy}}}

  Instructions:
  1.  Recommend three technical indicators that are most suitable for the given stock ticker and trading strategy.
  2.  Based on the current values of the three indicators, provide an overall buy/sell signal. The signal should be one of the following: Strong Buy, Buy, Hold, Sell, Strong Sell.
  3.  Output in JSON format.
  `,
});

const stockSignalGeneratorFlow = ai.defineFlow(
  {
    name: 'stockSignalGeneratorFlow',
    inputSchema: StockSignalInputSchema,
    outputSchema: StockSignalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
