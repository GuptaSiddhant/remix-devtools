import React from "react"
import {
  isServer,
  scheduleMicrotask,
  getLocalStorage,
  setLocalStorage,
} from "./helpers"

export const useSafeLayoutEffect = isServer
  ? React.useEffect
  : React.useLayoutEffect

type Updater<T> = T | ((val: T | undefined) => T) | undefined
type Setter<T> = (updater: Updater<T>) => void

export function useLocalStorage<T extends string | number | boolean = any>(
  key: string,
  defaultValue: T | (() => T),
) {
  const [value, setValue] = React.useState<T | undefined>(undefined)

  React.useEffect(() => {
    const value = getLocalStorage<T>(key)
    if (value) {
      setValue(value)
    } else {
      setValue(
        typeof defaultValue === "function" ? defaultValue() : defaultValue,
      )
    }
  }, [key, defaultValue])

  const setter = React.useCallback(
    (updater: T | undefined | ((val: T | undefined) => T)) => {
      setValue((old) => {
        const newVal = typeof updater == "function" ? updater(old) : updater
        setLocalStorage(key, newVal)
        return newVal
      })
    },
    [key],
  )

  return [value, setter] as const
}

/**
 * This hook is a safe useState version which schedules state updates in microtasks
 * to prevent updating a component state while React is rendering different components
 * or when the component is not mounted anymore.
 */
export function useSafeState<T>(initialState: T) {
  const isMounted = useIsMounted()
  const [state, setState] = React.useState(initialState)

  const safeSetState = React.useCallback(
    (updater: Updater<T>) => {
      scheduleMicrotask(() => {
        if (isMounted())
          setState(typeof updater == "function" ? (updater as any)() : updater)
      })
    },
    [isMounted],
  )

  return [state, safeSetState] as const
}

export function useIsMounted() {
  const mountedRef = React.useRef(false)
  const isMounted = React.useCallback(() => mountedRef.current, [])

  useSafeLayoutEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return isMounted
}
