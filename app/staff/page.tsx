'use client'

import { Guard } from '@/components/auth/Guard'
import { ManageProvider } from '@/components/manage/Provider'
import { Console } from '@/components/manage/Console'

export default function StaffPage() {
  return (
    <Guard roles={['staff', 'admin']}>
      <ManageProvider>
        <Console />
      </ManageProvider>
    </Guard>
  )
}
