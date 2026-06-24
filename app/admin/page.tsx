'use client'

import { Guard } from '@/components/auth/Guard'
import { StaffDashboard } from '@/components/manage/StaffDashboard'

export default function AdminPage() {
  return (
    <Guard roles={['admin']}>
      <StaffDashboard admin />
    </Guard>
  )
}
