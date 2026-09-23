import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import Header from "./Header"


vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { username: "samuel" } }),
}))

vi.mock("../context/CartContext", () => ({
  useCart: () => ({ cart: { item_count: 3 } }),
}))


function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )
}


describe("Header", () => {
  it("affiche les routes privées et le nombre d'articles", () => {
    renderHeader()

    expect(screen.getByRole("navigation", { name: "Navigation principale" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Commandes" })).toHaveAttribute("href", "/commandes")
    expect(screen.getByLabelText("3 articles dans le panier")).toHaveTextContent("3")
  })

  it("ne contient aucune violation d'accessibilité détectable", async () => {
    const { container } = renderHeader()
    const results = await axe.run(container)

    expect(results.violations).toEqual([])
  })
})
