import { createContext, useContext, useEffect, useState } from "react"
import {
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateCurrentUser,
} from "../services/api"


const AuthContext = createContext(null)


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("bloom_token")

    if (!token) {
      setIsInitializing(false)
      return
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem("bloom_token"))
      .finally(() => setIsInitializing(false))
  }, [])

  function saveSession(data) {
    localStorage.setItem("bloom_token", data.token)
    setUser(data.user)
  }

  async function signIn(credentials) {
    const data = await loginAccount(credentials)
    saveSession(data)
  }

  async function signUp(payload) {
    const data = await registerAccount(payload)
    saveSession(data)
  }

  async function signOut() {
    try {
      await logoutAccount()
    } finally {
      localStorage.removeItem("bloom_token")
      setUser(null)
    }
  }

  async function saveProfile(payload) {
    const updatedUser = await updateCurrentUser(payload)
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{ user, isInitializing, signIn, signUp, signOut, saveProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider.")
  return context
}
