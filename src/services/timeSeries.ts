import { supabase } from '../config/supabase';
import type { Transaction } from '../types';

interface TimeSeriesData {
  time: number;
  inflow: number;
  outflow: number;
}

// Update aggregated data in real-time for each transaction
export async function updateTimeSeriesData(transactions: Transaction[]): Promise<void> {
  try {
    if (transactions.length === 0) return;

    console.log('\n=== Time Series Data Update Start ===');
    console.log(`Processing ${transactions.length} transactions...`);

    // 시간별, 일별, 월별 데이터를 한 번에 업데이트
    const hourlyData = new Map<string, { inflow: number; outflow: number }>();
    const dailyData = new Map<string, { inflow: number; outflow: number }>();
    const monthlyData = new Map<string, { inflow: number; outflow: number }>();

    // 트랜잭션 데이터 집계
    transactions.forEach((transaction, index) => {
      try {
        const timestamp = Number(transaction.timestamp);
        const value = Number(transaction.value);
        const date = new Date(timestamp * 1000);

        console.log(`\nProcessing transaction ${index + 1}/${transactions.length}:`);
        console.log(`- Time: ${date.toLocaleString()}`);
        console.log(`- Type: ${transaction.type}`);
        console.log(`- Value: ${value}`);

        // 시간별 데이터 집계 (3600초 단위)
        const hourlyId = Math.floor(timestamp / 3600);
        const hourlyCurrent = hourlyData.get(hourlyId.toString()) || { inflow: 0, outflow: 0 };
        if (transaction.type === 'inflow') {
          hourlyCurrent.inflow += value;
        } else {
          hourlyCurrent.outflow += value;
        }
        hourlyData.set(hourlyId.toString(), hourlyCurrent);

        // 일별 데이터 집계 (86400초 단위)
        const dailyId = Math.floor(timestamp / 86400);
        const dailyCurrent = dailyData.get(dailyId.toString()) || { inflow: 0, outflow: 0 };
        if (transaction.type === 'inflow') {
          dailyCurrent.inflow += value;
        } else {
          dailyCurrent.outflow += value;
        }
        dailyData.set(dailyId.toString(), dailyCurrent);

        // 월별 데이터 집계 (30일 기준)
        const monthlyId = Math.floor(timestamp / (86400 * 30));
        const monthlyCurrent = monthlyData.get(monthlyId.toString()) || { inflow: 0, outflow: 0 };
        if (transaction.type === 'inflow') {
          monthlyCurrent.inflow += value;
        } else {
          monthlyCurrent.outflow += value;
        }
        monthlyData.set(monthlyId.toString(), monthlyCurrent);

        // 로깅 개선: 실제 시간과 period ID의 관계를 명확히 표시
        console.log('Aggregated to:');
        console.log(`- Hourly ID: ${hourlyId} (${new Date(hourlyId * 3600 * 1000).toLocaleString()})`);
        console.log(`- Daily ID: ${dailyId} (${new Date(dailyId * 86400 * 1000).toLocaleString()})`);
        console.log(`- Monthly ID: ${monthlyId} (${new Date(monthlyId * 86400 * 30 * 1000).toLocaleString()})`);
      } catch (error) {
        console.error('Error processing transaction:', {
          transaction,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    });

    console.log('\n=== Aggregated Data Summary ===');
    console.log('Hourly Data:', {
      periods: hourlyData.size,
      totalInflow: Array.from(hourlyData.values()).reduce((sum, data) => sum + data.inflow, 0),
      totalOutflow: Array.from(hourlyData.values()).reduce((sum, data) => sum + data.outflow, 0),
    });
    console.log('Daily Data:', {
      periods: dailyData.size,
      totalInflow: Array.from(dailyData.values()).reduce((sum, data) => sum + data.inflow, 0),
      totalOutflow: Array.from(dailyData.values()).reduce((sum, data) => sum + data.outflow, 0),
    });
    console.log('Monthly Data:', {
      periods: monthlyData.size,
      totalInflow: Array.from(monthlyData.values()).reduce((sum, data) => sum + data.inflow, 0),
      totalOutflow: Array.from(monthlyData.values()).reduce((sum, data) => sum + data.outflow, 0),
    });

    // 각 기간별 데이터를 한 번에 업데이트
    await Promise.all([
      updateTimeSeriesForPeriod(hourlyData, 'hourly'),
      updateTimeSeriesForPeriod(dailyData, 'daily'),
      updateTimeSeriesForPeriod(monthlyData, 'monthly'),
    ]);

    console.log('\n=== Time Series Data Update Complete ===\n');
  } catch (error) {
    console.error('Error updating time series data:', {
      transactionCount: transactions.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

async function updateTimeSeriesForPeriod(
  data: Map<string, { inflow: number; outflow: number }>,
  periodType: 'hourly' | 'daily' | 'monthly'
): Promise<void> {
  try {
    console.log(`\nUpdating ${periodType} data...`);

    const records = Array.from(data.entries()).map(([periodId, values]) => {
      // period_id를 기반으로 해당 기간의 시작 timestamp 계산
      const id = Number(periodId);
      let firstTimestamp: number;

      switch (periodType) {
        case 'hourly':
          firstTimestamp = id * 3600;
          break;
        case 'daily':
          firstTimestamp = id * 86400;
          break;
        case 'monthly':
          firstTimestamp = id * 86400 * 30;
          break;
      }

      const record = {
        period_type: periodType,
        period_id: periodId,
        first_timestamp: firstTimestamp.toString(),
        inflow_amount: values.inflow.toString(),
        outflow_amount: values.outflow.toString(),
        last_updated: new Date().toISOString(),
      };

      console.log(`Period ${periodId}:`, {
        periodId,
        firstTimestamp,
        time: new Date(firstTimestamp * 1000).toLocaleString(),
        inflow: values.inflow,
        outflow: values.outflow,
      });

      return record;
    });

    const { error } = await supabase.from('flow_time_series_realtime').upsert(records, {
      onConflict: 'period_type,period_id',
      count: 'exact',
    });

    if (error) {
      console.error(`Error updating ${periodType} time series data:`, {
        recordCount: records.length,
        error: error.message,
      });
      throw error;
    }

    console.log(`Successfully updated ${records.length} ${periodType} records`);
  } catch (error) {
    console.error(`Error in updateTimeSeriesForPeriod for ${periodType}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Time series data retrieval
export async function getTimeSeriesData(period: string): Promise<TimeSeriesData[]> {
  const now = Math.floor(Date.now() / 1000);
  let startTime: number;
  let interval: number;
  let limit: number;
  let periodType: 'hourly' | 'daily' | 'monthly';

  switch (period) {
    case '24h':
      startTime = now - 24 * 3600; // 24시간 전
      interval = 3600; // 1시간
      limit = 24;
      periodType = 'hourly';
      break;
    case '7d':
      startTime = now - 7 * 86400; // 7일 전
      interval = 86400; // 1일
      limit = 7;
      periodType = 'daily';
      break;
    case '30d':
      startTime = now - 30 * 86400; // 30일 전
      interval = 86400; // 1일
      limit = 30;
      periodType = 'daily';
      break;
    case '1y':
      startTime = now - 365 * 86400; // 1년 전
      interval = 86400 * 30; // 30일
      limit = 12;
      periodType = 'monthly';
      break;
    default:
      startTime = now - 24 * 3600;
      interval = 3600;
      limit = 24;
      periodType = 'hourly';
  }

  // period_type으로 먼저 필터링하고 period_id로 정렬
  const { data, error } = await supabase
    .from('flow_time_series_realtime')
    .select('*')
    .eq('period_type', periodType)
    // .gte('period_id', Math.floor(startTime / interval).toString())
    .order('period_id', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch time series data: ${error.message}`);
  }

  // 데이터 포인트가 부족한 경우 보간
  const result: TimeSeriesData[] = [];
  for (let i = 0; i < limit; i++) {
    const targetPeriodId = Math.floor(startTime / interval) + i;
    const point = data?.find((d) => d.period_id === targetPeriodId.toString());

    if (point) {
      result.push({
        time: Number(point.first_timestamp),
        inflow: Number(point.inflow_amount),
        outflow: Number(point.outflow_amount),
      });
    } else {
      // 데이터가 없는 경우 0으로 채움
      const timestamp = startTime + i * interval;
      result.push({
        time: timestamp,
        inflow: 0,
        outflow: 0,
      });
    }
  }
  return result;
}

// period_id를 기반으로 시간 포맷팅
function formatTimeFromPeriodId(periodId: string, type: 'hourly' | 'daily' | 'monthly', period: '24h' | '7d' | '30d' | '1y'): string {
  const id = Number(periodId);
  let date: Date;

  switch (type) {
    case 'hourly':
      date = new Date(id * 3600 * 1000);
      break;
    case 'daily':
      date = new Date(id * 86400 * 1000);
      break;
    case 'monthly':
      date = new Date(id * 86400 * 30 * 1000);
      break;
  }

  switch (period) {
    case '24h':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case '7d':
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    case '30d':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '1y':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
}
