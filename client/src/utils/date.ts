// แสดงวันที่แบบไทย เช่น "27 ต.ค. 2569"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}
