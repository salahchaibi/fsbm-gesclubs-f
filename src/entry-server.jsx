import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

export function render(url, initialData = {}) {
  const previous = globalThis.__INITIAL_DATA__;
  globalThis.__INITIAL_DATA__ = initialData;

  try {
    return renderToString(
      <MemoryRouter initialEntries={[url]}>
        <App />
      </MemoryRouter>
    );
  } finally {
    globalThis.__INITIAL_DATA__ = previous;
  }
}
