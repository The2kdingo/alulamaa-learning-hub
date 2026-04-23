import { renderToPipeableStream, renderToString } from "react-dom/server";
import { Hydrate, dehydrate } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

export async function render(url: string, context = {}) {
  const router = getRouter();

  // Prefetch and dehydrate queries
  await router.load();
  const dehydratedState = dehydrate((router.options.context as any).queryClient);

  // Handle SSR rendering with Hydrate
  const html = renderToString(
    <Hydrate state={dehydratedState}>
      <RouterProvider router={router} context={context} />
    </Hydrate>
  );

  return { 
    html,
    dehydratedState 
  };
}
