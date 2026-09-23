import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getApiError } from "../services/api"


const EMPTY_FORM = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  password_confirm: "",
}


function RegisterPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/compte" replace />

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.password !== form.password_confirm) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setError("")
    setIsSubmitting(true)
    try {
      await signUp(form)
      navigate("/compte", { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError, "Création du compte impossible."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page py-5 py-lg-7">
      <div className="container py-4">
        <div className="auth-card auth-card-wide mx-auto">
          <p className="eyebrow mb-3">Nouveau client</p>
          <h1 className="auth-title mb-3">Créer votre espace Bloom.</h1>
          <p className="auth-copy mb-4">
            Enregistrez vos coordonnées pour simplifier vos futures demandes.
          </p>

          {error && <div className="form-alert mb-4" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="first-name">Prénom</label>
                <input required className="form-control auth-control" id="first-name" name="first_name" value={form.first_name} onChange={updateField} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="last-name">Nom</label>
                <input required className="form-control auth-control" id="last-name" name="last_name" value={form.last_name} onChange={updateField} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="register-username">Nom d'utilisateur</label>
                <input required autoComplete="username" className="form-control auth-control" id="register-username" name="username" value={form.username} onChange={updateField} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="register-email">Courriel</label>
                <input required autoComplete="email" className="form-control auth-control" id="register-email" name="email" type="email" value={form.email} onChange={updateField} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="register-password">Mot de passe</label>
                <input required minLength="8" autoComplete="new-password" className="form-control auth-control" id="register-password" name="password" type="password" value={form.password} onChange={updateField} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="password-confirm">Confirmer</label>
                <input required minLength="8" autoComplete="new-password" className="form-control auth-control" id="password-confirm" name="password_confirm" type="password" value={form.password_confirm} onChange={updateField} />
              </div>
            </div>
            <button className="btn btn-bloom w-100 mt-4" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="auth-switch mb-0 mt-4">
            Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
