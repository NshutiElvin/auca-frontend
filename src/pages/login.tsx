import { LoginForm } from "../components/login-form";

export default function LoginPage() {
  return (
    <div className="w-full space-y-4">
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
