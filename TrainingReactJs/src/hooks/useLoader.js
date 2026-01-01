import { useState, useCallback } from 'react'

export const useLoader = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Loading...')

  const showLoader = useCallback((msg = 'Loading...') => {
    setMessage(msg)
    setLoading(true)
  }, [])

  const hideLoader = useCallback(() => {
    setLoading(false)
    setMessage('Loading...')
  }, [])

  const withLoader = useCallback(
    async (asyncFn, loadingMessage = 'Loading...') => {
      try {
        showLoader(loadingMessage)
        const result = await asyncFn()
        return result
      } finally {
        hideLoader()
      }
    },
    [showLoader, hideLoader]
  )

  return {
    loading,
    message,
    showLoader,
    hideLoader,
    withLoader,
  }
}

export default useLoader

