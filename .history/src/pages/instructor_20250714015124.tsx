import { SidebarProvider } from '../components/ui/sidebar'
import MainPage from './mainAdmin'

function InstructorPortal() {
  return <SidebarProvider>
  <MainPage/>
  </SidebarProvider>
}

export default InstructorPortal