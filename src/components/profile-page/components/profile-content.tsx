import { Shield, Key, Trash2, Loader2 } from "lucide-react";

import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { useState, useTransition } from "react";
import useUserAxios from "../../../hooks/useUserAxios";
import useToast from "../../../hooks/useToast";

export default function ProfileContent(user:any) {
  const [password, setPassword]= useState({
    old_password:"",
    new_password:"",
    confirm_new_password:""
  })
  const axios= useUserAxios()
  const [isUpdatingPassword, startUpdatingPasswordTransition]= useTransition();
  const { setToastMessage } = useToast();
  const handleChangePassword=()=>{
    startUpdatingPasswordTransition(async()=>{
      try {
        const response = await axios.post(`/api/users/change_password/`,{
          old_password: password.old_password,
          new_password: password.new_password
        });
     if(response.data.success){
      setToastMessage({
        message: "Password changed successfully.",
        variant: "success",
      });
      setPassword({
        old_password:"",
        new_password:"",
        confirm_new_password:""
      })
     }else{
      setToastMessage({
        message: response.data.message || "Error changing password. Please try again.",
        variant: "danger",
      });
     }
      } catch (error) {
        setToastMessage({
          message: "Error changing password. Please try again.",
          variant: "danger",
        });
      }
    })
  }
  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">Personal</TabsTrigger>
         
        <TabsTrigger value="security">Security</TabsTrigger>
   
      </TabsList>

      {/* Personal Information */}
      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
           
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue={user.first_name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue={user.last_name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>
             
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Role</Label>
                <Input id="jobTitle" defaultValue={user.role} disabled/>
              </div>
           
            </div>
          
          </CardContent>
        </Card>
      </TabsContent>

    

      {/* Security Settings */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security and authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  
                </div>
                <Button onClick={handleChangePassword} variant="default" disabled={isUpdatingPassword||password.new_password!==password.confirm_new_password || !password.new_password || !password.old_password}>
                
                  
                  {isUpdatingPassword ? <Loader2 className="animate-spine"/>:  <Key className="mr-2 h-4 w-4" />}Change Password
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Old Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    placeholder="Enter old password"
                    value={password.old_password}
                    onChange={(e)=>setPassword({...password,old_password:e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={password.new_password}
                    onChange={(e)=>setPassword({...password,new_password:e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={password.confirm_new_password}
                    onChange={(e)=>setPassword({...password,confirm_new_password:e.target.value})}
                  />
                </div>
              </div>
              <Separator />
          
            </div>
            
                
              
          </CardContent>
        </Card>
      </TabsContent>

       
 
    </Tabs>
  );
}
