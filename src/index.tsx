import React from "react";
import { useLocalStorage, useSafeLayoutEffect } from "./hooks";
import Panel from "./Panel";
import { ThemeProvider } from "./styled";

export interface RemixDevtoolsProps {
  initialIsOpen?: boolean;
  panelProps?: {};
  closeButtonProps?: {};
  toggleButtonProps?: {};
  position?: `${"bottom" | "top"}-${"left" | "right"}`;
}

export function RemixDevtools(props: RemixDevtoolsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { initialIsOpen = false } = props;
  const [isOpen, setIsOpen] = useLocalStorage<boolean>(
    "remixDevtoolsOpen",
    initialIsOpen
  );

  useSafeLayoutEffect(() => {
    const parentElement = window.document.body;
    if (isOpen && parentElement) {
      const previousValue = parentElement.style.marginBottom;

      const run = () => {
        const containerHeight =
          panelRef.current?.getBoundingClientRect().height;
        parentElement.style.marginBottom = `${containerHeight}px`;
      };

      window.addEventListener("resize", run);
      run();

      return () => {
        window.removeEventListener("resize", run);
        parentElement.style.marginBottom = previousValue;
      };
    }
  }, [isOpen]);

  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return (
    <ThemeProvider theme={{}}>
      <div ref={rootRef} className="RemixDevtools" style={styles.root}>
        <button
          style={styles.button}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span>{isOpen ? "Close" : "Remix Devtools"}</span>
        </button>
        {isOpen ? (
          <Panel
            className="RemixDevtools__panel"
            ref={panelRef}
            style={styles.panel}
            setIsOpen={setIsOpen}
          />
        ) : null}
      </div>
    </ThemeProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
  },
  button: {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    background: "#4a4a4a",
    color: "#eeeeee",
    borderRadius: "4px",
    zIndex: "99999",
    padding: "4px 8px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
  },
};
