export type Role = 'ADMIN' | 'RECEPTION' | 'PROFESSIONAL' | 'PATIENT'

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface AuthResponse {
  token: string
  tokenType: string
  refreshToken: string
  userId: string
  clinicId: string
  role: Role
}

export interface Patient {
  id: string
  name: string
  cpf: string
  birthDate: string | null
  phone: string | null
  email: string | null
  insuranceName: string | null
  insuranceNumber: string | null
  active: boolean
}

export type PatientInput = Omit<Patient, 'id' | 'active'>

export interface Professional {
  id: string
  name: string
  email: string
  specialty: string
  licenseNumber: string
  active: boolean
}

export interface ProfessionalInput {
  name: string
  email: string
  password: string
  specialty: string
  licenseNumber: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  professionalId: string
  professionalName: string
  scheduledAt: string
  durationMinutes: number
  status: AppointmentStatus
  notes: string | null
}

export interface AppointmentInput {
  patientId: string
  professionalId: string
  scheduledAt: string
  durationMinutes?: number
  notes?: string
}

export interface Availability {
  professionalId: string
  date: string
  availableSlots: string[]
}

export interface TreatmentRecord {
  id: string
  appointmentId: string
  patientId: string
  patientName: string
  professionalId: string
  professionalName: string
  evolution: string
  createdAt: string
  updatedAt: string
}

export interface Summary {
  from: string
  to: string
  total: number
  byStatus: Partial<Record<AppointmentStatus, number>>
  noShowRate: number
  cancellationRate: number
}

export interface Productivity {
  professionalId: string
  professionalName: string
  completed: number
  cancelled: number
  noShow: number
  total: number
}
