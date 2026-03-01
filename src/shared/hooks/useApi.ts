import { useState, useEffect, useCallback } from 'react'

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useApi<T>(
  apiFunc: () => Promise<T>,
  deps: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFunc()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useMutation<TArgs, TResult>(
  mutationFunc: (args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (args: TArgs): Promise<TResult | null> => {
    setLoading(true)
    setError(null)
    try {
      return await mutationFunc(args)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error }
}
