import React from "react"
import { isServer } from "./helpers"

interface Theme {}

const ThemeContext = React.createContext<Theme | undefined>(undefined)

export function ThemeProvider({
  theme,
  ...rest
}: {
  theme: Theme
  children: React.ReactNode
}) {
  return <ThemeContext.Provider value={theme} {...rest} />
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}

export default function styled(
  type: keyof JSX.IntrinsicElements,
  newStyles:
    | React.CSSProperties
    | ((props: any, theme: any) => React.CSSProperties),
  queries = {},
) {
  return React.forwardRef<
    HTMLElement,
    { style: React.CSSProperties; children: React.ReactNode }
  >(({ style, ...rest }, ref) => {
    const theme = useTheme()

    const mediaStyles = Object.entries(queries).reduce(
      (current, [key, value]) => {
        return useMediaQuery(key)
          ? {
              ...current,
              ...(typeof value === "function" ? value(rest, theme) : value),
            }
          : current
      },
      {},
    )

    return React.createElement(type, {
      ...rest,
      style: {
        ...(typeof newStyles === "function"
          ? newStyles(rest, theme)
          : newStyles),
        ...style,
        ...mediaStyles,
      },
      ref,
    })
  })
}

function useMediaQuery(query: string) {
  // Keep track of the preference in state, start with the current match
  const [isMatch, setIsMatch] = React.useState(
    () => !isServer && window.matchMedia && window.matchMedia(query).matches,
  )

  // Watch for changes
  React.useEffect(() => {
    if (!window.matchMedia) {
      return
    }

    // Create a matcher
    const matcher = window.matchMedia(query)

    // Create our handler
    const onChange = ({ matches }: MediaQueryListEvent) => setIsMatch(matches)

    // Listen for changes
    matcher.addEventListener("change", onChange)

    return () => {
      // Stop listening for changes
      matcher.removeEventListener("change", onChange)
    }
  }, [isMatch, query, setIsMatch])

  return isMatch
}
