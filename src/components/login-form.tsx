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
import { useState } from "react"
import { isAxiosError } from "axios"
import axios from "../API/axios"
import { useFormStatus } from "react-dom"
import { Loader, Eye, EyeOff } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { DecodedToken } from "../../types"

interface FormData {
  email: string
  password: string
}

type Step = "credentials" | "otp"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader className="animate-spin" /> : label}
    </Button>
  )
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { setToastMessage } = useToast()
  const { setAuth, setPermissions } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  let from = location?.state?.from?.pathname ?? null
  from = from ?? localStorage.getItem("sidebarActiveUrl")

  const [formData, setFormData] = useState<FormData>({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<Step>("credentials")
  const [otp, setOtp] = useState("")
  const [pendingAccess, setPendingAccess] = useState<string>("")
  const [pendingPermissions, setPendingPermissions] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const navigateByRole = (access: string) => {
    const user = jwtDecode<DecodedToken>(access)
    if (from) {
      navigate(from, { replace: true })
      return
    }
    if (user.role === "admin") navigate("/admin/", { replace: true })
    else if (user.role === "student") navigate("/student/", { replace: true })
    else if (user.role === "instructor") navigate("/instructor/", { replace: true })
    else navigate("/", { replace: true })
  }

  /** Step 1 — credentials. Backend validates, issues JWT, and sends OTP email. */
  const submitCredentials = async () => {
    try {
      const resp = await axios.post("api/users/token/", formData)
      const { access, permissions } = resp.data

      // Hold token until OTP is verified — don't commit to auth context yet
      setPendingAccess(access)
      setPendingPermissions(permissions)

      setToastMessage({ message: "OTP sent to your email.", variant: "success" })
      setStep("otp")
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : "Something went wrong"

      setToastMessage({
        message:
          message?.email?.join(", ") ||
          message?.password?.join(", ") ||
          message?.detail ||
          message,
        variant: "danger",
      })
    }
  }

  /** Step 2 — verify OTP, then commit auth state and navigate. */
  const submitOtp = async () => {
    try {
      await axios.post(
        "api/users/verify_otp/",
        { otp },
        { headers: { Authorization: `Bearer ${pendingAccess}` } }
      )

      setAuth(pendingAccess)
      setPermissions(pendingPermissions)
      navigateByRole(pendingAccess)
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : "OTP verification failed"

      setToastMessage({ message: message?.detail || message, variant: "danger" })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        {step === "credentials" ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={submitCredentials}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="m@example.com"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        required
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <SubmitButton label="Continue" />
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Enter OTP</CardTitle>
              <CardDescription>
                A 6-digit code was sent to <strong>{formData.email}</strong>.
                It expires in 10 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={submitOtp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <SubmitButton label="Verify & Login" />
                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      className="text-muted-foreground hover:underline"
                      onClick={() => {
                        setStep("credentials")
                        setOtp("")
                        setPendingAccess("")
                        setPendingPermissions([])
                      }}
                    >
                      ← Back
                    </button>
                    <span className="text-muted-foreground">
                      Didn't get it? Go back and login again.
                    </span>
                  </div>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}