// Referenced from https://github.com/Andarist/use-constant/blob/main/src/index.ts

import React from 'react'

const cache = new Map()

/** TODO: avoid memory leak */
export function useConstant<T>(key: string, fn: () => T): T {
  const ref = React.useRef<T>()

  if (!ref.current) {
    if (cache.has(key)) {
      ref.current = cache.get(key)
    } else {
      ref.current = fn()
      cache.set(key, ref.current)
    }
  }

  if (!ref.current) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    throw new Promise((noop) => {})
  }

  return ref.current
}
