import { SidebarProvider } from '../components/ui/sidebar'
import MainPage from './mainAdmin'

function StudentPortal() {
  return <SidebarProvider>
  <MainPage/>
  </SidebarProvider>
}

export default StudentPortal