import { scopeThreadRef } from "@t3tools/client-runtime/environment";
import { squashAtomCommandFailure } from "@t3tools/client-runtime/state/runtime";
import { DEFAULT_SERVER_SETTINGS } from "@t3tools/contracts";
import { resolveProjectSettings } from "@t3tools/shared/projectSettings";
import { resolveNewThreadModelSelection } from "@t3tools/shared/usageLimits";
import { useNavigate } from "@tanstack/react-router";
import { RefreshCwIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { requestConfirmDialog } from "~/confirmDialog";
import { newMessageId, newThreadId } from "~/lib/utils";
import { resolveProjectDefaultProviderModelSelection } from "~/providerInstances";
import { appAtomRegistry } from "~/rpc/atomRegistry";
import { useProjects } from "~/state/entities";
import { usePrimaryEnvironmentId } from "~/state/environments";
import { environmentServerConfigsAtom } from "~/state/server";
import { threadEnvironment } from "~/state/threads";
import { useOrchestrationCommand } from "~/state/use-orchestration-command";
import { buildThreadRouteParams } from "~/threadRoutes";
import { toastManager } from "../ui/toast";

/** Upstream release tag this build was merged from, and the fork checkout it was built in. */
const UPSTREAM_BASE = import.meta.env.T3CODE_UPSTREAM_BASE;
const FORK_REPO_ROOT = import.meta.env.T3CODE_FORK_REPO_ROOT;
const LATEST_RELEASE_URL = "https://api.github.com/repos/pingdotgg/t3code/releases/latest";
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

function isNewerTag(candidate: string, base: string): boolean {
  const parse = (tag: string) => tag.replace(/^v/, "").split(".").map(Number);
  const [a, b] = [parse(candidate), parse(base)];
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const delta = (a[index] ?? 0) - (b[index] ?? 0);
    if (delta !== 0) return delta > 0;
  }
  return false;
}

/** Latest stable upstream tag when it is newer than this build's base, polled every 6 hours. */
function useNewerUpstreamRelease(): string | null {
  const [tag, setTag] = useState<string | null>(null);
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- polls GitHub for upstream releases
  useEffect(() => {
    if (!UPSTREAM_BASE) return;
    const check = () =>
      fetch(LATEST_RELEASE_URL)
        .then((response) => (response.ok ? response.json() : null))
        .then((release: { tag_name?: string } | null) => {
          const latest = release?.tag_name;
          setTag(latest && isNewerTag(latest, UPSTREAM_BASE) ? latest : null);
        })
        .catch(() => undefined);
    void check();
    const intervalId = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);
  return tag;
}

function syncPrompt(target: string): string {
  return [
    `Sync this Tabula Rasa fork with upstream T3 Code ${target}.`,
    `This build is based on ${UPSTREAM_BASE || "an unknown upstream tag"}.`,
    "Follow UPSTREAM_SYNC.md in the repo root exactly. Don't install or restart Tabula until I ask.",
  ].join("\n");
}

/**
 * Sidebar action that starts an agent thread in the fork checkout to merge upstream,
 * verify, push and rebuild; it installs the build only when asked. Marked when a newer upstream release exists.
 */
export function useUpstreamSync() {
  const navigate = useNavigate();
  const environmentId = usePrimaryEnvironmentId();
  const projects = useProjects();
  const startTurn = useOrchestrationCommand(threadEnvironment.startTurn, { reportFailure: false });
  const newerRelease = useNewerUpstreamRelease();
  const target = newerRelease ?? "latest stable release";

  const start = async () => {
    const project = projects.find(
      (candidate) =>
        candidate.environmentId === environmentId && candidate.workspaceRoot === FORK_REPO_ROOT,
    );
    if (environmentId === null || project === undefined) {
      toastManager.add({
        type: "error",
        title: "Fork checkout isn't a project",
        description: `Add ${FORK_REPO_ROOT} as a project, then try again.`,
      });
      return;
    }
    const confirmed = await requestConfirmDialog(
      `Sync Tabula with upstream ${target}?\nAn agent will merge upstream into main-custom, run checks, push and rebuild. Tabula restarts only when you tell the agent to.`,
    );
    if (!confirmed) return;

    const config = appAtomRegistry.get(environmentServerConfigsAtom).get(environmentId);
    const settings = config?.settings ?? DEFAULT_SERVER_SETTINGS;
    const providers = config?.providers ?? [];
    const projectSettings = resolveProjectSettings(settings, project.id, project).settings;
    const { selection: modelSelection } = resolveNewThreadModelSelection({
      defaultSelection:
        projectSettings.defaultModelSelection ??
        resolveProjectDefaultProviderModelSelection(providers, settings, project.id),
      fallbackSelection: settings.fallbackModelSelection ?? null,
      providers,
      settings,
      projectId: project.id,
      now: Date.now(),
    });
    if (modelSelection === null) {
      toastManager.add({ type: "error", title: "No model available to run the sync" });
      return;
    }

    const threadId = newThreadId();
    const title = `Sync with upstream ${target}`;
    const createdAt = new Date().toISOString();
    const modes = { runtimeMode: "full-access", interactionMode: "default" } as const;
    const result = await startTurn({
      environmentId,
      input: {
        threadId,
        message: {
          messageId: newMessageId(),
          role: "user",
          text: syncPrompt(target),
          attachments: [],
        },
        modelSelection,
        ...modes,
        bootstrap: {
          createThread: {
            projectId: project.id,
            title,
            modelSelection,
            ...modes,
            branch: null,
            worktreePath: null,
            createdAt,
          },
        },
        createdAt,
      },
    });
    if (result._tag === "Failure") {
      const error = squashAtomCommandFailure(result);
      toastManager.add({
        type: "error",
        title: "Couldn't start the sync agent",
        description: error instanceof Error ? error.message : String(error),
      });
      return;
    }
    await navigate({
      to: "/$environmentId/$threadId",
      params: buildThreadRouteParams(scopeThreadRef(environmentId, threadId)),
    });
  };

  return {
    label: newerRelease ? `Upstream ${newerRelease} available, sync` : "Sync with upstream",
    icon: (
      <span className="relative inline-flex">
        <RefreshCwIcon className="size-4" />
        {newerRelease ? (
          <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary" />
        ) : null}
      </span>
    ),
    start,
  };
}
