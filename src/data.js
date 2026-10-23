// Demo-only synthetic records. Replace with a validated data pipeline before any real-world use.
const beds = Array.from({ length: 40 }, (_, idx) => {
  const n = idx + 1
  const high = n % 6 === 0
  const elevated = !high && n % 3 === 0
  const risk = high ? 68 + ((n * 7) % 27) : elevated ? 37 + ((n * 5) % 26) : 8 + ((n * 11) % 29)
  const hr = high ? 108 + (n % 20) : elevated ? 94 + (n % 16) : 68 + (n % 26)
  const sbp = high ? 82 + (n % 15) : elevated ? 92 + (n % 17) : 105 + (n % 28)
  const rr = high ? 24 + (n % 7) : elevated ? 20 + (n % 6) : 13 + (n % 7)
  const temp = high ? 38.2 + (n % 8) / 10 : elevated ? 37.5 + (n % 7) / 10 : 36.4 + (n % 8) / 10
  const spo2 = high ? 89 + (n % 7) : elevated ? 92 + (n % 5) : 95 + (n % 4)
  return {
    id: `P-${100 + n}`, bed: `ICU-B${String(n).padStart(2, '0')}`,
    pod: n <= 20 ? 'Pod A' : 'Pod B', risk, hr, sbp, rr, temp: Number(temp.toFixed(1)), spo2,
    category: risk >= 65 ? 'HIGH' : risk >= 35 ? 'ELEVATED' : 'LOW',
    completeness: 84 + ((n * 3) % 16),
    updated: 'T-0h',
    trend: [Math.max(5, risk - 18), Math.max(5, risk - 10), Math.max(5, risk - 5), risk]
  }
})
export default beds

export const hourlyTrend = Array.from({ length: 12 }, (_, i) => ({
  hour: `${String(i * 2).padStart(2, '0')}:00`,
  high: 3 + ((i * 7) % 5), elevated: 6 + ((i * 5) % 8), low: 31 - ((i * 3) % 7)
}))
export const patientTimeline = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  risk: Math.min(96, Math.max(8, 46 + Math.round(15 * Math.sin(i / 3)) + i)),
  hr: 88 + Math.round(13 * Math.sin(i / 2.5)) + Math.floor(i / 4),
  sbp: 108 - Math.round(10 * Math.sin(i / 4)) - Math.floor(i / 5),
  rr: 17 + Math.round(4 * Math.sin(i / 3))
}))