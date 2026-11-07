import { createFileRoute, redirect } from "@tanstack/react-router";

// Tabula Rasa ships no secret providers, so this settings page is gone.
export const Route = createFileRoute("/_chat/settings/secrets")({
  beforeLoad: () => {
    throw redirect({ to: "/settings/general", replace: true });
  },
});
