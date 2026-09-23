import { describe, expect, it } from "vitest"
import { formatCurrency } from "./format"


describe("formatCurrency", () => {
  it("affiche les prix sans décimales en FCFA", () => {
    expect(formatCurrency("75000.00")).toMatch(/^75[\s\u202f]000 FCFA$/)
  })

  it("accepte une valeur numérique", () => {
    expect(formatCurrency(45000)).toMatch(/^45[\s\u202f]000 FCFA$/)
  })
})
