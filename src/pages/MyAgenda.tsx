import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { appointmentsApi, recordsApi } from '../api/endpoints'
import type { Appointment } from '../api/types'
import { StatusActions } from '../components/StatusActions'
import { Button, Card, Empty, ErrorBox, Modal, PageHeader, Pager, StatusBadge, formatDateTime } from '../components/ui'

export function MyAgenda() {
  const [page, setPage] = useState(0)
  const [recordFor, setRecordFor] = useState<Appointment | null>(null)
  const list = useQuery({ queryKey: ['appointments', 'me', page], queryFn: () => appointmentsApi.mine(page) })

  return (
    <>
      <PageHeader title="Minha agenda" />
      <ErrorBox error={list.error} />
      {list.data?.content.length === 0 && <Empty text="Nenhuma consulta na sua agenda" />}
      <div className="space-y-3">
        {list.data?.content.map((a) => (
          <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{a.patientName}</p>
              <p className="text-sm text-slate-500">{formatDateTime(a.scheduledAt)} · {a.durationMinutes} min</p>
              {a.notes && <p className="mt-1 text-sm text-slate-600">{a.notes}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={a.status} />
              <StatusActions appointment={a} />
              {a.status === 'COMPLETED' && (
                <Button variant="ghost" onClick={() => setRecordFor(a)}>Registrar evolução</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      {list.data && <Pager page={page} totalPages={list.data.totalPages} onChange={setPage} />}
      {recordFor && <RecordModal appointment={recordFor} onClose={() => setRecordFor(null)} />}
    </>
  )
}

function RecordModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const qc = useQueryClient()
  const [evolution, setEvolution] = useState('')
  const create = useMutation({
    mutationFn: () => recordsApi.create(appointment.id, evolution),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records'] })
      onClose()
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate()
  }

  return (
    <Modal title={`Evolução — ${appointment.patientName}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <textarea
          className="h-48 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand-600"
          placeholder="Descreva a evolução do paciente nesta sessão…"
          maxLength={4000}
          value={evolution}
          onChange={(e) => setEvolution(e.target.value)}
          required
        />
        <p className="text-right text-xs text-slate-400">{evolution.length}/4000</p>
        <ErrorBox error={create.error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!evolution.trim() || create.isPending}>Salvar</Button>
        </div>
      </form>
    </Modal>
  )
}
