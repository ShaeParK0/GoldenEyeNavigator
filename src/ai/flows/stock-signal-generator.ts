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
import { getStockData } from '../tools/getStockDataTool';

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
      'The overall buy/sell signal based on the three indicators (e.g., 강한 매수, 매수, 보류, 매도, 강한 매도).'
    ),
  historicalData: z.array(z.object({
    date: z.string(),
    close: z.number(),
  })).describe('Historical stock data for the last 252 days.')
});
export type StockSignalOutput = z.infer<typeof StockSignalOutputSchema>;

export async function generateStockSignal(
  input: StockSignalInput
): Promise<StockSignalOutput> {
  return stockSignalGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockSignalGeneratorPrompt',
  input: {schema: z.object({
    ticker: StockSignalInputSchema.shape.ticker,
    tradingStrategy: StockSignalInputSchema.shape.tradingStrategy,
  })},
  output: {schema: z.object({
    indicator1: StockSignalOutputSchema.shape.indicator1,
    indicator2: StockSignalOutputSchema.shape.indicator2,
    indicator3: StockSignalOutputSchema.shape.indicator3,
    signal: StockSignalOutputSchema.shape.signal,
  })},
  prompt: `You are an expert AI assistant specializing in stock technical analysis.

Your task is to select the three most appropriate technical indicators from the list below based on the provided stock ticker and trading strategy. Then, analyze each indicator to generate a buy, sell, or hold signal, assign scores, and determine an overall trading signal.

Stock Ticker: {{{ticker}}}
Trading Strategy: {{{tradingStrategy}}}

**Available Technical Indicators:**
1. SMA (Simple Moving Average)
2. EMA (Exponential Moving Average)
3. MACD (Moving Average Convergence Divergence)
4. Parabolic SAR
5. Ichimoku Cloud
6. RSI (Relative Strength Index)
7. Stochastic Oscillator
8. CCI (Commodity Channel Index)
9. ROC (Rate of Change)
10. Bollinger Bands
11. Keltner Channel
12. OBV (On-Balance Volume)
13. VWAP (Volume Weighted Average Price)
14. MFI (Money Flow Index)
15. CMF (Chaikin Money Flow)

**Indicator Signal Rules & Scoring:**
For each of the three selected indicators, determine the current signal and assign a score:
- **Buy Signal: +1 point**
- **Sell Signal: -1 point**
- **No Signal / Neutral: 0 points**

**Detailed Signal Criteria:**
- **SMA:** Buy when short-term SMA crosses above long-term SMA (Golden Cross). Sell when short-term SMA crosses below long-term SMA (Dead Cross).
- **EMA:** Buy when 12-period EMA crosses above 26-period EMA. Sell when 12-period EMA crosses below 26-period EMA.
- **MACD:** Buy when MACD line crosses above the signal line. Sell when MACD line crosses below the signal line.
- **Parabolic SAR:** Buy when the dot moves below the price candle. Sell when the dot moves above the price candle.
- **Ichimoku Cloud:** Buy when price is above the cloud and the conversion line crosses above the base line. Sell when price is below the cloud and the conversion line crosses below the base line.
- **RSI:** Buy when RSI is below 30 and starts to rise. Sell when RSI is above 70 and starts to fall.
- **Stochastic Oscillator:** Buy when the %K line crosses above the %D line below the 20 level. Sell when the %K line crosses below the %D line above the 80 level.
- **CCI:** Buy on a rebound from below -100. Sell on a downturn from above +100.
- **ROC:** Buy when ROC crosses above the zero line. Sell when ROC crosses below the zero line.
- **Bollinger Bands:** Buy on a rebound from the lower band. Sell on a downturn from the upper band.
- **Keltner Channel:** Buy when price breaks above the upper channel from above the middle line. Sell when price breaks below the lower channel from below the middle line.
- **OBV:** Buy if OBV is in an uptrend, confirming the price uptrend. Sell if OBV is in a downtrend, confirming the price downtrend.
- **VWAP:** Buy when price finds support above VWAP. Sell when price breaks below VWAP.
- **MFI:** Buy on a rebound from below 20. Sell on a downturn from above 80.
- **CMF:** Buy when CMF is greater than 0. Sell when CMF is less than 0.

**Overall Signal Calculation:**
Sum the scores from the three selected indicators.
- **Total Score of 3:** "강한 매수" (Strong Buy)
- **Total Score of 1 or 2:** "매수" (Buy)
- **Total Score of 0:** "보류" (Hold)
- **Total Score of -1 or -2:** "매도" (Sell)
- **Total Score of -3:** "강한 매도" (Strong Sell)

**Instructions:**
1.  Identify the three most suitable indicators for the given stock and strategy.
2.  Analyze the current state of the stock based on these three indicators and the rules provided.
3.  Calculate the total score.
4.  Determine the final "signal" based on the total score.
5.  Output the three recommended indicators and the final signal in JSON format.
  `,
});

const stockSignalGeneratorFlow = ai.defineFlow(
  {
    name: 'stockSignalGeneratorFlow',
    inputSchema: StockSignalInputSchema,
    outputSchema: StockSignalOutputSchema,
  },
  async input => {
    const [signalResult, historicalData] = await Promise.all([
      prompt(input),
      getStockData({ ticker: input.ticker }),
    ]);

    if (!signalResult.output) {
      throw new Error("Failed to generate stock signal.");
    }

    return {
      ...signalResult.output,
      historicalData,
    };
  }
);
