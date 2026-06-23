'use client'

import { Guard } from '@/components/auth/Guard'
import { ManageProvider } from '@/components/manage/Provider'
import { Console } from '@/components/manage/Console'

export default function AdminPage() {
  return (
    <Guard roles={['admin']}>
      <ManageProvider>
        <Console admin />
      </ManageProvider>
    </Guard>
  )
}
