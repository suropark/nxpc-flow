import { supabase } from '../config/supabase';
import type { Transaction } from '../types';
import { updateTimeSeriesData } from './timeSeries';

export async function saveTransaction(transaction: Transaction) {
  const { data, error } = await supabase.from('transactions').insert(transaction).select().single();

  if (error) throw error;
  return data;
}

export async function getTransactions(address: string, type?: 'inflow' | 'outflow', limit = 100, offset = 0) {
  let query = supabase
    .from('transactions')
    .select('*')
    .or(`from.eq.${address},to.eq.${address}`)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
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
