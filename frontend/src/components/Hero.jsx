import { Link } from "react-router-dom"
import { brand } from "../config/brand"


function Hero() {
  return (
    <section className="hero-section overflow-hidden">
      <div className="hero-orb hero-orb-left" />
      <div className="hero-orb hero-orb-right" />

      <div className="container position-relative py-5">
        <div className="row align-items-center g-5 min-vh-75 py-lg-5">
          <div className="col-lg-7">
            <p className="eyebrow mb-4">
              Créations florales · Événements · Cadeaux
            </p>
            <h1 className="display-title mb-4">
              Les fleurs qui donnent vie à vos moments.
            </h1>
            <p className="hero-description mb-5">{brand.description}</p>

            <div className="d-flex flex-column flex-sm-row gap-3">
              <Link className="btn btn-bloom btn-lg" to="/boutique">
                Découvrir la boutique
              </Link>
              <a className="btn btn-bloom-outline btn-lg" href="#collections">
                Explorer les collections
              </a>
            </div>

            <div className="hero-promises row g-3 mt-5 pt-4">
              <div className="col-4">Bouquets signature</div>
              <div className="col-4">Créations sur mesure</div>
              <div className="col-4">Design événementiel</div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="logo-stage mx-auto">
              <img
                src="/logo.png"
                alt={`Logo ${brand.name}`}
                className="img-fluid logo-artwork"
              />
              <span className="logo-caption">{brand.tagline}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

