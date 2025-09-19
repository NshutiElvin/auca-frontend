import useAuth from './useAuth'

export   function hasPermission(perm:string) {
try {
      const {permissions}= useAuth()
  return  permissions.includes(perm)
  
} catch (error) {
  return   false
  
}
     
}
