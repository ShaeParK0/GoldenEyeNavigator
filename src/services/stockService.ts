import { subDays, format } from 'date-fns';

type HistoricalDataPoint = {
  date: string;
  close: number;
};

/**
 * Generates mocked historical stock data for the last 252 trading days.
 * @param ticker The stock ticker symbol (used for varying the data).
 * @returns An array of historical data points.
 */
export async function getHistoricalData(ticker: string): Promise<HistoricalDataPoint[]> {
  const data: HistoricalDataPoint[] = [];
  const today = new Date();
  let lastClose = 100 + (ticker.charCodeAt(0) % 50); // Start price based on ticker

  for (let i = 0; i < 252; i++) {
    const date = subDays(today, i);
    
    // Simulate some market volatility
    const changePercent = (Math.random() - 0.49) * 0.05; // -2.5% to +2.5% change
    const changeAmount = lastClose * changePercent;
    let close = lastClose + changeAmount;
    if (close < 1) close = 1; // Prevent price from going below 1

    // Add a slight upward trend over time
    close += i * 0.05 * (ticker.charCodeAt(1) % 5 / 10);
    
    // We are iterating backwards, so add to the beginning of the array
    data.unshift({
      date: format(date, 'yyyy-MM-dd'),
      close: parseFloat(close.toFixed(2)),
    });

    lastClose = close;
  }

  return data;
}
