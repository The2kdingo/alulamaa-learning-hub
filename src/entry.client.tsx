import React, { StrictMode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();

const queryClient = (router.options.context as { queryClient?: any }).queryClient ?? undefined;

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <RouterProvider router={router} context={{ queryClient }} />
    <Toaster />
  </StrictMode>
);
