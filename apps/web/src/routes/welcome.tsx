import { createFileRoute, redirect } from "@tanstack/react-router";

// Tabula Rasa drops the first-run wizard; old /welcome links land on home.
export const Route = createFileRoute("/welcome")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
