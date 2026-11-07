import { makeSecretProviderDefinitionRegistry } from "@t3tools/secret-provider-core/shared/definition";

// Tabula Rasa ships no secret providers (upstream's only one was 1Password).
export const builtInSecretProviderDefinitions = makeSecretProviderDefinitionRegistry([]);
