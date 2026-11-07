// Preload installs desktopBridge before web code runs, so module-load detection is reliable.
export const isElectron = typeof window !== "undefined" && window.desktopBridge !== undefined;

export const isSecretsFeatureEnabled = ["1", "true"].includes(
  import.meta.env.T3CODE_FEATURE_SECRETS?.trim().toLowerCase() ?? "",
);

/** Tabula Rasa hides pull request features unless T3CODE_FEATURE_PULL_REQUESTS is set. */
export const isPullRequestsFeatureEnabled = ["1", "true"].includes(
  import.meta.env.T3CODE_FEATURE_PULL_REQUESTS?.trim().toLowerCase() ?? "",
);
