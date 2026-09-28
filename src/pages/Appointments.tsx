import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { appointmentsApi, patientsApi, professionalsApi } from '../api/endpoints'
import { StatusActions } from '../components/StatusActions'
import {
  Button, Card, Empty, ErrorBox, Field, Modal, PageHeader, Pager, Select, StatusBadge, formatDateTime, formatTime,
} from '../components/ui'

export function Appointments() {
  const [page, setPage] = useState(0)
  const [professionalId, setProfessionalId] = useState('')
  const [creating, setCreating] = useState(false)

  const professionals = useQuery({ queryKey: ['professionals'], queryFn: () => professionalsApi.list() })
  const list = useQuery({
    queryKey: ['appointments', page, professionalId],
    queryFn: () => appointmentsApi.list({ page, professionalId: professionalId || undefined }),
  })

  return (
    <>
      <PageHeader title="Agenda" action={<Button onClick={() => setCreating(true)}>Nova consulta</Button>} />
      <Card>
        <div className="mb-4 max-w-xs">
          <Select label="Profissional" value={professionalId} onChange={(e) => { setProfessionalId(e.target.value); setPage(0) }}>
            <option value="">Todos</option>
            {professionals.data?.content.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        <ErrorBox error={list.error} />
        {list.data?.content.length === 0 && <Empty text="Nenhuma consulta encontrada" />}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Data</th>
                <th className="py-2 pr-4 font-medium">Paciente</th>
                <th className="py-2 pr-4 font-medium">Profissional</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.data?.content.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="py-3 pr-4 whitespace-nowrap">{formatDateTime(a.scheduledAt)}</td>
                  <td className="py-3 pr-4">{a.patientName}</td>
                  <td className="py-3 pr-4">{a.professionalName}</td>
                  <td className="py-3 pr-4"><StatusBadge status={a.status} /></td>
                  <td className="py-3"><StatusActions appointment={a} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.data && <Pager page={page} totalPages={list.data.totalPages} onChange={setPage} />}
      </Card>
      {creating && <NewAppointment onClose={() => setCreating(false)} />}
    </>
  )
}

function NewAppointment({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
  const [patientId, setPatientId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [date, setDate] = useState(tomorrow)
  const [slot, setSlot] = useState('')
  const [notes, setNotes] = useState('')

  const patients = useQuery({ queryKey: ['patients', 'all'], queryFn: () => patientsApi.list() })
  const professionals = useQuery({ queryKey: ['professionals'], queryFn: () => professionalsApi.list() })
  const slots = useQuery({
    queryKey: ['availability', professionalId, date],
    queryFn: () => professionalsApi.availability(professionalId, date),
    enabled: !!professionalId && !!date,
  })
  const futureSlots = slots.data?.availableSlots.filter((s) => new Date(s) > new Date()) ?? []

  const create = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['availability'] })
      onClose()
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate({ patientId, professionalId, scheduledAt: slot, notes: notes || undefined })
  }

  return (
    <Modal title="Nova consulta" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Select label="Paciente" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
          <option value="" disabled>Selecione…</option>
          {patients.data?.content.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select label="Profissional" value={professionalId} onChange={(e) => { setProfessionalId(e.target.value); setSlot('') }} required>
          <option value="" disabled>Selecione…</option>
          {professionals.data?.content.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name} — {p.specialty}</option>)}
        </Select>
        <Field label="Data" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => { setDate(e.target.value); setSlot('') }} required />

        {professionalId && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Horários livres</p>
            {slots.isLoading && <p className="text-sm text-slate-500">Carregando…</p>}
            <ErrorBox error={slots.error} />
            {slots.data && futureSlots.length === 0 && <p className="text-sm text-slate-500">Sem horários nesta data.</p>}
            <div className="grid grid-cols-4 gap-2">
              {futureSlots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`rounded-md border py-1.5 text-sm ${slot === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 hover:border-brand-600'}`}
                >
                  {formatTime(s)}
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label="Observações" value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} />
        <ErrorBox error={create.error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!slot || create.isPending}>Agendar</Button>
        </div>
      </form>
    </Modal>
  )
}
