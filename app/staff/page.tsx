'use client'

import { Guard } from '@/components/auth/Guard'
import { StaffDashboard } from '@/components/manage/StaffDashboard'

export default function StaffPage() {
  return (
    <Guard roles={['staff', 'admin']}>
      <StaffDashboard />
    </Guard>
  )
}
