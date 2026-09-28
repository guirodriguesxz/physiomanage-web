import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { appointmentsApi, patientsApi, recordsApi } from '../api/endpoints'
import { Button, Card, Empty, ErrorBox, PageHeader, StatusBadge, formatDateTime } from '../components/ui'
import { PatientForm } from './Patients'

export function PatientDetail() {
  const { id = '' } = useParams()
  const [editing, setEditing] = useState(false)
  const patient = useQuery({ queryKey: ['patient', id], queryFn: () => patientsApi.get(id) })
  const appointments = useQuery({ queryKey: ['appointments', 'patient', id], queryFn: () => appointmentsApi.list({ patientId: id }) })
  const records = useQuery({ queryKey: ['records', id], queryFn: () => recordsApi.byPatient(id) })
  const p = patient.data

  return (
    <>
      <Link to="/pacientes" className="text-sm text-slate-500 hover:text-slate-800">← Pacientes</Link>
      <PageHeader title={p?.name ?? 'Paciente'} action={p && <Button variant="ghost" onClick={() => setEditing(true)}>Editar</Button>} />
      <ErrorBox error={patient.error} />

      {p && (
        <Card className="mb-4 grid gap-4 text-sm sm:grid-cols-3">
          <Info label="CPF" value={p.cpf} />
          <Info label="Nascimento" value={p.birthDate ? new Date(p.birthDate + 'T00:00').toLocaleDateString('pt-BR') : '—'} />
          <Info label="Telefone" value={p.phone} />
          <Info label="E-mail" value={p.email} />
          <Info label="Convênio" value={p.insuranceName ? `${p.insuranceName} ${p.insuranceNumber ?? ''}` : 'Particular'} />
          <Info label="Situação" value={p.active ? 'Ativo' : 'Inativo'} />
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Prontuário</h2>
          <ErrorBox error={records.error} />
          {records.data?.content.length === 0 && <Empty text="Nenhuma evolução registrada" />}
          <ol className="space-y-4">
            {records.data?.content.map((r) => (
              <li key={r.id} className="border-l-2 border-brand-600 pl-3">
                <p className="text-xs text-slate-500">{formatDateTime(r.createdAt)} · {r.professionalName}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{r.evolution}</p>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Consultas</h2>
          {appointments.data?.content.length === 0 && <Empty text="Nenhuma consulta" />}
          <ul className="divide-y divide-slate-100 text-sm">
            {appointments.data?.content.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5">
                <span>{formatDateTime(a.scheduledAt)} · {a.professionalName}</span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {editing && p && <PatientForm patient={p} onClose={() => setEditing(false)} />}
    </>
  )
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  )
}
