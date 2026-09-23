import { Link } from "react-router-dom"


function CollectionCard({ collection, index }) {
  return (
    <Link
      className={`collection-card accent-${collection.accent}`}
      to={`/boutique?category=${collection.slug}`}
      aria-label={`Découvrir la collection ${collection.name}`}
    >
      <div className="collection-number">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div>
        <p className="collection-subtitle mb-2">{collection.subtitle}</p>
        <h3 className="collection-title mb-0">{collection.name}</h3>
      </div>
      <span className="collection-arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  )
}

export default CollectionCard
