# Upstream sync playbook

Tabula Rasa is a personal fork of T3 Code (`pingdotgg/t3code`). Branch `main` tracks
upstream **stable tags** (`vX.Y.Z`), never `upstream/main`. Remote `upstream` is pingdotgg,
`origin` is the fork. The sidebar "Sync with upstream" button starts an agent on this file.

Run every command from the repo root with `mise exec -- corepack pnpm ...`.

## 1. Prepare

1. `git status` must be clean and the branch must be `main`. If not, stop and report.
2. `git fetch upstream --tags` and `git fetch origin`. Pull `origin/main` if it is ahead.
3. Pick the target: the tag named in the prompt, or else the newest `vX.Y.Z` tag with no suffix
   (`git tag -l 'v*' --sort=-v:refname | grep -vE -- '-' | head -1`).
4. If the target is already an ancestor of `HEAD` (`git merge-base --is-ancestor`), report
   "already up to date" and stop.

## 2. Merge

`git merge --no-ff <tag> -m "chore: merge upstream <tag>"`. Resolve conflicts by these rules:

- **Deleted on purpose, keep deleted** (take our side, `git rm` upstream re-additions):
  - Providers: everything except Claude and Codex. That covers `packages/provider-{cursor,grok,fx,kiro,muse,opencode,pi}`,
    their drivers, SDK deps, and patches.
  - `packages/secret-provider-onepassword`, 1Password settings UI.
  - Onboarding (`components/onboarding`, most of `apps/web/src/onboarding`), the GitHub star prompt.
  - Office previews (`files/office`, `OpenXmlOfficeViewer`, `@betteroffice/*`), 3D device models (`*.glb`).
  - If upstream adds a new agent provider, do not register it.
- **Fork changes, keep ours:** "Tabula Rasa" branding (app name, bundle id `dev.urjitc.tabularasa`,
  artifact name, icons from `assets/app-icon/icon.svg`), the sidebar header without logo, sidebar thread rows without PR badges or terminal icons, the
  `T3CODE_FEATURE_PULL_REQUESTS` gates, the upstream-sync button, `T3Wordmark`'s socket mark.
- **Everything else:** take upstream's version, then re-apply our small edit on top if one existed.
- **Database migrations:** take upstream's as-is. Never write a new migration in this fork.
- If a conflict doesn't fit a rule and the right answer isn't clear, stop and ask instead of guessing.

Upstream code that newly references deleted packages: remove that reference with the smallest
edit, the same way earlier removals did (empty registries, feature flags), rather than restoring the package.

## 3. Verify

1. `mise exec -- corepack pnpm install`
2. `mise exec -- corepack pnpm typecheck`, `lint`, `knip:check`. All must pass.
3. Web and server tests (`vp test` in `apps/web` and `apps/server`). The only known failure that
   is not ours: ServerBrowserPage tests when Playwright Chromium isn't installed. Report any other
   failure and stop before pushing.

For fork feature branches, run `vp run check:changed main` so it compares against the fork,
not upstream.

## 4. Push and build

1. `git push origin main`.
2. `mise exec -- corepack pnpm dist:desktop:dmg:arm64` (about 75 s).

## 5. Report, then wait to install

Do not install on your own. Post a short summary: target tag, conflicts and how each was resolved,
test results, and that the new build is ready. End by saying the user can reply "restart" when ready.

When the user asks to restart or install, run `scripts/install-tabula.sh`. It detaches, quits Tabula
(which ends this agent's session), installs the new build into `/Applications/Tabula Rasa.app`
and reopens it.

The installer signs the app with `scripts/sign-tabula.sh`, using the "Tabula Rasa Local Signing"
certificate in the login keychain (self-signed, identifier `dev.urjitc.tabularasa`). A stable
signature keeps the macOS permissions agents rely on (Accessibility, Screen Recording, Automation,
Full Disk Access) across rebuilds. If the certificate is missing, the installer says signing failed
and the permissions must be granted again. Recreate it per the comment in `scripts/sign-tabula.sh`.
