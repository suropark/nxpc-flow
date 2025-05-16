import { supabase } from '../config/supabase';
import type { Transaction } from '../types';

interface TimeSeriesData {
  time: string;
  inflow: number;
  outflow: number;
}

// 트랜잭션이 발생할 때마다 실시간으로 집계 데이터 업데이트
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
        // timestamp가 초 단위로 들어오므로 1000을 곱해서 밀리초로 변환
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

// 시계열 데이터 조회
export async function getTimeSeriesData(
  period: '24h' | '7d' | '30d' | '1y',
  type: 'hourly' | 'daily' | 'monthly' = 'hourly'
): Promise<TimeSeriesData[]> {
  try {
    const now = Math.floor(Date.now() / 1000); // 현재 시간을 초 단위로 변환
    let startId: number;

    switch (period) {
      case '24h':
        startId = Math.floor((now - 24 * 3600) / 3600);
        break;
      case '7d':
        startId = Math.floor((now - 7 * 86400) / 86400);
        break;
      case '30d':
        startId = Math.floor((now - 30 * 86400) / 86400);
        break;
      case '1y':
        startId = Math.floor((now - 365 * 86400) / (86400 * 30));
        break;
    }

    const { data, error } = await supabase
      .from('flow_time_series_realtime')
      .select('*')
      .gte('period_id', startId.toString())
      .eq('period_type', type)
      .order('period_id', { ascending: true });

    if (error) throw error;

    return data.map((item) => ({
      time: formatTimeFromPeriodId(item.period_id, type, period),
      inflow: Number(item.inflow_amount),
      outflow: Number(item.outflow_amount),
    }));
  } catch (error) {
    console.error('Error fetching time series data:', {
      period,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
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
