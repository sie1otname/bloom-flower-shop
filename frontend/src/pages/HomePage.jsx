import { Link } from "react-router-dom"
import CollectionCard from "../components/CollectionCard"
import Hero from "../components/Hero"
import { collections } from "../data/collections"


function HomePage() {
  return (
    <>
      <Hero />

      <section className="story-section py-5 py-lg-7">
        <div className="container py-4">
          <div className="row g-5 align-items-end">
            <div className="col-lg-5">
              <p className="eyebrow mb-3">Notre approche</p>
              <h2 className="section-title mb-0">
                Composer avec intention, offrir avec émotion.
              </h2>
            </div>
            <div className="col-lg-6 offset-lg-1">
              <p className="section-copy mb-4">
                Chaque composition est pensée comme une pièce unique. Bloom
                permet de découvrir l'univers de L'Artisane Fleuriste et de
                préparer une demande adaptée à chaque occasion.
              </p>
              <Link to="/boutique" className="text-link">
                Voir toutes les créations <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className="collections-section py-5 py-lg-7">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
            <div>
              <p className="eyebrow mb-3">Collections</p>
              <h2 className="section-title mb-0">Une fleur pour chaque histoire.</h2>
            </div>
            <p className="section-note mb-0">
              Quatre univers issus du catalogue officiel.
            </p>
          </div>

          <div className="collections-grid">
            {collections.map((collection, index) => (
              <CollectionCard
                key={collection.name}
                collection={collection}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="request-section py-5 py-lg-7">
        <div className="container py-4 text-center">
          <p className="eyebrow eyebrow-light mb-3">Sur mesure</p>
          <h2 className="request-title mx-auto mb-4">
            Une idée particulière mérite une création particulière.
          </h2>
          <p className="request-copy mx-auto mb-5">
            Préparez votre sélection, ajoutez votre message et envoyez votre
            demande. Aucun paiement en ligne n'est nécessaire pour le MVP.
          </p>
          <Link to="/boutique" className="btn btn-light btn-lg rounded-pill px-5">
            Commencer une sélection
          </Link>
        </div>
      </section>
    </>
  )
}

export default HomePage
