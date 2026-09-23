import axios from "axios"


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bloom_token")
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

export async function getProducts(params = {}) {
  const response = await api.get("/products/", { params })
  const data = response.data

  return {
    items: data.results ?? data,
    count: data.count ?? data.length,
  }
}

export async function getCategories() {
  const response = await api.get("/categories/")
  return response.data.results ?? response.data
}

export async function getProduct(slug) {
  const response = await api.get(`/products/${slug}/`)
  return response.data
}

export async function registerAccount(payload) {
  const response = await api.post("/auth/register/", payload)
  return response.data
}

export async function loginAccount(payload) {
  const response = await api.post("/auth/login/", payload)
  return response.data
}

export async function logoutAccount() {
  await api.post("/auth/logout/")
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me/")
  return response.data
}

export async function updateCurrentUser(payload) {
  const response = await api.patch("/auth/me/", payload)
  return response.data
}

export async function getAddresses() {
  const response = await api.get("/addresses/")
  return response.data.results ?? response.data
}

export async function createAddress(payload) {
  const response = await api.post("/addresses/", payload)
  return response.data
}

export async function deleteAddress(id) {
  await api.delete(`/addresses/${id}/`)
}

export async function getCart() {
  const response = await api.get("/cart/")
  return response.data
}

export async function addCartItem(productId, quantity = 1) {
  const response = await api.post("/cart/items/", {
    product_id: productId,
    quantity,
  })
  return response.data
}

export async function updateCartItem(itemId, quantity) {
  const response = await api.patch(`/cart/items/${itemId}/`, { quantity })
  return response.data
}

export async function removeCartItem(itemId) {
  const response = await api.delete(`/cart/items/${itemId}/`)
  return response.data
}

export async function createOrder(payload) {
  const response = await api.post("/orders/", payload)
  return response.data
}

export async function getOrders() {
  const response = await api.get("/orders/")
  return response.data.results ?? response.data
}

export function getApiError(error, fallback) {
  const data = error.response?.data
  if (typeof data?.detail === "string") return data.detail
  if (data && typeof data === "object") {
    const firstValue = Object.values(data)[0]
    if (Array.isArray(firstValue)) return firstValue[0]
    if (typeof firstValue === "string") return firstValue
  }
  return fallback
}

export default api
