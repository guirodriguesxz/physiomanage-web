import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { ApiError } from '../api/client'
import type { AppointmentStatus } from '../api/types'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    ghost: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }[variant]
  return (
    <button
      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  )
}

export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-600">{label}</span>
      <input
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-600">{label}</span>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600"
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>{children}</div>
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {action}
    </div>
  )
}

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null
  const message = error instanceof Error ? error.message : 'Erro inesperado'
  return <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>
}

export const fieldError = (error: unknown, field: string) =>
  error instanceof ApiError ? error.fields?.[field] : undefined

const STATUS: Record<AppointmentStatus, [string, string]> = {
  SCHEDULED: ['Agendada', 'bg-sky-100 text-sky-700'],
  CONFIRMED: ['Confirmada', 'bg-indigo-100 text-indigo-700'],
  COMPLETED: ['Concluída', 'bg-emerald-100 text-emerald-700'],
  CANCELLED: ['Cancelada', 'bg-slate-200 text-slate-600'],
  NO_SHOW: ['Faltou', 'bg-amber-100 text-amber-700'],
}

export const statusLabel = (s: AppointmentStatus) => STATUS[s][0]

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const [label, cls] = STATUS[status]
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <Button variant="ghost" disabled={page === 0} onClick={() => onChange(page - 1)}>Anterior</Button>
      <span className="text-slate-500">{page + 1} / {totalPages}</span>
      <Button variant="ghost" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Próxima</Button>
    </div>
  )
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const Empty = ({ text }: { text: string }) => <p className="py-8 text-center text-sm text-slate-500">{text}</p>
