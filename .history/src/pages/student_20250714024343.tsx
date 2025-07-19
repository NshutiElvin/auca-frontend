import { SidebarProvider } from '../components/ui/sidebar'
import MainPage from './StudentMainAdmin'

function StudentPortal() {
  return <SidebarProvider>
  <MainPage/>
  </SidebarProvider>
}

export default StudentPortal