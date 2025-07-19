import { SidebarProvider } from '../components/ui/sidebar'
import StudentMainPage from './StudentMainAdmin'

function StudentPortal() {
  return <SidebarProvider>
  <StudentMainPage/>
  </SidebarProvider>
}

export default StudentPortal