import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  createAddress,
  deleteAddress,
  getAddresses,
  getApiError,
} from "../services/api"


const EMPTY_ADDRESS = {
  label: "Maison",
  full_name: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  province: "ON",
  postal_code: "",
  country: "CA",
  phone: "",
}


function AccountPage() {
  const { user, saveProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  })
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState({
    ...EMPTY_ADDRESS,
    full_name: `${user.first_name} ${user.last_name}`.trim(),
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch((requestError) =>
        setError(getApiError(requestError, "Impossible de charger vos adresses."))
      )
      .finally(() => setIsLoadingAddresses(false))
  }, [])

  function updateProfileField(event) {
    setProfile({ ...profile, [event.target.name]: event.target.value })
  }

  function updateAddressField(event) {
    const value = event.target.name === "country"
      ? event.target.value.toUpperCase()
      : event.target.value
    setAddressForm({ ...addressForm, [event.target.name]: value })
  }

  async function submitProfile(event) {
    event.preventDefault()
    setError("")
    setMessage("")
    try {
      await saveProfile(profile)
      setMessage("Profil mis à jour.")
    } catch (requestError) {
      setError(getApiError(requestError, "Impossible de mettre à jour le profil."))
    }
  }

  async function submitAddress(event) {
    event.preventDefault()
    setError("")
    setMessage("")
    try {
      const newAddress = await createAddress(addressForm)
      setAddresses((current) => [newAddress, ...current])
      setAddressForm({
        ...EMPTY_ADDRESS,
        full_name: `${user.first_name} ${user.last_name}`.trim(),
      })
      setMessage("Adresse enregistrée.")
    } catch (requestError) {
      setError(getApiError(requestError, "Impossible d'enregistrer l'adresse."))
    }
  }

  async function removeAddress(id) {
    if (!window.confirm("Supprimer cette adresse ?")) return
    setError("")
    try {
      await deleteAddress(id)
      setAddresses((current) => current.filter((address) => address.id !== id))
      setMessage("Adresse supprimée.")
    } catch (requestError) {
      setError(getApiError(requestError, "Impossible de supprimer l'adresse."))
    }
  }

  async function handleLogout() {
    await signOut()
    navigate("/", { replace: true })
  }

  return (
    <section className="account-page py-5 py-lg-7">
      <div className="container py-4">
        <div className="account-heading d-flex flex-column flex-md-row justify-content-between gap-4 mb-5">
          <div>
            <p className="eyebrow mb-3">Espace client</p>
            <h1 className="section-title display-5 mb-2">
              Bonjour, {user.first_name || user.username}.
            </h1>
            <p className="section-copy mb-0">Gérez vos coordonnées et adresses de livraison.</p>
          </div>
          <div className="d-flex gap-2 align-self-md-end">
            <Link className="btn btn-bloom-outline" to="/commandes">Mes commandes</Link>
            <button className="btn btn-bloom-outline" type="button" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

        {message && <div aria-live="polite" className="form-success mb-4" role="status">{message}</div>}
        {error && <div className="form-alert mb-4" role="alert">{error}</div>}

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="account-panel">
              <p className="account-kicker">01 · Profil</p>
              <h2 className="account-panel-title">Vos informations</h2>
              <p className="account-username">@{user.username}</p>
              <form onSubmit={submitProfile}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="profile-first-name">Prénom</label>
                    <input required className="form-control auth-control" id="profile-first-name" name="first_name" value={profile.first_name} onChange={updateProfileField} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="profile-last-name">Nom</label>
                    <input required className="form-control auth-control" id="profile-last-name" name="last_name" value={profile.last_name} onChange={updateProfileField} />
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="profile-email">Courriel</label>
                    <input required className="form-control auth-control" id="profile-email" name="email" type="email" value={profile.email} onChange={updateProfileField} />
                  </div>
                </div>
                <button className="btn btn-bloom mt-4" type="submit">Enregistrer le profil</button>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="account-panel">
              <p className="account-kicker">02 · Adresses</p>
              <h2 className="account-panel-title">Adresses enregistrées</h2>

              {isLoadingAddresses && <p className="account-muted">Chargement...</p>}
              {!isLoadingAddresses && addresses.length === 0 && (
                <p className="account-muted">Aucune adresse enregistrée pour le moment.</p>
              )}
              <div className="address-list mb-5">
                {addresses.map((address) => (
                  <article className="address-card" key={address.id}>
                    <div>
                      <strong>{address.label}</strong>
                      <p className="mb-0">
                        {address.full_name}<br />
                        {address.address_line_1}{address.address_line_2 && `, ${address.address_line_2}`}<br />
                        {address.city}, {address.province} {address.postal_code}
                      </p>
                    </div>
                    <button className="address-delete" type="button" onClick={() => removeAddress(address.id)}>
                      Supprimer
                    </button>
                  </article>
                ))}
              </div>

              <h3 className="address-form-title">Ajouter une adresse</h3>
              <form onSubmit={submitAddress}>
                <div className="row g-3">
                  <div className="col-sm-5"><label className="form-label" htmlFor="address-label">Étiquette</label><input required className="form-control auth-control" id="address-label" name="label" value={addressForm.label} onChange={updateAddressField} /></div>
                  <div className="col-sm-7"><label className="form-label" htmlFor="address-name">Nom complet</label><input required className="form-control auth-control" id="address-name" name="full_name" value={addressForm.full_name} onChange={updateAddressField} /></div>
                  <div className="col-12"><label className="form-label" htmlFor="address-line-1">Adresse</label><input required className="form-control auth-control" id="address-line-1" name="address_line_1" value={addressForm.address_line_1} onChange={updateAddressField} /></div>
                  <div className="col-12"><label className="form-label" htmlFor="address-line-2">Appartement ou unité (optionnel)</label><input className="form-control auth-control" id="address-line-2" name="address_line_2" value={addressForm.address_line_2} onChange={updateAddressField} /></div>
                  <div className="col-sm-6"><label className="form-label" htmlFor="address-city">Ville</label><input required className="form-control auth-control" id="address-city" name="city" value={addressForm.city} onChange={updateAddressField} /></div>
                  <div className="col-sm-3"><label className="form-label" htmlFor="address-province">Province</label><input className="form-control auth-control" id="address-province" name="province" value={addressForm.province} onChange={updateAddressField} /></div>
                  <div className="col-sm-3"><label className="form-label" htmlFor="address-country">Pays</label><input required maxLength="2" className="form-control auth-control" id="address-country" name="country" value={addressForm.country} onChange={updateAddressField} /></div>
                  <div className="col-sm-6"><label className="form-label" htmlFor="address-postal">Code postal</label><input required className="form-control auth-control" id="address-postal" name="postal_code" value={addressForm.postal_code} onChange={updateAddressField} /></div>
                  <div className="col-sm-6"><label className="form-label" htmlFor="address-phone">Téléphone</label><input className="form-control auth-control" id="address-phone" name="phone" type="tel" value={addressForm.phone} onChange={updateAddressField} /></div>
                </div>
                <button className="btn btn-bloom mt-4" type="submit">Ajouter l'adresse</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AccountPage
