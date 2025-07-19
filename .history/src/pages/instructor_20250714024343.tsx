import { SidebarProvider } from '../components/ui/sidebar'
import MainPage from './StudentMainAdmin'

function InstructorPortal() {
  return <SidebarProvider>
  <MainPage/>
  </SidebarProvider>
}

export default InstructorPortal