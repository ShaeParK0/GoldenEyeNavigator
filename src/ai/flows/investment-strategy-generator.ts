'use server';

/**
 * @fileOverview Generates a personalized investment strategy based on user input.
 *
 * - investmentStrategyGenerator - A function that generates an investment strategy.
 * - InvestmentStrategyInput - The input type for the investmentStrategyGenerator function.
 * - InvestmentStrategyOutput - The return type for the investmentStrategyGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvestmentStrategyInputSchema = z.object({
  retirementHorizon: z.enum([
    '이미 은퇴함',
    '5년 미만',
    '5-10년',
    '10-20년',
    '20년 이상',
  ]).describe('Time until retirement.'),
  incomeNeed: z.enum([
    '월 소득 필요 없음',
    '월 0원 - 100만 원',
    '월 101만 원-300만 원',
    '월 301만 원-500만 원',
    '월 500만 원 이상',
  ]).describe('Level of income needed monthly.'),
  assetsSize: z.enum([
    '5천만 원 미만',
    '5천만 원-2억 5천만 원 미만',
    '2억 5천만 원-10억 원 미만',
    '10억 원-50억 원 미만',
    '50억 원 이상',
  ]).describe('Total investment assets size.'),
  taxSensitivity: z.enum([
    '매우 민감한',
    '다소 민감함',
    '민감하지 않음',
  ]).describe('Sensitivity to taxes.'),
  themePreference: z.enum([
    '배당',
    '성장',
    'ESG(환경, 사회, 지배구조)',
    '국내 중심',
    '해외 중심',
    '균형/분산',
  ]).describe('Preferred investment themes.'),
  regionPreference: z.enum([
    '국내 주식 중심',
    '미국 주식 중심',
    '기타 선진국 주식 중심(유럽, 일본 등)',
    '신흥국 주식 중심(중국, 인도 등)',
    '글로벌 분산 투자',
  ]).describe('Preferred investment region.'),
  managementStyle: z.enum([
    '적극적(직접 관리 선호)',
    '소극적/자동화(설정 후 신경 쓰지 않는 방식 선호)',
  ]).describe('Preferred management style.'),
  riskTolerance: z.enum([
    '보수적(자본 보존 우선)',
    '다소 보수적',
    '중립적(위험과 수익 균형)',
    '다소 공격적',
    '공격적(높은 수익 추구, 높은 위험 감수)',
  ]).describe('Risk tolerance level.'),
  otherAssets: z.string().describe('Description of other assets.'),
  name: z.string().describe('User name.'),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

const InvestmentStrategyOutputSchema = z.object({
  assetAllocation: z.string().describe('Recommended asset allocation as a pie chart (data URI).'),
  etfStockRecommendations: z.array(
    z.object({
      ticker: z.string().describe('ETF or stock ticker symbol.'),
      rationale: z.string().describe('Brief rationale for the recommendation.'),
    })
  ).describe('Recommended ETFs and stocks.'),
  tradingStrategy: z.string().describe('Overview of the trading strategy.'),
  strategyExplanation: z.string().describe('Detailed explanation of the strategy.'),
});
export type InvestmentStrategyOutput = z.infer<typeof InvestmentStrategyOutputSchema>;

export async function investmentStrategyGenerator(input: InvestmentStrategyInput): Promise<InvestmentStrategyOutput> {
  return investmentStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'investmentStrategyPrompt',
  input: {schema: InvestmentStrategyInputSchema},
  output: {schema: InvestmentStrategyOutputSchema},
  prompt: `Based on the following investment profile, generate a personalized investment strategy.

  Retirement Horizon: {{{retirementHorizon}}}
  Income Need: {{{incomeNeed}}}
  Assets Size: {{{assetsSize}}}
  Tax Sensitivity: {{{taxSensitivity}}}
  Theme Preference: {{{themePreference}}}
  Region Preference: {{{regionPreference}}}
  Management Style: {{{managementStyle}}}
  Risk Tolerance: {{{riskTolerance}}}
  Other Assets: {{{otherAssets}}}

  Provide the output in the following format:

  - assetAllocation: Recommended asset allocation as a pie chart (data URI).
  - etfStockRecommendations: An array of 3-4 recommended ETFs and stocks, each with a ticker symbol and brief rationale.
  - tradingStrategy: A concise overview of the trading strategy.
  - strategyExplanation: A more detailed explanation of the strategy.
  `,
});

const investmentStrategyFlow = ai.defineFlow(
  {
    name: 'investmentStrategyFlow',
    inputSchema: InvestmentStrategyInputSchema,
    outputSchema: InvestmentStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
