import { NavLink } from "react-router-dom"
import { brand } from "../config/brand"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"


function Header() {
  const { user } = useAuth()
  const { cart } = useCart()

  return (
    <header className="site-header sticky-top">
      <nav aria-label="Navigation principale" className="navbar navbar-expand-lg container py-3">
        <NavLink className="navbar-brand brand-wordmark" to="/">
          {brand.shortName}
        </NavLink>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavigation"
          aria-controls="mainNavigation"
          aria-expanded="false"
          aria-label="Ouvrir la navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavigation">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-4">
            <NavLink className="nav-link" to="/">
              Accueil
            </NavLink>
            <NavLink className="nav-link" to="/boutique">
              Boutique
            </NavLink>
            <NavLink className="nav-link" to={user ? "/compte" : "/connexion"}>
              {user ? "Mon compte" : "Connexion"}
            </NavLink>
            {user && (
              <NavLink className="nav-link" to="/commandes">
                Commandes
              </NavLink>
            )}
            <NavLink className="nav-link cart-link" to="/panier">
              Panier <span aria-label={`${cart.item_count} article${cart.item_count > 1 ? "s" : ""} dans le panier`} className="cart-count">{cart.item_count}</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
