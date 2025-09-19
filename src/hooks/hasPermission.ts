import useAuth from './useAuth'

export   function hasPermission(perm:string) {
    const {permissions}= useAuth()
  return  permissions.includes(perm)
     
}
