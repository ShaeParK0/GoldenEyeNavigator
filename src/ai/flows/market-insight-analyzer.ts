'use server';

/**
 * @fileOverview AI-powered market insight analyzer.
 *
 * - analyzeMarketInsight - A function that analyzes market insights and suggests actions.
 * - MarketInsightInput - The input type for the analyzeMarketInsight function.
 * - MarketInsightOutput - The return type for the analyzeMarketInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketInsightInputSchema = z.object({
  marketNews: z.string().describe('Recent market news and trends provided by the user.'),
});
export type MarketInsightInput = z.infer<typeof MarketInsightInputSchema>;

const MarketInsightOutputSchema = z.object({
  marketSummary: z.string().describe('A summary of the recent market news and trends.'),
  suggestedActions: z.string().describe('Suggested actions based on the market analysis.'),
  rationale: z.string().describe('The rationale behind the suggested actions.'),
});
export type MarketInsightOutput = z.infer<typeof MarketInsightOutputSchema>;

export async function analyzeMarketInsight(input: MarketInsightInput): Promise<MarketInsightOutput> {
  return analyzeMarketInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketInsightPrompt',
  input: {schema: MarketInsightInputSchema},
  output: {schema: MarketInsightOutputSchema},
  prompt: `You are an expert financial analyst providing insights on market news and trends.

  Analyze the following market news and trends and provide a market summary, suggested actions, and the rationale behind those actions.

  Market News and Trends: {{{marketNews}}}

  Format your response as follows:
  Market Summary: [Market summary here]
  Suggested Actions: [Suggested actions here]
  Rationale: [Rationale here]`,
});

const analyzeMarketInsightFlow = ai.defineFlow(
  {
    name: 'analyzeMarketInsightFlow',
    inputSchema: MarketInsightInputSchema,
    outputSchema: MarketInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
