import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getApiError } from "../services/api"


function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/compte" replace />

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      await signIn(form)
      navigate(location.state?.from || "/compte", { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError, "Connexion impossible pour le moment."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page py-5 py-lg-7">
      <div className="container py-4">
        <div className="auth-card mx-auto">
          <p className="eyebrow mb-3">Espace client</p>
          <h1 className="auth-title mb-3">Bon retour.</h1>
          <p className="auth-copy mb-4">
            Connectez-vous pour gérer votre profil et vos adresses.
          </p>

          {error && <div className="form-alert mb-4" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-username">Nom d'utilisateur</label>
              <input
                required
                autoComplete="username"
                className="form-control auth-control"
                id="login-username"
                name="username"
                value={form.username}
                onChange={updateField}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="login-password">Mot de passe</label>
              <input
                required
                autoComplete="current-password"
                className="form-control auth-control"
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
              />
            </div>
            <button className="btn btn-bloom w-100" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="auth-switch mb-0 mt-4">
            Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
