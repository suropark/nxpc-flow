export function formatAmount(amount: number | string): string {
  if (!amount || isNaN(Number(amount))) return '0';
  return (Number(amount) / 1e18).toFixed(2);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value: number): string {
  if (!value || isNaN(value)) return '0';
  return value.toLocaleString();
}
