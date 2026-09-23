import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import { getCategories, getProducts } from "../services/api"


const OCCASIONS = [
  { value: "birth", label: "Naissance" },
  { value: "colorful", label: "Frénésie colorée" },
  { value: "valentine", label: "Saint-Valentin" },
  { value: "celebration", label: "Célébration" },
  { value: "wedding", label: "Mariage" },
  { value: "other", label: "Autre" },
]


function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [resultCount, setResultCount] = useState(0)
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") || "")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  const paramsKey = searchParams.toString()
  const category = searchParams.get("category") || ""
  const occasion = searchParams.get("occasion") || ""
  const featured = searchParams.get("featured") === "true"
  const hasFilters = Boolean(paramsKey)

  useEffect(() => {
    setDraftQuery(searchParams.get("q") || "")
  }, [paramsKey])

  useEffect(() => {
    let isCurrent = true

    getCategories()
      .then((data) => {
        if (isCurrent) setCategories(data)
      })
      .catch(() => {
        if (isCurrent) setCategories([])
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadProducts() {
      setIsLoading(true)
      setError("")

      try {
        const requestParams = Object.fromEntries(searchParams.entries())
        const data = await getProducts(requestParams)

        if (isCurrent) {
          setProducts(data.items)
          setResultCount(data.count)
        }
      } catch {
        if (isCurrent) {
          setProducts([])
          setResultCount(0)
          setError("Impossible de joindre l'API Django pour le moment.")
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadProducts()
    return () => {
      isCurrent = false
    }
  }, [paramsKey, reloadKey])

  function updateFilter(name, value) {
    const nextParams = new URLSearchParams(searchParams)

    if (value) nextParams.set(name, value)
    else nextParams.delete(name)

    setSearchParams(nextParams)
  }

  function handleSearch(event) {
    event.preventDefault()
    updateFilter("q", draftQuery.trim())
  }

  function clearFilters() {
    setDraftQuery("")
    setSearchParams({})
  }

  return (
    <section className="store-page py-5 py-lg-7">
      <div className="container py-4">
        <div className="row g-4 align-items-end mb-5">
          <div className="col-lg-7">
            <p className="eyebrow mb-3">Catalogue</p>
            <h1 className="section-title display-5 mb-3">Nos créations</h1>
            <p className="section-copy mb-0">
              Recherchez une composition par collection, occasion ou couleur.
            </p>
          </div>
          <div className="col-lg-5">
            <form className="search-form" onSubmit={handleSearch}>
              <label className="visually-hidden" htmlFor="product-search">
                Rechercher une création
              </label>
              <input
                id="product-search"
                className="form-control"
                type="search"
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Nom, fleur ou couleur..."
              />
              <button className="btn btn-bloom" type="submit">
                Rechercher
              </button>
            </form>
          </div>
        </div>

        <div className="catalog-toolbar mb-5">
          <div className="row g-3 align-items-end">
            <div className="col-sm-6 col-lg-4">
              <label className="filter-label" htmlFor="category-filter">
                Collection
              </label>
              <select
                id="category-filter"
                className="form-select filter-control"
                value={category}
                onChange={(event) => updateFilter("category", event.target.value)}
              >
                <option value="">Toutes les collections</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name} ({item.product_count})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-lg-4">
              <label className="filter-label" htmlFor="occasion-filter">
                Occasion
              </label>
              <select
                id="occasion-filter"
                className="form-select filter-control"
                value={occasion}
                onChange={(event) => updateFilter("occasion", event.target.value)}
              >
                <option value="">Toutes les occasions</option>
                {OCCASIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-lg-2">
              <div className="form-check featured-check">
                <input
                  id="featured-filter"
                  className="form-check-input"
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    updateFilter("featured", event.target.checked ? "true" : "")
                  }
                />
                <label className="form-check-label" htmlFor="featured-filter">
                  Sélections
                </label>
              </div>
            </div>

            <div className="col-sm-6 col-lg-2 d-grid">
              <button
                className="btn filter-reset"
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {!isLoading && !error && (
          <div className="catalog-summary mb-4" aria-live="polite">
            {resultCount} {resultCount > 1 ? "créations trouvées" : "création trouvée"}
          </div>
        )}

        {isLoading && (
          <div className="row g-4" aria-label="Chargement des créations">
            {[1, 2, 3].map((item) => (
              <div className="col-md-6 col-xl-4" key={item}>
                <div className="catalog-skeleton" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="catalog-message catalog-message-info">
            <strong>Le catalogue n'a pas pu être chargé.</strong>
            <span>{error}</span>
            <button
              className="btn btn-bloom align-self-center mt-2"
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Réessayer
            </button>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="catalog-message">
            <strong className="d-block mb-2">Aucune création trouvée.</strong>
            <span>Modifiez vos filtres ou affichez tout le catalogue.</span>
            <button
              className="btn btn-bloom-outline d-block mx-auto mt-4"
              type="button"
              onClick={clearFilters}
            >
              Voir toutes les créations
            </button>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-md-6 col-xl-4" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default StorePage
