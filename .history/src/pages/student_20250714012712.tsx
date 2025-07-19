import React from 'react'
import { SidebarProvider } from '../components/ui/sidebar'
import MainPage from './mainAdmin'

function StudentPage() {
  return <SidebarProvider>
  <MainPage/>
  </SidebarProvider>
}

export default StudentPage