import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { LOCAL_STORAGE_KEYS } from '@/shared/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jsonplaceholder.typicode.com'

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Object.values(LOCAL_STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
