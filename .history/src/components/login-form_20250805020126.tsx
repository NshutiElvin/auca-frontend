import { useLocation, useNavigate } from "react-router-dom"
import useAuth from "../hooks/useAuth"
import useToast from "../hooks/useToast"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { use, useState } from "react"
import  { isAxiosError } from "axios"
import axios from "../API/axios"
import { useFormStatus } from "react-dom"
import { Loader, Eye, EyeOff } from "lucide-react"
import useUser from "../hooks/useUser"
import { jwtDecode } from "jwt-decode"
import { DecodedToken } from "../../types"

interface FormData{
  email:string,
  password:string,
}

function SubmitButton(){
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>
                {pending? <Loader className="animate-spin"/> :"Login"}
              </Button>
}
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
    
  const{setToastMessage}= useToast()
  const { setAuth } = useAuth();
  const navigate= useNavigate();
  const location = useLocation();
  const from=  location?.state?.from?.pathname
  ? location?.state?.from?.pathname
  : null;
  
  const [formData, setFormData]= useState<FormData>({
    email:"",
    password:""
  })
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]= useState<string>("");
  
  const handleChange= (e:React.ChangeEvent<HTMLInputElement>)=>{
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const submitAction= async()=>{
    setError("");
    try{
      const resp= await axios.post("api/users/token/", formData)
      const {access}= resp.data
      setAuth(access);
      if(from)
        navigate(from, { replace: true });
      else{
        let user = jwtDecode<DecodedToken>(access)
        if(user.role=="admin")
          navigate("/admin/", { replace: true });
        else if(user.role=="student"){
            navigate("/student/", { replace: true });

        }else if(user.role=="instructor"){
            navigate("/instructor/", { replace: true });

        }
        else{
            navigate("/", { replace: true });
        }
      }
      
    } catch (error) {
      if(isAxiosError(error)){
        const message= error.response?.data?.message
        setError(message)
        setToastMessage({
          message:message?.email?.join(" , ") || message?.password?.join(" , ") ||message?.detail ,
          variant: "danger"
        })
      }else{
        setToastMessage({
          message: "Something went wrong",
          variant: "danger"
        })
      }
    }
  }
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={handleChange}
                  name="email"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    onChange={handleChange} 
                    name="password" 
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <SubmitButton/>
              
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}