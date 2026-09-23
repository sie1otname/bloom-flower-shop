import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { createOrder, getAddresses, getApiError } from "../services/api"
import { formatCurrency } from "../utils/format"


const TODAY = new Date().toISOString().slice(0, 10)


function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, isLoadingCart, refreshCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    address_id: "",
    customer_phone: "",
    delivery_date: "",
    gift_message: "",
  })

  useEffect(() => {
    getAddresses()
      .then((items) => {
        setAddresses(items)
        if (items.length > 0) {
          setForm((current) => ({
            ...current,
            address_id: String(items[0].id),
            customer_phone: items[0].phone || "",
          }))
        }
      })
      .catch((requestError) => {
        setError(getApiError(requestError, "Impossible de charger vos adresses."))
      })
      .finally(() => setIsLoadingAddresses(false))
  }, [])

  const selectedAddress = useMemo(
    () => addresses.find((address) => String(address.id) === form.address_id),
    [addresses, form.address_id],
  )

  function updateField(event) {
    const { name, value } = event.target
    if (name === "address_id") {
      const address = addresses.find((item) => String(item.id) === value)
      setForm((current) => ({
        ...current,
        address_id: value,
        customer_phone: address?.phone || current.customer_phone,
      }))
      return
    }
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitOrder(event) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      const order = await createOrder({
        ...form,
        address_id: Number(form.address_id),
      })
      await refreshCart()
      navigate("/commandes", {
        replace: true,
        state: { createdOrderId: order.id },
      })
    } catch (requestError) {
      setError(getApiError(requestError, "Impossible d'envoyer votre demande."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCart || isLoadingAddresses) {
    return <div aria-live="polite" className="auth-loading" role="status">Préparation de votre demande...</div>
  }

  if (cart.items.length === 0) {
    return (
      <section className="empty-page py-5 py-lg-7">
        <div className="container py-5">
          <div className="empty-card mx-auto text-center">
            <p className="eyebrow mb-3">Demande de commande</p>
            <h1 className="section-title mb-4">Votre panier est vide.</h1>
            <Link className="btn btn-bloom" to="/boutique">Découvrir les créations</Link>
          </div>
        </div>
      </section>
    )
  }

  if (addresses.length === 0) {
    return (
      <section className="empty-page py-5 py-lg-7">
        <div className="container py-5">
          <div className="empty-card mx-auto text-center">
            <p className="eyebrow mb-3">Adresse nécessaire</p>
            <h1 className="section-title mb-4">Ajoutez une adresse de livraison.</h1>
            <p className="section-copy mx-auto mb-4">
              Une adresse enregistrée est nécessaire avant d'envoyer la demande.
            </p>
            <Link className="btn btn-bloom" to="/compte">Ajouter une adresse</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-page py-5 py-lg-7">
      <div className="container py-4">
        <p className="eyebrow mb-3">Dernière étape</p>
        <h1 className="section-title display-5 mb-2">Demande de commande</h1>
        <p className="section-copy mb-5">
          Confirmez la livraison. Aucun paiement ne sera demandé sur Bloom.
        </p>

        {error && <div className="form-alert mb-4" role="alert">{error}</div>}

        <div className="row g-5">
          <div className="col-lg-7">
            <form className="account-panel checkout-form" onSubmit={submitOrder}>
              <p className="account-kicker">01 · Livraison</p>
              <h2 className="account-panel-title">Coordonnées</h2>

              <div className="mb-4">
                <label className="form-label" htmlFor="checkout-address">Adresse enregistrée</label>
                <select
                  required
                  className="form-select auth-control"
                  id="checkout-address"
                  name="address_id"
                  value={form.address_id}
                  onChange={updateField}
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} — {address.full_name}, {address.city}
                    </option>
                  ))}
                </select>
                {selectedAddress && (
                  <div className="checkout-address-preview">
                    <strong>{selectedAddress.full_name}</strong>
                    <span>{selectedAddress.address_line_1}{selectedAddress.address_line_2 && `, ${selectedAddress.address_line_2}`}</span>
                    <span>{selectedAddress.city}, {selectedAddress.province} {selectedAddress.postal_code}</span>
                  </div>
                )}
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkout-phone">Téléphone de contact</label>
                  <input
                    required
                    className="form-control auth-control"
                    id="checkout-phone"
                    name="customer_phone"
                    type="tel"
                    value={form.customer_phone}
                    onChange={updateField}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkout-date">Date souhaitée</label>
                  <input
                    required
                    className="form-control auth-control"
                    id="checkout-date"
                    min={TODAY}
                    name="delivery_date"
                    type="date"
                    value={form.delivery_date}
                    onChange={updateField}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="checkout-message">Message personnalisé (optionnel)</label>
                  <textarea
                    className="form-control auth-control checkout-message"
                    id="checkout-message"
                    maxLength="500"
                    name="gift_message"
                    rows="5"
                    value={form.gift_message}
                    onChange={updateField}
                  />
                  <small className="checkout-character-count">{form.gift_message.length}/500</small>
                </div>
              </div>

              <button className="btn btn-bloom btn-lg mt-4" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
              </button>
              <p className="checkout-no-payment mb-0 mt-3">Aucun paiement en ligne. L'équipe confirmera ensuite la disponibilité et la livraison.</p>
            </form>
          </div>

          <div className="col-lg-5">
            <aside className="cart-summary checkout-summary">
              <p className="account-kicker">02 · Récapitulatif</p>
              <div className="checkout-items">
                {cart.items.map((item) => (
                  <div className="checkout-item" key={item.id}>
                    <span>{item.quantity} × {item.product.name}</span>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="cart-summary-row cart-total">
                <span>Total estimé</span>
                <strong>{formatCurrency(cart.total)}</strong>
              </div>
              <p className="cart-summary-note mb-0">Les frais de livraison seront confirmés séparément.</p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CheckoutPage
