import { api, json } from './client'
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  AuthResponse,
  Availability,
  Page,
  Patient,
  PatientInput,
  Productivity,
  Professional,
  ProfessionalInput,
  Summary,
  TreatmentRecord,
} from './types'

const qs = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  return s.toString()
}

export const authApi = {
  login: (body: { clinicCnpj: string; email: string; password: string }) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body: json(body) }),
  registerClinic: (body: {
    clinicName: string
    cnpj: string
    adminName: string
    adminEmail: string
    adminPassword: string
  }) => api<AuthResponse>('/auth/register-clinic', { method: 'POST', body: json(body) }),
  logout: (refreshToken: string) =>
    api<void>('/auth/logout', { method: 'POST', body: json({ refreshToken }) }),
}

export const patientsApi = {
  list: (page = 0) => api<Page<Patient>>(`/patients?${qs({ page, size: 20, sort: 'name' })}`),
  get: (id: string) => api<Patient>(`/patients/${id}`),
  create: (body: PatientInput) => api<Patient>('/patients', { method: 'POST', body: json(body) }),
  update: (id: string, body: PatientInput) =>
    api<Patient>(`/patients/${id}`, { method: 'PUT', body: json(body) }),
  deactivate: (id: string) => api<void>(`/patients/${id}`, { method: 'DELETE' }),
}

export const professionalsApi = {
  list: (page = 0) => api<Page<Professional>>(`/professionals?${qs({ page, size: 50, sort: 'name' })}`),
  create: (body: ProfessionalInput) =>
    api<Professional>('/professionals', { method: 'POST', body: json(body) }),
  deactivate: (id: string) => api<void>(`/professionals/${id}`, { method: 'DELETE' }),
  availability: (id: string, date: string) =>
    api<Availability>(`/professionals/${id}/availability?${qs({ date })}`),
}

export const appointmentsApi = {
  list: (params: { page?: number; patientId?: string; professionalId?: string }) =>
    api<Page<Appointment>>(
      `/appointments?${qs({ size: 20, sort: 'scheduledAt,desc', ...params })}`,
    ),
  mine: (page = 0) => api<Page<Appointment>>(`/appointments/me?${qs({ page, size: 20, sort: 'scheduledAt' })}`),
  create: (body: AppointmentInput) =>
    api<Appointment>('/appointments', { method: 'POST', body: json(body) }),
  updateStatus: (id: string, status: AppointmentStatus) =>
    api<Appointment>(`/appointments/${id}/status`, { method: 'PATCH', body: json({ status }) }),
}

export const recordsApi = {
  byPatient: (patientId: string) =>
    api<Page<TreatmentRecord>>(`/treatment-records?${qs({ patientId, size: 50, sort: 'createdAt,desc' })}`),
  create: (appointmentId: string, evolution: string) =>
    api<TreatmentRecord>('/treatment-records', { method: 'POST', body: json({ appointmentId, evolution }) }),
}

export const reportsApi = {
  summary: (from: string, to: string) => api<Summary>(`/reports/summary?${qs({ from, to })}`),
  productivity: (from: string, to: string) =>
    api<Productivity[]>(`/reports/professionals-productivity?${qs({ from, to })}`),
}
