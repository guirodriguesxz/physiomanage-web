import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { professionalsApi } from '../api/endpoints'
import type { ProfessionalInput } from '../api/types'
import { Button, Card, Empty, ErrorBox, Field, Modal, PageHeader, fieldError } from '../components/ui'

export function Professionals() {
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const list = useQuery({ queryKey: ['professionals'], queryFn: () => professionalsApi.list() })
  const deactivate = useMutation({
    mutationFn: professionalsApi.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionals'] }),
    onError: (e) => alert(e.message),
  })

  return (
    <>
      <PageHeader title="Profissionais" action={<Button onClick={() => setCreating(true)}>Novo profissional</Button>} />
      <ErrorBox error={list.error} />
      {list.data?.content.length === 0 && <Empty text="Nenhum profissional cadastrado" />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.data?.content.map((p) => (
          <Card key={p.id} className={p.active ? '' : 'opacity-60'}>
            <p className="font-semibold text-slate-900">{p.name}</p>
            <p className="text-sm text-slate-500">{p.specialty} · {p.licenseNumber}</p>
            <p className="mt-2 text-sm">{p.email}</p>
            <div className="mt-4">
              {p.active ? (
                <Button variant="danger" disabled={deactivate.isPending} onClick={() => confirm(`Inativar ${p.name}?`) && deactivate.mutate(p.id)}>
                  Inativar
                </Button>
              ) : (
                <span className="text-sm text-slate-500">Inativo</span>
              )}
            </div>
          </Card>
        ))}
      </div>
      {creating && <NewProfessional onClose={() => setCreating(false)} />}
    </>
  )
}

function NewProfessional({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<ProfessionalInput>({ name: '', email: '', password: '', specialty: '', licenseNumber: '' })
  const create = useMutation({
    mutationFn: professionalsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professionals'] })
      onClose()
    },
  })
  const set = (k: keyof ProfessionalInput) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })
  const err = (k: string) => fieldError(create.error, k)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(form)
  }

  return (
    <Modal title="Novo profissional" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome" value={form.name} onChange={set('name')} required error={err('name')} />
        <Field label="E-mail (login)" type="email" value={form.email} onChange={set('email')} required error={err('email')} />
        <Field label="Senha inicial (mín. 8)" type="password" minLength={8} value={form.password} onChange={set('password')} required error={err('password')} />
        <Field label="Especialidade" value={form.specialty} onChange={set('specialty')} required error={err('specialty')} />
        <Field label="CREFITO" value={form.licenseNumber} onChange={set('licenseNumber')} required error={err('licenseNumber')} />
        <ErrorBox error={create.error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={create.isPending}>Cadastrar</Button>
        </div>
      </form>
    </Modal>
  )
}
