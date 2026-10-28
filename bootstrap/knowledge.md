# Confluence integration and TWG login

Use only for explicit knowledge configuration, never ordinary setup/update/Hooks. Bash installation supports macOS/Linux; explain other-platform limits without substituting sources.

## 1. Check or install

Check PATH first; only on command-not-found check .local/bin/twg (Windows: LOCALAPPDATA/Programs/twg/bin/twg.exe). Auth/permission/business errors never justify reinstalling.

If absent and within requested scope, explain the Atlassian download/execute and user CLI changes without sudo. Run the user-specified command through host approval:

```bash
curl -fsSL --retry 2 https://teamwork-graph.atlassian.com/cli/install | bash
```

Use pipefail; recheck the executable and twg help login. Download/network/nonexecutable failures stop with manual steps: no endless retry, changed URLs, policy bypass, or remote-audit claim. TWG is optional integration tooling, not an AIDLC installer/runtime.

## 2. User login

Have the user run these sequentially in their interactive terminal:

```bash
twg help describe login
twg login
```

Follow CLI prompts: authentication link, correct account/site, displayed consent, terminal completion. Use live help, never guessed callback/auth arguments. If needed, use the actual user executable path and installer-directed PATH changes.

Never auto-replace accounts with --force or use --no-verify. Cancellation, login failure, or wrong account/site stays pending. TWG stores credentials; never request them in chat or write to config/Git.

## 3. Verify read-only and save configuration

Use live twg help describe "confluence content get" / "confluence space get". Read only specified targets; verify IDs/site/space-parent/access. Ask for missing links; titles cannot identify targets. Save redacted status. 401/403 stops for login/permission repair, without elevation/write probes.

Merge confirmed knowledge.targets: id/provider/site/space_id/parent_page_id/types/transport=twg_cli. Config grants no publication/write access. Preserve old target adapters/authority, including missing transport.

Next, specify knowledge_publish targets, types, and create/update_owned scope in the work's first card. Publish directly only after valid authorization and knowledge-snapshot approval.
