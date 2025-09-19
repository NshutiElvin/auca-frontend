import useAuth from './useAuth'

export   function hasPermission(perm:string) {
try {
      const {permissions}= useAuth()
      console.log(perm)
      console.log( permissions.includes(perm))
  return  permissions.includes(perm)
  
} catch (error) {
  return   false
  
}
     
}
