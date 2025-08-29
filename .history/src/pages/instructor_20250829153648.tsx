import { SidebarProvider } from '../components/ui/sidebar'
import InstructorMainPage from './InstructorMainPage'
function InstructorPortal() {
  return <><SidebarProvider>
  <InstructorMainPage/>
  </SidebarProvider></>
}

export default InstructorPortal