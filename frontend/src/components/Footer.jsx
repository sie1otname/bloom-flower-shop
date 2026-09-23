import { Link } from "react-router-dom"
import { brand } from "../config/brand"


function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="container py-5">
        <div className="row g-5 py-lg-4">
          <div className="col-lg-6">
            <div className="footer-brand mb-3">{brand.name}</div>
            <p className="footer-copy mb-0">{brand.description}</p>
          </div>
          <div className="col-6 col-lg-3">
            <p className="footer-heading">Navigation</p>
            <Link to="/" className="footer-link">
              Accueil
            </Link>
            <Link to="/boutique" className="footer-link">
              Boutique
            </Link>
          </div>
          <div className="col-6 col-lg-3">
            <p className="footer-heading">Projet</p>
            <span className="footer-link">Demande sans paiement</span>
            <span className="footer-link">Ottawa · Gatineau</span>
          </div>
        </div>
        <div className="footer-bottom d-flex flex-column flex-sm-row justify-content-between gap-2 pt-4 mt-4">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <span>{brand.tagline}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer

