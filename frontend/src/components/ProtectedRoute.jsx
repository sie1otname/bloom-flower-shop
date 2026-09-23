import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"


function ProtectedRoute({ children }) {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div aria-live="polite" className="auth-loading" role="status">Vérification de la session...</div>
  }

  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
