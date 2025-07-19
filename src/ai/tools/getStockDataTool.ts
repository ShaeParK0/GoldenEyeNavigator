'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getHistoricalData } from '@/services/stockService';

export const getStockData = ai.defineTool(
    {
      name: 'getStockData',
      description: 'Get historical stock data for the last 252 trading days.',
      inputSchema: z.object({
        ticker: z.string().describe('The stock ticker symbol.'),
      }),
      outputSchema: z.array(z.object({
        date: z.string().describe('The date of the data point (YYYY-MM-DD).'),
        close: z.number().describe('The closing price for the day.'),
      })),
    },
    async ({ticker}) => {
      return getHistoricalData(ticker);
    }
  );
