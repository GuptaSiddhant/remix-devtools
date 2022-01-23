import React from "react"

const space = 40

export default function Explorer({
  data,
  style,
  label,
}: {
  label?: string
  data: any
  style?: React.CSSProperties
}) {
  console.log(label, data)

  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        padding: "16px",
        ...style,
      }}
    >
      <Renderer data={data} level={0} defaultExpanded label={label} />
    </pre>
  )
}

interface RendererProps<T = any> {
  data: T
  level: number
  defaultExpanded?: boolean
  allExpanded?: boolean
  label?: string
}

function Renderer({ data, ...rest }: RendererProps) {
  const Element =
    data === null || typeof data !== "object" ? RenderLiteral : RenderObject

  return <Element data={data} defaultExpanded {...rest} />
}

function RenderObject({
  data,
  level,
  defaultExpanded,
  allExpanded,
  label,
}: RendererProps<{ [key: string]: any }>) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)

  if (typeof data !== "object") return null

  const isArray = Array.isArray(data)
  const keys = Object.keys(data)
  const count = keys.length

  const metaElement = count + (isArray ? " items" : " properties")
  const collapsedElement = isArray
    ? count === 0
      ? `[]`
      : `[ ${metaElement} ]`
    : count === 0
    ? `{}`
    : `{ ${metaElement} }`

  return expanded ? (
    <span>
      <ExpandButton onClick={() => setExpanded(false)} expanded>
        {label ? `${label} ` : ""}
        <span style={styles.meta}>{metaElement}</span>
      </ExpandButton>

      {Object.entries(data).map(([key, value], i) => (
        <div key={i} style={{ marginLeft: `${space}px` }}>
          <span style={styles.key}>{key}: </span>
          <Renderer data={value} level={level + 1} allExpanded={allExpanded} />
        </div>
      ))}
    </span>
  ) : (
    <ExpandButton onClick={() => setExpanded(true)}>
      {label ? `${label} ` : ""}
      <span style={styles.meta}>{collapsedElement}</span>
    </ExpandButton>
  )
}

function RenderLiteral({ data }: RendererProps): JSX.Element {
  const style = styles[typeof data]

  return (
    <span style={style}>
      {typeof data === "undefined" ? "undefined" : JSON.stringify(data)}
    </span>
  )
}

function ExpandButton({
  onClick,
  expanded,
  children,
}: {
  onClick: () => void
  expanded?: boolean
  children?: React.ReactNode
}): JSX.Element {
  return (
    <span
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={styles.arrow}
    >
      {expanded ? `↓` : `→`} {children}
    </span>
  )
}

const styles: Record<
  | "key"
  | "boolean"
  | "string"
  | "number"
  | "object"
  | "undefined"
  | "function"
  | "symbol"
  | "bigint"
  | "arrow"
  | "meta",
  React.CSSProperties
> = {
  key: { color: "#888" },
  object: { color: "#888" },
  meta: { color: "#666", fontSize: "0.9em" },
  undefined: { color: "#888" },
  function: { color: "#888" },
  boolean: { color: "#00f" },
  string: { color: "#0f0" },
  number: { color: "#f00" },
  bigint: { color: "#f00" },
  symbol: { color: "#fff" },
  arrow: { cursor: "pointer" },
}
