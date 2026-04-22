/**
 * @type {import('vite/client').UserConfig}
 */
import React, { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { Toaster } from "@/components/ui/sonner";

const router = getRouter();

const queryClient = router.options.context.queryClient ?? undefined;

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <RouterProvider router={router} context={{ queryClient }} />
    <Toaster />
  </StrictMode>
);
