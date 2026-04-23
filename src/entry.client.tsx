import React, { StrictMode } from "react";
import { Hydrate, QueryClient, HydrationBoundary } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();

// Rehydrate from SSR
const initialData = (window as any).__INITIAL_DATA__ ?? {};
delete (window as any).__INITIAL_DATA__;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

// Use global queryClient from router context
const routerQueryClient = (router.options.context as { queryClient?: any }).queryClient ?? queryClient;

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <HydrationBoundary state={initialData}>
      <RouterProvider router={router} context={{ queryClient: routerQueryClient }} />
    </HydrationBoundary>
    <Toaster />
  </StrictMode>
);
