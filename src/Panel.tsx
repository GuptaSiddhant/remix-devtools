import React from "react";
import {
  useMatches,
  useFetchers,
  useLocation,
  useParams,
  useTransition,
} from "@remix-run/react";
import Explorer from "./Explorer";
import { useSafeLayoutEffect, useSafeState } from "./hooks";

interface PanelProps {
  className?: string;
  style?: React.CSSProperties;
  setIsOpen: (isOpen: boolean) => void;
}

function Panel(props: PanelProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const { className, style } = props;
  const { handleDragEnd, handleDragStart } = useDrag(props, ref);
  const location = useLocation();
  const matches = useMatches();
  const fetchers = useFetchers();
  const params = useParams();
  const transition = useTransition();

  const loaderData =
    matches.find((match) => match.pathname === location.pathname)?.data ||
    matches.find((match) => match.pathname === location.pathname + "/")?.data;

  return (
    <div
      className={className}
      style={{ ...styles.panel, height: "600px", ...style }}
      ref={ref}
    >
      <div
        style={styles.drag}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
      />
      <div style={styles.title}>Remix Devtools</div>
      <div style={styles.explorers}>
        <Explorer
          style={styles.explorer}
          data={{ params, location, transition, loaderData }}
          label="Location"
        />
        <Explorer style={styles.explorer} data={matches} label="Matches" />
        <Explorer style={styles.explorer} data={fetchers} label="Fetchers" />
      </div>
    </div>
  );
}

export default React.forwardRef(Panel);

function useDrag(
  { setIsOpen }: PanelProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [isDragging, setIsDragging] = useSafeState(false);

  const handleDragStart: React.MouseEventHandler<HTMLDivElement> =
    React.useCallback((e) => {
      if (e.button !== 0) return; // Only allow left click for drag
      setIsDragging(true);
    }, []);

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const run = React.useCallback(
    (e: MouseEvent) => {
      const containerHeight = window.innerHeight - e.y;
      if (containerHeight < 100) {
        setIsOpen(false);
      } else {
        const container = typeof ref === "function" ? undefined : ref?.current;
        if (container) {
          container.style.height = `${containerHeight}px`;
        }
      }
    },
    [ref]
  );

  useSafeLayoutEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", run);
      document.addEventListener("mouseup", handleDragEnd);

      return () => {
        document.removeEventListener("mousemove", run);
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, run, handleDragStart, handleDragEnd]);

  return { handleDragEnd, handleDragStart };
}

const styles: Record<
  "panel" | "drag" | "explorers" | "explorer" | "title",
  React.CSSProperties
> = {
  panel: {
    position: "fixed",
    bottom: "0",
    right: "0",
    zIndex: "99998",
    width: "100%",
    minHeight: "50px",
    maxHeight: "90%",
    boxShadow: "0 0 20px rgba(0,0,0,.3)",
    borderTop: `1px solid #888`,
    background: "#000",
    overflow: "hidden",
    padding: "8px",
  },
  drag: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "4px",
    marginBottom: "-4px",
    cursor: "row-resize",
    zIndex: 100000,
  },
  explorers: {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "1fr",
    gap: "8px",
    height: "100%",
  },
  explorer: {
    flex: "1",
    borderRadius: "8px",
    background: `#1a1a1a`,
    height: "100%",
    overflow: "auto",
    fontSize: "0.9em",
  },
  title: {
    fontWeight: "bold",
  },
};
