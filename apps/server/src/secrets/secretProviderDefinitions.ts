import { builtInSecretProviderDefinitions } from "@t3tools/secret-provider-definitions/registry";

/** In the shared registry's order. Tabula Rasa ships none. */
export const BUILT_IN_SECRET_PROVIDER_DRIVER_LIST = [] as const;

export const secretProviderDefinitions = builtInSecretProviderDefinitions;
