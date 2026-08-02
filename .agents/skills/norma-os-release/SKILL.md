---
name: norma-os-release
description: 发布或 release 新版 Norma OS macOS DMG 的端到端流程。Whenever the user asks to publish、发布、上传、重新发布、更新下载包或上线 a Norma OS version, use this skill to notarize and staple the DMG, create the GitHub Release, update the stable website download CTA, deploy the site, and verify every public artifact.
compatibility: macOS with Xcode command-line tools, GitHub CLI, pnpm, and valid Apple notarization credentials
---

# Norma OS Release

Publish a Norma OS DMG without exposing an unsigned build, breaking the stable website URL, or overwriting an existing release silently.

## Fixed release contract

- App source/build root: sibling project `../norma-ai-os` unless the user supplies another path.
- Website root: the project containing this skill.
- Release repository: `multisoul-ai/norma-os-releases`.
- Website repository: `multisoul-ai/norma-os-desktop-site`.
- Version tag: `v<VERSION>`, for example `v0.1.36`.
- Public asset name: `Norma-OS_aarch64.dmg`.
- Checksum asset: `Norma-OS_aarch64.dmg.sha256`.
- Stable website URL:
  `https://github.com/multisoul-ai/norma-os-releases/releases/latest/download/Norma-OS_aarch64.dmg`.

The release asset deliberately has no version in its filename. GitHub's `latest` redirect changes versions while the website URL remains stable.

## Inputs

Resolve these before mutating external state:

1. `VERSION`: three numeric components without a leading `v`, such as `0.1.36`.
2. `DMG_PATH`: default to `../norma-ai-os/build/Norma OS_<VERSION>_aarch64.dmg`.
3. Architecture: default to `aarch64`; stop if the filename and requested architecture disagree.
4. Whether the request authorizes publishing. “发布这个版本” authorizes release creation, upload, website commit, and normal production deployment. It does not authorize deleting or replacing an existing release with different bytes.

Show the resolved version, path, size, repositories, and stable URL before upload. Ask only when the version/path cannot be discovered safely or an existing release conflicts.

## Safety invariants

- Do not publish until Apple notarization is `Accepted`, the ticket is stapled, and Gatekeeper reports `Notarized Developer ID`.
- Compute the final SHA-256 after stapling because stapling changes the DMG bytes.
- Do not print Apple API keys, GitHub tokens, Vercel tokens, or credential-file contents.
- Do not use force push.
- Do not delete, replace, or upload over an existing release asset unless the user explicitly approves after seeing both hashes.
- Preserve unrelated dirty-worktree changes. Use an isolated clone when the current Git root contains unrelated edits, a subtree migration, or an ambiguous remote layout.
- Keep tests red-before-green for website copy and link changes.
- A failed Vercel deployment does not invalidate a successfully published DMG; report the two states separately.

## 1. Preflight

Read the active project instructions and inspect the working trees before changing anything.

```bash
git status --short
gh auth status
gh repo view multisoul-ai/norma-os-releases
gh repo view multisoul-ai/norma-os-desktop-site
stat -f 'size=%z bytes' "$DMG_PATH"
codesign --verify --strict --verbose=2 "$DMG_PATH"
```

Confirm the DMG is below GitHub's 2 GiB per-file Release limit. If it is too large, stop and discuss Cloudflare R2 or OSS; read `../../../docs/research/2026-07-18-free-download-hosting-options.md` for the project-specific comparison.

Mount the DMG read-only into a unique temporary directory, locate `Norma OS.app`, and validate the application deeply:

```bash
mount_dir=$(mktemp -d)
hdiutil attach -readonly -nobrowse -mountpoint "$mount_dir" "$DMG_PATH"
codesign --verify --deep --strict --verbose=2 "$mount_dir/Norma OS.app"
hdiutil detach "$mount_dir"
rmdir "$mount_dir"
```

Use a trap so the volume is detached on failure. Confirm the application identifier, Team ID, Developer ID origin, and hardened-runtime flag when diagnosing signature failures.

Check notarization credential availability without printing values:

- `APP_STORE_CONNECT_API_KEY_PATH` points to an existing key file.
- `APP_STORE_CONNECT_API_KEY_ID` is configured.
- `APP_STORE_CONNECT_API_ISSUER_ID` is configured.

Credentials may be loaded by the user's interactive zsh rather than the ordinary process environment.

## 2. Notarize and staple

First run `xcrun stapler validate "$DMG_PATH"`. If a valid ticket is already stapled, do not submit the same bytes again.

For an unstapled signed DMG, submit and wait:

```bash
zsh -ic 'xcrun notarytool submit "$1" \
  --key "$APP_STORE_CONNECT_API_KEY_PATH" \
  --key-id "$APP_STORE_CONNECT_API_KEY_ID" \
  --issuer "$APP_STORE_CONNECT_API_ISSUER_ID" \
  --wait' _ "$DMG_PATH"
```

Continue only when the returned status is `Accepted`. If Apple rejects the submission, retrieve the notary log for the submission ID, diagnose the signing problem, and stop publication.

Staple and run the bundled read-only verifier:

```bash
xcrun stapler staple "$DMG_PATH"
.agents/skills/norma-os-release/scripts/verify-release.sh "$VERSION" "$DMG_PATH"
```

The verifier checks the version shape, file size, code signature, stapled ticket, Gatekeeper assessment, and final SHA-256.

## 3. Prepare stable assets

Create the stable DMG beside the versioned build only after stapling. Prefer a hard link so the 300+ MB file is not duplicated. If the target exists, compare hashes and stop on any difference.

```bash
STABLE_DMG="$(dirname "$DMG_PATH")/Norma-OS_aarch64.dmg"
CHECKSUM_FILE="$STABLE_DMG.sha256"
ln "$DMG_PATH" "$STABLE_DMG"
shasum -a 256 "$STABLE_DMG"
```

Use `apply_patch` to create the checksum text file with exactly:

```text
<FINAL_SHA256>  Norma-OS_aarch64.dmg
```

Verify the stable DMG and versioned DMG have identical hashes before upload.

## 4. Publish GitHub Release

Use `gh` from `PATH`; on this Mac, `/opt/homebrew/bin/gh` is a known fallback. Confirm the authenticated account has active organization access.

If the public release repository does not exist and publishing was authorized, create it with an initialized `main` branch:

```bash
gh api -X POST orgs/multisoul-ai/repos \
  -f name=norma-os-releases \
  -f description='Official Norma OS release downloads' \
  -F private=false \
  -F auto_init=true
```

Before creating anything, query tag `v<VERSION>`. If it already exists, compare asset names, sizes, and GitHub-reported digests with the local files. Treat a mismatch as a conflict requiring user direction.

Create a new release:

```bash
gh release create "v$VERSION" \
  "$STABLE_DMG#Norma OS $VERSION for Apple Silicon" \
  "$CHECKSUM_FILE#SHA-256 checksum" \
  --repo multisoul-ai/norma-os-releases \
  --target main \
  --title "Norma OS $VERSION" \
  --notes "Norma OS $VERSION for Apple Silicon Macs. Signed with Developer ID, notarized by Apple, and shipped with a stapled notarization ticket. SHA-256: $FINAL_SHA256" \
  --latest
```

Do not call the release complete from the CLI exit code alone. Query the release API and verify:

- `draft=false` and `prerelease=false`.
- Asset name is `Norma-OS_aarch64.dmg`.
- Asset byte size equals the local file.
- Asset `digest` equals `sha256:<FINAL_SHA256>`.
- The stable latest URL returns an attachment with the expected byte length.

## 5. Update the website with TDD

The website must never contain a version-specific download URL.

1. Add or update `src/app/page.test.tsx` so both URL-localized routes positively assert the exact primary anchor and negatively reject the old `#product` primary anchor.
2. Positively assert the independently authored English and Chinese CTA copy from `src/app/site-content.ts`, and negatively reject the previous copy.
3. Run the focused tests and observe failure before implementation.
4. Update the stable URL in `src/app/site-constants.ts` and, only when copy changes, the English/Chinese content in `src/app/site-content.ts`.
5. Run the focused tests again, then run:

```bash
pnpm test
pnpm lint
pnpm build
```

Follow the repository's detailed test-comment and positive/negative assertion rules. Inspect the built HTML and confirm the primary CTA contains the stable latest URL and no legacy copy.

## 6. Commit and deploy safely

Review the exact four website files normally touched by this change:

- `src/app/site-constants.ts`
- `src/app/site-content.ts`
- `src/app/_components/marketing-page.tsx`
- `src/app/page.test.tsx`

If the surrounding Git worktree is clean and represents `multisoul-ai/norma-os-desktop-site`, commit normally. Otherwise clone the website repository into a validated temporary directory, apply only the reviewed changes, confirm those files match the tested workspace, run `git diff --check`, commit, and push without force.

Watch the `Publish` GitHub Actions run through tests, lint, build, and production deployment:

```bash
gh run list --repo multisoul-ai/norma-os-desktop-site --commit "$COMMIT_SHA"
gh run watch "$RUN_ID" --repo multisoul-ai/norma-os-desktop-site --exit-status
```

If the workflow reports an invalid `VERCEL_TOKEN`:

1. Confirm test, lint, and build steps succeeded; diagnose deploy separately.
2. Check local Vercel authentication with `vercel whoami` without displaying its token.
3. If the project is correctly linked and release authorization covers production deployment, deploy the already verified commit with `vercel pull`, `vercel build --prod`, and `vercel deploy --prebuilt --prod`.
4. Rotating the GitHub Actions secret changes shared credentials. Explain the scope and obtain explicit approval unless the user already authorized credential rotation.
5. Rerun the failed job and require a successful conclusion.

## 7. Final verification

Re-run the checks that prove user-visible behavior:

```bash
.agents/skills/norma-os-release/scripts/verify-release.sh "$VERSION" "$DMG_PATH"
gh api "repos/multisoul-ai/norma-os-releases/releases/tags/v$VERSION"
```

Fetch the production homepage and extract the primary anchor. Confirm the visible copy and stable URL, then confirm the old copy is absent.

In mainland networks, `vercel.app` may resolve to unrelated IP addresses and fail TLS. Distinguish local DNS interference from deployment failure by checking `vercel inspect`, the Actions result, and DNS answers. Do not claim the site is broken solely from one poisoned local request.

## Failure handling

- **Turbopack says Next.js package not found:** verify the website cwd, `node_modules`, package manager, lockfile, and stale dev process before changing application code.
- **Notary submission rejected:** fetch Apple's log, fix signing, rebuild if necessary, and restart from preflight. Never upload the rejected DMG.
- **Stapling changed the hash:** expected; discard the pre-staple hash and recompute.
- **Release or asset already exists:** compare digest and size. Never replace mismatched bytes silently.
- **Upload interrupted:** inspect the release and assets before retrying; avoid duplicate or partial assets.
- **GitHub asset exceeds 2 GiB:** stop and use the researched R2/OSS alternative only after agreeing on hosting and cost.
- **CI deploy fails after quality gates pass:** keep the release state and deploy state separate in the report.

## Completion report

Report:

- Version and Git tag.
- Release page and stable direct-download URL.
- Final byte size and SHA-256.
- Apple notarization, staple, Gatekeeper, and signature results.
- Website commit, Actions run, and production URL.
- Test, lint, build, online HTML, and download-header results.
- Any unresolved hosting, DNS, credential, or worktree issue.

Do not say “completed” while any required verification above is missing.
