import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { App } from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Store root reference on window to persist across HMR
declare global {
  interface Window {
    __appRoot?: Root;
  }
}

let root = window.__appRoot;

if (!root) {
  root = createRoot(rootElement);
  window.__appRoot = root;
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Handle HMR updates properly
if (import.meta.hot) {
  import.meta.hot.accept("./App", () => {
    const root = window.__appRoot;
    if (root) {
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }
  });
}
