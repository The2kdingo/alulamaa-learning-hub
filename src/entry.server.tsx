import { renderToPipeableStream, renderToString } from "react-dom/server";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

export async function render(url: string, context = {}) {
  const router = getRouter();

  // Handle SSR rendering
  const html = renderToString(
    <RouterProvider router={router} context={context} urlPrefix="" />
  );

  return { html };
}
