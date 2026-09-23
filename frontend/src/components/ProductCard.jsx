import { Link } from "react-router-dom"
import { formatCurrency } from "../utils/format"


function ProductCard({ product }) {
  const image = product.images?.[0]

  return (
    <article className="product-card h-100">
      <div className="product-image-wrap">
        {image ? (
          <img
            src={image.image_url}
            alt={image.alt_text || product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div
            className={`product-placeholder occasion-${product.occasion}`}
            aria-hidden="true"
          >
            <span>Fleur</span>
          </div>
        )}
        {product.is_featured && (
          <span className="product-badge">Sélection</span>
        )}
      </div>
      <div className="p-4">
        <p className="product-meta mb-2">
          {product.category?.name} · {product.occasion_label}
        </p>
        <div className="d-flex justify-content-between align-items-start gap-3">
          <h2 className="product-title mb-0">{product.name}</h2>
          <span className="product-price">{formatCurrency(product.price)}</span>
        </div>
        <p className="product-description mt-3 mb-4">
          {product.description}
        </p>
        {product.is_available ? (
          <Link
            className="btn btn-bloom-outline w-100"
            to={`/boutique/${product.slug}`}
          >
            Voir la création
          </Link>
        ) : (
          <button className="btn btn-bloom-outline w-100" disabled type="button">
            Indisponible
          </button>
        )}
      </div>
    </article>
  )
}

export default ProductCard
