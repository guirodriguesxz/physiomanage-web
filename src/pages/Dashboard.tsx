import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { reportsApi } from '../api/endpoints'
import type { AppointmentStatus } from '../api/types'
import { Card, Empty, ErrorBox, Field, PageHeader, statusLabel } from '../components/ui'

const iso = (d: Date) => d.toISOString().slice(0, 10)
const pct = (n: number) => `${(n * 100).toFixed(1)}%`
const STATUSES: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

export function Dashboard() {
  const today = new Date()
  const [from, setFrom] = useState(iso(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [to, setTo] = useState(iso(today))
  const valid = from <= to

  const summary = useQuery({ queryKey: ['summary', from, to], queryFn: () => reportsApi.summary(from, to), enabled: valid })
  const prod = useQuery({ queryKey: ['productivity', from, to], queryFn: () => reportsApi.productivity(from, to), enabled: valid })
  const s = summary.data
  const maxTotal = Math.max(1, ...(prod.data ?? []).map((p) => p.total))

  return (
    <>
      <PageHeader
        title="Painel"
        action={
          <div className="flex gap-2">
            <Field label="De" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Field label="Até" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        }
      />
      {!valid && <ErrorBox error={new Error('A data inicial deve ser anterior à final')} />}
      <ErrorBox error={summary.error ?? prod.error} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Consultas no período" value={s ? String(s.total) : '—'} />
        <Stat label="Taxa de faltas" value={s ? pct(s.noShowRate) : '—'} />
        <Stat label="Taxa de cancelamento" value={s ? pct(s.cancellationRate) : '—'} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Consultas por status</h2>
          <ul className="space-y-2 text-sm">
            {STATUSES.map((st) => (
              <li key={st} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                <span className="text-slate-600">{statusLabel(st)}</span>
                <span className="font-medium tabular-nums">{s?.byStatus[st] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Produtividade por profissional</h2>
          {prod.data?.length === 0 && <Empty text="Sem consultas no período" />}
          <ul className="space-y-3 text-sm">
            {prod.data?.map((p) => (
              <li key={p.professionalId}>
                <div className="mb-1 flex justify-between">
                  <span className="font-medium">{p.professionalName}</span>
                  <span className="text-slate-500 tabular-nums">
                    {p.completed} concluídas · {p.noShow} faltas · {p.cancelled} canc.
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${(p.completed / maxTotal) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
    </Card>
  )
}
