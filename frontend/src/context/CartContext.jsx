import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthContext"
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/api"


const EMPTY_CART = { items: [], item_count: 0, total: "0.00" }
const CartContext = createContext(null)


export function CartProvider({ children }) {
  const { user, isInitializing } = useAuth()
  const [cart, setCart] = useState(EMPTY_CART)
  const [isLoadingCart, setIsLoadingCart] = useState(false)

  useEffect(() => {
    let isCurrent = true

    if (isInitializing) return undefined
    if (!user) {
      setCart(EMPTY_CART)
      return undefined
    }

    setIsLoadingCart(true)
    getCart()
      .then((data) => {
        if (isCurrent) setCart(data)
      })
      .finally(() => {
        if (isCurrent) setIsLoadingCart(false)
      })

    return () => {
      isCurrent = false
    }
  }, [user, isInitializing])

  async function addItem(productId, quantity) {
    const nextCart = await addCartItem(productId, quantity)
    setCart(nextCart)
  }

  async function changeQuantity(itemId, quantity) {
    const nextCart = await updateCartItem(itemId, quantity)
    setCart(nextCart)
  }

  async function removeItem(itemId) {
    const nextCart = await removeCartItem(itemId)
    setCart(nextCart)
  }

  async function refreshCart() {
    if (!user) {
      setCart(EMPTY_CART)
      return EMPTY_CART
    }
    const nextCart = await getCart()
    setCart(nextCart)
    return nextCart
  }

  return (
    <CartContext.Provider
      value={{ cart, isLoadingCart, addItem, changeQuantity, removeItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart doit être utilisé dans CartProvider.")
  return context
}
