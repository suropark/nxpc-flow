import { supabase } from '../config/supabase';
import type { Transaction } from '../types';
import { updateTimeSeriesData } from './timeSeries';

export async function saveTransaction(transaction: Transaction) {
  const { data, error } = await supabase.from('transactions').insert(transaction).select().single();

  if (error) throw error;
  return data;
}

export async function getTransactions(page: number = 1, limit: number = 10): Promise<Transaction[]> {
  try {
    // limit이 20을 초과하지 않도록 설정
    const safeLimit = Math.min(limit, 20);
    const offset = (page - 1) * safeLimit;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false }) // 최신순 정렬
      .range(offset, offset + safeLimit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', {
      page,
      limit,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function saveEvents(events: Transaction[]): Promise<void> {
  if (events.length === 0) return;

  console.log('Saving events:', events.length);

  const { error } = await supabase.from('transactions').upsert(
    events.map((event) => ({
      id: event.hash,
      hash: event.hash,
      from_address: event.from,
      to_address: event.to,
      value: event.value,
      timestamp: event.timestamp,
      type: event.type,
      block_number: event.blockNumber,
    })),
    { onConflict: 'id' }
  );

  if (error) {
    console.error('Error saving events:', error);
    throw error;
  }

  // 모든 트랜잭션의 시계열 데이터를 한 번에 업데이트
  await updateTimeSeriesData(events);
}

export async function getLastSyncedBlock(): Promise<number> {
  const { data, error } = await supabase.from('sync_status').select('last_synced_block').eq('id', 'nxpc_sync').single();

  if (error) {
    console.error('Error getting last synced block:', error);
    return 0;
  }

  return data?.last_synced_block || 0;
}

export async function updateLastSyncedBlock(blockNumber: number) {
  const { error } = await supabase.from('sync_status').upsert({
    id: 'nxpc_sync',
    last_synced_block: blockNumber,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error updating last synced block:', error);
    throw error;
  }
}
