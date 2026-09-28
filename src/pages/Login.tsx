import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'
import { Button, ErrorBox, Field, fieldError } from '../components/ui'

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-lg font-bold text-white">P</span>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">{children}</div>
      </div>
    </div>
  )
}

export function Login() {
  const { signIn } = useAuth()
  const [form, setForm] = useState({ clinicCnpj: '', email: '', password: '' })
  const login = useMutation({ mutationFn: authApi.login, onSuccess: signIn })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate(form)
  }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  return (
    <AuthShell title="Entrar no PhysioManage">
      <form onSubmit={submit} className="space-y-4">
        <Field label="CNPJ da clínica" value={form.clinicCnpj} onChange={set('clinicCnpj')} required error={fieldError(login.error, 'clinicCnpj')} />
        <Field label="E-mail" type="email" value={form.email} onChange={set('email')} required autoComplete="username" />
        <Field label="Senha" type="password" value={form.password} onChange={set('password')} required autoComplete="current-password" />
        <ErrorBox error={login.error} />
        <Button className="w-full" disabled={login.isPending}>{login.isPending ? 'Entrando…' : 'Entrar'}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Nova clínica? <Link to="/cadastro" className="font-medium text-brand-700">Cadastre-se</Link>
      </p>
    </AuthShell>
  )
}
