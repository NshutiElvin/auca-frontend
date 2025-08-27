import ProfileContent from "./profile-page/components/profile-content";
import ProfileHeader from "./profile-page/components/profile-header";
import {useState, useEffect, useTransition} from "react";
import useAuth from "../hooks/useAuth";
import { DecodedToken } from "../../types";
import { useNavigate } from "react-router";
import useToast from "../hooks/useToast";
import { jwtDecode } from "jwt-decode";
import useUserAxios from "../hooks/useUserAxios";
import { Loader } from "lucide-react";
import useUser from "../hooks/useUser";

export default function Profile() {
      const { auth } = useAuth();
      const [decodedToken, setDecodedToken] =useState<DecodedToken | null>(null);
      const current_user= useUser();
      const navigate = useNavigate();
      const { setToastMessage } = useToast();
      const[isGettingStudent, startGettingStudentTransition]= useTransition();
      const [isChangingPassword, startChangingPasswordTransition]= useTransition();
      const [currentStudent, setCurrentStudent]= useState<any>(null);
      
      const axios = useUserAxios();
      const getCurrentStudent= ()=>{
        startGettingStudentTransition(async()=>{
          try {
            const response = await axios.get(`/api/users/${current_user.user_id}/`);
            setCurrentStudent(response.data.data);
          } catch (error) {
            setToastMessage({
              message: "Error fetching student data.",
              variant: "danger",
            });
          }
          
        });
      }
      console.log(currentStudent)
      
    
    
      
      useEffect(()=>{
        getCurrentStudent();
      },[])
      return (
        isGettingStudent ? <div className="flex justify-center align-middle"><Loader className={"h-5 w-5 animate-spin"}/></div>
        :
    <div className="container mx-auto space-y-6 px-4 py-10">
    {currentStudent&&<div>  <ProfileHeader {...currentStudent}/>
    <ProfileContent {...currentStudent}/></div>}
    </div>
  );
}