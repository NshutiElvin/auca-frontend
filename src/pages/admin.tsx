import React from 'react'
import { SidebarProvider } from '../components/ui/sidebar'
import MainPage from './mainAdmin'

function AdminPage() {
  return <SidebarProvider>
  <MainPage/>
  </SidebarProvider>
}

export default AdminPage