import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  type User,
} from "firebase/auth"
import { auth } from "../lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loginAnonymously: () => Promise<boolean>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch {
      setLoading(false)
      return false
    }
  }

  const register = async (email: string, password: string) => {
    try {
      setLoading(true)
      await createUserWithEmailAndPassword(auth, email, password)
      return true
    } catch {
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const loginAnonymouslyFn = async () => {
    try {
      setLoading(true)
      await signInAnonymously(auth)
      return true
    } catch {
      setLoading(false)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginAnonymously: loginAnonymouslyFn,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
