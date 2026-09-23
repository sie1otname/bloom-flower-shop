import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { getApiError } from "../services/api"
import { formatCurrency } from "../utils/format"


function CartPage() {
  const { cart, isLoadingCart, changeQuantity, removeItem } = useCart()
  const [busyItemId, setBusyItemId] = useState(null)
  const [error, setError] = useState("")

  async function handleQuantity(item, quantity) {
    setBusyItemId(item.id)
    setError("")
    try {
      await changeQuantity(item.id, Number(quantity))
    } catch (requestError) {
      setError(getApiError(requestError, "Impossible de modifier la quantité."))
    } finally {
      setBusyItemId(null)
    }
  }

  async function handleRemove(itemId) {
    setBusyItemId(itemId)
    setError("")
    try {
      await removeItem(itemId)
    } catch (requestError) {
      setError(getApiError(requestError, "Impossible de retirer cet article."))
    } finally {
      setBusyItemId(null)
    }
  }

  if (isLoadingCart) {
    return <div aria-live="polite" className="auth-loading" role="status">Chargement du panier...</div>
  }

  if (cart.items.length === 0) {
    return (
      <section className="empty-page py-5 py-lg-7">
        <div className="container py-5">
          <div className="empty-card mx-auto text-center">
            <span className="empty-card-number" aria-hidden="true">0</span>
            <p className="eyebrow mb-3">Panier</p>
            <h1 className="section-title mb-4">Votre sélection est vide.</h1>
            <p className="section-copy mx-auto mb-5">
              Parcourez les créations de L'Artisane Fleuriste et préparez votre demande.
            </p>
            <Link to="/boutique" className="btn btn-bloom btn-lg">Découvrir la boutique</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page py-5 py-lg-7">
      <div className="container py-4">
        <div className="mb-5">
          <p className="eyebrow mb-3">Votre sélection</p>
          <h1 className="section-title display-5 mb-2">Panier</h1>
          <p className="section-copy mb-0">Les prix et disponibilités sont vérifiés par Bloom.</p>
        </div>

        {error && <div className="form-alert mb-4" role="alert">{error}</div>}

        <div className="row g-5">
          <div className="col-lg-8">
            <div className="cart-items">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <Link className="cart-item-image-wrap" to={`/boutique/${item.product.slug}`}>
                    {item.product.image_url ? (
                      <img className="cart-item-image" src={item.product.image_url} alt={item.product.name} />
                    ) : (
                      <div className={`product-placeholder occasion-${item.product.occasion}`}>Bloom</div>
                    )}
                  </Link>
                  <div className="cart-item-content">
                    <div>
                      <Link className="cart-item-name" to={`/boutique/${item.product.slug}`}>{item.product.name}</Link>
                      <p className="cart-item-price mb-0">{formatCurrency(item.product.price)} l'unité</p>
                    </div>
                    <div className="cart-item-actions">
                      <label className="visually-hidden" htmlFor={`quantity-${item.id}`}>Quantité de {item.product.name}</label>
                      <select
                        id={`quantity-${item.id}`}
                        className="form-select cart-quantity"
                        value={item.quantity}
                        disabled={busyItemId === item.id}
                        onChange={(event) => handleQuantity(item, event.target.value)}
                      >
                        {Array.from({ length: Math.min(item.product.stock, 10) }, (_, index) => index + 1).map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                      <button className="cart-remove" disabled={busyItemId === item.id} type="button" onClick={() => handleRemove(item.id)}>
                        Retirer
                      </button>
                    </div>
                  </div>
                  <strong className="cart-item-subtotal">{formatCurrency(item.subtotal)}</strong>
                </article>
              ))}
            </div>
            <Link className="text-link d-inline-block mt-4" to="/boutique">← Continuer ma sélection</Link>
          </div>

          <div className="col-lg-4">
            <aside className="cart-summary">
              <p className="account-kicker">Récapitulatif</p>
              <div className="cart-summary-row">
                <span>{cart.item_count} article{cart.item_count > 1 ? "s" : ""}</span>
                <strong>{formatCurrency(cart.total)}</strong>
              </div>
              <div className="cart-summary-row cart-total">
                <span>Total estimé</span>
                <strong>{formatCurrency(cart.total)}</strong>
              </div>
              <p className="cart-summary-note">
                Les frais de livraison seront déterminés lors de la demande. Aucun paiement en ligne.
              </p>
              <Link className="btn btn-bloom w-100" to="/commande">
                Préparer ma demande
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CartPage
