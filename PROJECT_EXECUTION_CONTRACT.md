# ShutterUpskal — Project Execution Contract

Status: IN PROGRESS. Source of truth for implementation and release decisions.
Last verified: 2026-10-12. Never mark a requirement complete solely because code was committed.

## Definition of done (ALL required)
- [ ] EF Ventures Labs / Ventura OS-branded Windows desktop app with original ShutterUpskal icon, Nexus-inspired navy/cyan/violet glass interface and functional settings.
- [ ] Single-image upscaling, batch multi-image selection (10–20 images), and folder processing verified in the installed Windows app.
- [ ] Correct application name, icon, publisher metadata where supported, and preserved Upscayl AGPL license/attribution. Unsigned test installer is acceptable; do not claim it prevents Windows SmartScreen warnings.
- [ ] Ventura OS shortcut opens dedicated ShutterUpskal installation page inside the deployed Nexus application.
- [ ] Nexus installation page displays correct branding, instructions, version and a durable Nexus-controlled installer delivery endpoint (not an expiring Actions artifact or a GitHub redirect).
- [ ] End-to-end verification: Ventura OS -> Nexus app page -> installer download -> Windows installation -> image/batch upscale -> settings; test results recorded.
- [ ] User approves any production deployment; no accidental overwrite of Lovable-hosted Nexus.

## Known state (2026-10-12)
- Windows GitHub Actions run 38276566593: SUCCESS; unsigned artifact shutterupskal-windows-unsigned-test-installer (603 MB, expires 2026-10-19). This verifies build/upload, NOT installation or processing.
- Desktop development branch: rlongin/upscayl feature/efv-glass-branding-installer-page, PR #2, base efv-shutterupskal. Renderer welcome screen, branding, CSS changes committed; visual and functional Windows testing pending.
- Nexus development branch: rlongin/efv-nexus-hub feature/shutterupskal-app-landing, PR #40, base main. Route /apps/shutterupskal and Ventura shortcut staged, NOT deployed. Download button waits for stable URL.
- Lovable-hosted Nexus and GitHub main differ. Do NOT assume merging GitHub PR updates production Lovable safely.
- No public release download link verified yet. Do not direct users to GitHub Actions as the intended end-user install experience.

## Non-negotiable constraints
- GitHub-first isolated branches and PRs; PowerShell for user-side Windows work. No Lovable bot/credit usage.
- Do not restart, disable, overwrite or destabilize Nexus, NexusRENN, EF Agent Council, Ollama, Docker, Cloudflared or other live services.
- No production merge/deploy without explicit user approval, rollback and compatibility checks.
- No signing purchase or certificate setup without explicit request.
- Preserve original Upscayl licensing and source notices.

## Execution protocol — read at start of EVERY session
1. Read this contract and current PRs/CI results BEFORE making changes.
2. Select the next incomplete end-to-end requirement, not a convenient unrelated subtask.
3. Implement in an isolated branch; run the applicable automated tests and inspect failures.
4. Record factual status and proof (commit, CI run, artifact, screenshots/manual test results) in this document. Separate BUILT, VERIFIED, DEPLOYED.
5. Continue within the active session until blocked or deliverable is verified; do not end after a minor commit and imply the project is finished.
6. Report precisely what was changed, what passed, what remains, and the one genuine blocker. Never invent manual Windows tests.
7. If blocked by permissions, release size, platform mismatch or absent installer testing, state the exact limitation and smallest safe next action.

## Immediate priority
1. Inspect Nexus PR #40 and its landing/shortcut integration.
2. Publish the Windows installer into Nexus-controlled storage/delivery and connect its Nexus download endpoint to the installation page; never redirect members to GitHub.
3. Verify build and end-to-end link behavior without modifying production.
4. Obtain approval before any production deployment; validate installed app on Windows.

## Acceptance evidence log
- 2026-10-12: Windows installer build succeeded: https://github.com/rlongin/upscayl/actions/runs/38276566593 . Artifact is temporary and unsigned.
- 2026-10-12: Nexus landing branch/PR: https://github.com/rlongin/efv-nexus-hub/pull/40 . Deployment unverified.

## Nexus distribution requirement (2026-10-12)
ALL EF Ventures downloads and installation experiences must be delivered from Nexus app download pages and Nexus-controlled delivery endpoints. Never direct users to GitHub Actions, GitHub Releases or GitHub-hosted assets for downloading/installing. GitHub may be used internally for builds and artifact ingestion only. Verify that the browser download does not redirect to GitHub. This applies platform-wide; see the Nexus repository execution contract.
