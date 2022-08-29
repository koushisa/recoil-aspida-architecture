import { useState } from 'react'

type AnyArgs = ReadonlyArray<any>

export type UsePromiseOptions = {
  onStart?: () => void
  onEnd?: () => void
  onSuccess?: () => void
  onError?: (err: unknown) => void
}

export type UsePromiseReturn<T, Args extends AnyArgs> = {
  pending: boolean
  success: boolean
  error: Error | undefined
  call: (args?: Args) => Promise<T>
}

export const usePromise = <T, Args extends AnyArgs>(
  promise: (args?: Args) => Promise<T>,
  options?: UsePromiseOptions
): UsePromiseReturn<T, Args> => {
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<Error>()

  const call = (args?: Args) => {
    setPending(true)
    setSuccess(false)
    setError(undefined)

    options?.onStart?.()

    return new Promise<T>((resolve, reject) => {
      promise(args)
        .then((result) => {
          options?.onSuccess?.()

          setPending(false)
          setSuccess(true)

          resolve(result)
        })
        .catch((err) => {
          options?.onError?.(err)

          if (err instanceof Error) {
            setError(err)
            reject(err)
          }

          reject(new Error())
        })
        .finally(() => {
          options?.onEnd?.()

          setPending(false)
        })
    })
  }

  return {
    pending,
    error,
    success,
    call,
  }
}
