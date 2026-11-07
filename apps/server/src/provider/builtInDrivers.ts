import { ClaudeDriver, type ClaudeDriverEnv } from "./Drivers/ClaudeDriver.ts";
import { CodexDriver, type CodexDriverEnv } from "./Drivers/CodexDriver.ts";
import { PiDriver, type PiDriverEnv } from "@t3tools/provider-pi/server";
import type {
  AnyProviderDriver,
  ProviderUsageReaderEnv,
} from "@t3tools/provider-core/server/driver";

// Tabula Rasa ships only the agents it uses: Codex, Claude and Pi.
export type BuiltInDriversEnv = ClaudeDriverEnv | CodexDriverEnv | PiDriverEnv;

export const BUILT_IN_DRIVERS: ReadonlyArray<AnyProviderDriver<BuiltInDriversEnv>> = [
  CodexDriver,
  ClaudeDriver,
  PiDriver,
];

export type BuiltInUsageReadersEnv =
  | ProviderUsageReaderEnv<typeof ClaudeDriver>
  | ProviderUsageReaderEnv<typeof CodexDriver>
  | ProviderUsageReaderEnv<typeof PiDriver>;

/** Order matters: aggregation keeps the first duplicate record. */
export const BUILT_IN_USAGE_DRIVERS: ReadonlyArray<
  AnyProviderDriver<BuiltInDriversEnv, BuiltInUsageReadersEnv>
> = [ClaudeDriver, CodexDriver, PiDriver];
