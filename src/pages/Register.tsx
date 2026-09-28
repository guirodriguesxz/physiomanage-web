import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'
import { Button, ErrorBox, Field, fieldError } from '../components/ui'
import { AuthShell } from './Login'

export function Register() {
  const { signIn } = useAuth()
  const [form, setForm] = useState({ clinicName: '', cnpj: '', adminName: '', adminEmail: '', adminPassword: '' })
  const register = useMutation({ mutationFn: authApi.registerClinic, onSuccess: signIn })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })
  const err = (k: string) => fieldError(register.error, k)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <AuthShell title="Cadastrar clínica">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome da clínica" value={form.clinicName} onChange={set('clinicName')} required error={err('clinicName')} />
        <Field label="CNPJ" value={form.cnpj} onChange={set('cnpj')} required error={err('cnpj')} />
        <Field label="Seu nome" value={form.adminName} onChange={set('adminName')} required error={err('adminName')} />
        <Field label="E-mail" type="email" value={form.adminEmail} onChange={set('adminEmail')} required error={err('adminEmail')} />
        <Field label="Senha (mín. 8)" type="password" minLength={8} value={form.adminPassword} onChange={set('adminPassword')} required error={err('adminPassword')} />
        <ErrorBox error={register.error} />
        <Button className="w-full" disabled={register.isPending}>Criar clínica</Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Já tem conta? <Link to="/login" className="font-medium text-brand-700">Entrar</Link>
      </p>
    </AuthShell>
  )
}
