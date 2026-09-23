import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { getApiError, getProduct } from "../services/api"
import { formatCurrency } from "../utils/format"


function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState("")
  const [cartMessage, setCartMessage] = useState("")
  const [cartHasError, setCartHasError] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadProduct() {
      setIsLoading(true)
      setError("")

      try {
        const data = await getProduct(slug)
        if (isCurrent) setProduct(data)
      } catch (requestError) {
        if (isCurrent) {
          setError(
            requestError.response?.status === 404
              ? "Cette création n'est plus disponible."
              : "Impossible de joindre le catalogue pour le moment."
          )
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadProduct()
    return () => {
      isCurrent = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <section className="product-detail-page py-5 py-lg-7">
        <div className="container py-4">
          <div className="detail-skeleton" aria-label="Chargement de la création" />
        </div>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="product-detail-page py-5 py-lg-7">
        <div className="container py-5 text-center">
          <p className="eyebrow mb-3">Création indisponible</p>
          <h1 className="section-title display-5 mb-4">{error}</h1>
          <Link className="btn btn-bloom" to="/boutique">
            Voir le catalogue
          </Link>
        </div>
      </section>
    )
  }

  const image = product.images?.[0]

  async function handleAddToCart() {
    if (!user) {
      navigate("/connexion", { state: { from: `/boutique/${slug}` } })
      return
    }

    setIsAdding(true)
    setCartMessage("")
    setCartHasError(false)
    try {
      await addItem(product.id, quantity)
      setCartMessage("Création ajoutée au panier.")
    } catch (requestError) {
      setCartHasError(true)
      setCartMessage(getApiError(requestError, "Impossible d'ajouter cette création."))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <section className="product-detail-page py-5 py-lg-7">
      <div className="container py-4">
        <Link className="detail-back-link" to="/boutique">
          <span aria-hidden="true">←</span> Retour aux créations
        </Link>

        <div className="row g-5 align-items-center mt-2">
          <div className="col-lg-6">
            <div className="detail-image-wrap">
              {image ? (
                <img
                  className="detail-image"
                  src={image.image_url}
                  alt={image.alt_text || product.name}
                />
              ) : (
                <div
                  className={`product-placeholder detail-placeholder occasion-${product.occasion}`}
                  aria-hidden="true"
                >
                  <span>Bloom</span>
                </div>
              )}
              {product.is_featured && (
                <span className="product-badge">Sélection de l'atelier</span>
              )}
            </div>
          </div>

          <div className="col-lg-5 offset-lg-1">
            <p className="product-meta mb-3">
              {product.category?.name} · {product.occasion_label}
            </p>
            <h1 className="detail-title mb-3">{product.name}</h1>
            <p className="detail-price mb-4">{formatCurrency(product.price)}</p>
            <p className="detail-description mb-4">{product.description}</p>

            <dl className="detail-facts mb-5">
              <div>
                <dt>Palette</dt>
                <dd>{product.color || "Au choix de l'artisane"}</dd>
              </div>
              <div>
                <dt>Disponibilité</dt>
                <dd>{product.is_available ? `${product.stock} en atelier` : "Indisponible"}</dd>
              </div>
              <div>
                <dt>Préparation</dt>
                <dd>Composition artisanale sur demande</dd>
              </div>
            </dl>

            {product.is_available && (
              <div className="detail-cart-actions mb-4">
                <label className="visually-hidden" htmlFor="detail-quantity">Quantité</label>
                <select
                  id="detail-quantity"
                  className="form-select detail-quantity"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <button className="btn btn-bloom flex-grow-1" disabled={isAdding} type="button" onClick={handleAddToCart}>
                  {isAdding ? "Ajout..." : user ? "Ajouter au panier" : "Se connecter pour ajouter"}
                </button>
              </div>
            )}

            {cartMessage && (
              <div aria-live="polite" className={`${cartHasError ? "form-alert" : "form-success"} mb-4`} role={cartHasError ? "alert" : "status"}>
                {cartMessage}
              </div>
            )}

            <div className="detail-notice">
              <strong>Comment commander ?</strong>
              <p className="mb-0">
                Ajoutez vos créations au panier. L'envoi de la demande arrive
                en P5 et ne nécessitera aucun paiement en ligne.
              </p>
            </div>

            {product.source_url && (
              <a className="source-link mt-3" href={product.source_url} target="_blank" rel="noreferrer">
                Voir la création sur le site officiel ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDetailPage
