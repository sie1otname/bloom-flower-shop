import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { getApiError, getOrders } from "../services/api"
import { formatCurrency } from "../utils/format"


function formatDate(value) {
  if (!value) return "À confirmer"
  return new Intl.DateTimeFormat("fr-CA", { dateStyle: "long" }).format(
    new Date(`${value}T12:00:00`),
  )
}


function OrdersPage() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((requestError) => {
        setError(getApiError(requestError, "Impossible de charger vos commandes."))
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section className="orders-page py-5 py-lg-7">
      <div className="container py-4">
        <p className="eyebrow mb-3">Espace client</p>
        <h1 className="section-title display-5 mb-2">Mes demandes</h1>
        <p className="section-copy mb-5">Suivez les demandes envoyées à L'Artisane Fleuriste.</p>

        {location.state?.createdOrderId && (
          <div aria-live="polite" className="form-success mb-4" role="status">
            Demande #{location.state.createdOrderId} envoyée. L'équipe pourra maintenant la confirmer.
          </div>
        )}
        {error && <div className="form-alert mb-4" role="alert">{error}</div>}
        {isLoading && <div aria-live="polite" className="auth-loading" role="status">Chargement de vos demandes...</div>}

        {!isLoading && orders.length === 0 && (
          <div className="empty-card text-center mx-auto">
            <h2 className="account-panel-title">Aucune demande pour le moment.</h2>
            <Link className="btn btn-bloom mt-3" to="/boutique">Découvrir la boutique</Link>
          </div>
        )}

        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <p className="account-kicker mb-2">Demande #{order.id}</p>
                  <h2 className="order-card-title">Livraison le {formatDate(order.delivery_date)}</h2>
                </div>
                <span className={`order-status status-${order.status}`}>{order.status_label}</span>
              </div>

              <div className="order-card-grid">
                <div>
                  <p className="order-label">Créations</p>
                  {order.items.map((item) => (
                    <div className="order-item-line" key={item.id}>
                      <span>{item.quantity} × {item.product_name}</span>
                      <strong>{formatCurrency(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="order-label">Livraison</p>
                  <p className="mb-0">
                    {order.delivery_name}<br />
                    {order.delivery_address_1}{order.delivery_address_2 && `, ${order.delivery_address_2}`}<br />
                    {order.delivery_city}, {order.delivery_province} {order.delivery_postal_code}
                  </p>
                </div>
              </div>

              {order.gift_message && (
                <div className="order-message">
                  <span>Message</span>
                  <p className="mb-0">{order.gift_message}</p>
                </div>
              )}

              <div className="order-total">
                <span>Total estimé</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OrdersPage
