import { LoginForm } from "./login-form"
import { getServerSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getServerSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">เข้าสู่ระบบ KPI</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

