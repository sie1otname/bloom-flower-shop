import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import ProductCard from "./ProductCard"


const product = {
  name: "Fresca",
  slug: "fresca",
  description: "Un bouquet frais et contemporain.",
  price: "75000.00",
  occasion: "other",
  occasion_label: "Autre",
  is_featured: true,
  is_available: true,
  category: { name: "Plaisir d'offrir" },
  images: [{ image_url: "https://example.com/fresca.jpg", alt_text: "Bouquet Fresca" }],
}


function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <ProductCard product={{ ...product, ...overrides }} />
    </MemoryRouter>,
  )
}


describe("ProductCard", () => {
  it("présente le produit avec un lien accessible", () => {
    renderCard()

    expect(screen.getByRole("heading", { name: "Fresca" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Bouquet Fresca" })).toHaveAttribute("loading", "lazy")
    expect(screen.getByRole("link", { name: "Voir la création" })).toHaveAttribute("href", "/boutique/fresca")
  })

  it("désactive l'action lorsque le produit est indisponible", () => {
    renderCard({ is_available: false })

    expect(screen.getByRole("button", { name: "Indisponible" })).toBeDisabled()
  })

  it("ne contient aucune violation d'accessibilité détectable", async () => {
    const { container } = renderCard()
    const results = await axe.run(container)

    expect(results.violations).toEqual([])
  })
})
