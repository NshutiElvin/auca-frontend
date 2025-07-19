import { SidebarProvider } from '../components/ui/sidebar'
import AdminMainPage from './AdminMainPage'

function AdminPage() {
  return <SidebarProvider>
  <AdminMainPage/>
  </SidebarProvider>
}

export default AdminPage