import { config } from 'dotenv';
config();

import '@/ai/flows/market-insight-analyzer.ts';
import '@/ai/flows/investment-strategy-generator.ts';
import '@/ai/flows/stock-signal-generator.ts';
import '@/ai/tools/getStockDataTool.ts';
import '@/ai/flows/subscribeToSignals.ts';
import { scheduleDailySignalChecks } from '@/services/emailService';

// Start the daily email scheduler
scheduleDailySignalChecks();
