import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate("/language"), 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-indigo-700">
      <img src="/cmr-logo.png" alt="CMR" className="mb-6 h-20 w-auto" />
      <h1 className="text-3xl font-bold text-white">Plant Layout Training</h1>
      <p className="mt-2 text-indigo-200">Tetrahedron Manufacturing Services</p>
      <div className="mt-8 h-2 w-48 overflow-hidden rounded-full bg-indigo-500">
        <div className="h-full w-full animate-pulse rounded-full bg-white" />
      </div>
    </div>
  )
}
