import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { patientsApi } from '../api/endpoints'
import type { Patient, PatientInput } from '../api/types'
import { Button, Card, Empty, ErrorBox, Field, Modal, PageHeader, Pager, fieldError } from '../components/ui'

export function Patients() {
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Patient | 'new' | null>(null)
  const list = useQuery({ queryKey: ['patients', page], queryFn: () => patientsApi.list(page) })

  return (
    <>
      <PageHeader title="Pacientes" action={<Button onClick={() => setEditing('new')}>Novo paciente</Button>} />
      <Card>
        <ErrorBox error={list.error} />
        {list.data?.content.length === 0 && <Empty text="Nenhum paciente cadastrado" />}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Nome</th>
                <th className="py-2 pr-4 font-medium">CPF</th>
                <th className="py-2 pr-4 font-medium">Telefone</th>
                <th className="py-2 pr-4 font-medium">Convênio</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {list.data?.content.map((p) => (
                <tr key={p.id} className={`border-t border-slate-100 ${p.active ? '' : 'text-slate-400'}`}>
                  <td className="py-3 pr-4">
                    <Link to={`/pacientes/${p.id}`} className="font-medium text-brand-700 hover:underline">{p.name}</Link>
                    {!p.active && <span className="ml-2 text-xs">(inativo)</span>}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{p.cpf}</td>
                  <td className="py-3 pr-4">{p.phone ?? '—'}</td>
                  <td className="py-3 pr-4">{p.insuranceName ?? 'Particular'}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => setEditing(p)} className="text-sm font-medium text-slate-600 hover:text-brand-700">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.data && <Pager page={page} totalPages={list.data.totalPages} onChange={setPage} />}
      </Card>
      {editing && <PatientForm patient={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  )
}

const EMPTY: PatientInput = { name: '', cpf: '', birthDate: '', phone: '', email: '', insuranceName: '', insuranceNumber: '' }

export function PatientForm({ patient, onClose }: { patient: Patient | null; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<PatientInput>(patient ? { ...EMPTY, ...patient } : EMPTY)

  const save = useMutation({
    mutationFn: (body: PatientInput) => (patient ? patientsApi.update(patient.id, body) : patientsApi.create(body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['patient'] })
      onClose()
    },
  })
  const deactivate = useMutation({
    mutationFn: () => patientsApi.deactivate(patient!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['patient'] })
      onClose()
    },
  })

  const set = (k: keyof PatientInput) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })
  const val = (k: keyof PatientInput) => form[k] ?? ''
  const err = (k: string) => fieldError(save.error, k)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    // Campos opcionais vazios vão como null, não string vazia
    const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])) as PatientInput
    save.mutate(body)
  }

  return (
    <Modal title={patient ? 'Editar paciente' : 'Novo paciente'} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Nome" value={val('name')} onChange={set('name')} required error={err('name')} /></div>
        <Field label="CPF" value={val('cpf')} onChange={set('cpf')} required error={err('cpf')} />
        <Field label="Nascimento" type="date" value={val('birthDate')} onChange={set('birthDate')} error={err('birthDate')} />
        <Field label="Telefone" value={val('phone')} onChange={set('phone')} />
        <Field label="E-mail" type="email" value={val('email')} onChange={set('email')} />
        <Field label="Convênio" value={val('insuranceName')} onChange={set('insuranceName')} />
        <Field label="Nº carteirinha" value={val('insuranceNumber')} onChange={set('insuranceNumber')} />
        <div className="sm:col-span-2"><ErrorBox error={save.error ?? deactivate.error} /></div>
        <div className="flex justify-between gap-2 sm:col-span-2">
          {patient?.active ? (
            <Button
              type="button"
              variant="danger"
              disabled={deactivate.isPending}
              onClick={() => confirm(`Inativar ${patient.name}?`) && deactivate.mutate()}
            >
              Inativar
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button disabled={save.isPending}>Salvar</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
