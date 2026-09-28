import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi } from '../api/endpoints'
import type { Appointment, AppointmentStatus } from '../api/types'

// Espelha ALLOWED_TRANSITIONS do AppointmentService no backend.
const NEXT: Record<AppointmentStatus, { to: AppointmentStatus; label: string }[]> = {
  SCHEDULED: [{ to: 'CONFIRMED', label: 'Confirmar' }],
  CONFIRMED: [
    { to: 'COMPLETED', label: 'Concluir' },
    { to: 'NO_SHOW', label: 'Faltou' },
    { to: 'CANCELLED', label: 'Cancelar' },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export function StatusActions({ appointment }: { appointment: Appointment }) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (to: AppointmentStatus) => appointmentsApi.updateStatus(appointment.id, to),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    onError: (e) => alert(e.message),
  })

  return (
    <div className="flex flex-wrap gap-1.5">
      {NEXT[appointment.status].map((n) => (
        <button
          key={n.to}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(n.to)}
          className={`rounded-md border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
            n.to === 'CANCELLED' || n.to === 'NO_SHOW'
              ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'border-brand-600 text-brand-700 hover:bg-brand-50'
          }`}
        >
          {n.label}
        </button>
      ))}
    </div>
  )
}
