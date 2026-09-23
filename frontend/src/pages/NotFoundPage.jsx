import { Link } from "react-router-dom"


function NotFoundPage() {
  return (
    <section className="empty-page py-5 py-lg-7">
      <div className="container py-5">
        <div className="empty-card mx-auto">
          <span className="empty-card-number" aria-hidden="true">404</span>
          <p className="eyebrow mb-3">Page introuvable</p>
          <h1 className="section-title display-5 mb-4">Cette fleur s'est échappée.</h1>
          <p className="section-copy mx-auto mb-4">
            La page demandée n'existe pas ou a été déplacée.
          </p>
          <Link className="btn btn-bloom" to="/boutique">
            Retourner à la boutique
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
