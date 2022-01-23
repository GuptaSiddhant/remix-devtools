export const isServer = typeof window === "undefined"

/**
 * Schedules a microtask.
 * This can be useful to schedule state updates after rendering.
 */
export function scheduleMicrotask(callback: () => void) {
  Promise.resolve()
    .then(callback)
    .catch((error) =>
      setTimeout(() => {
        throw error
      }),
    )
}

export function setLocalStorage<T>(key: string, value: T) {
  if (isServer) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function getLocalStorage<T>(key: string): T | undefined {
  if (isServer) return
  const value = localStorage.getItem(key)

  if (value) {
    try {
      return JSON.parse(value)
    } catch {
      return undefined
    }
  }
}
