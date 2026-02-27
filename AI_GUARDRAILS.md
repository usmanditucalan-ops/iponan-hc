# AI Guardrails — Barangay Iponan Health Clinic

> These rules apply to **all AI coding assistants** working on this repo.

## Rule 1: Mobile React Version is LOCKED

**Mobile workspace MUST remain on React 18.3.x.**

- Do NOT upgrade `react` or `react-dom` in `mobile/package.json`
- Root `overrides` MUST use the `$react` reference
- React 19 is currently incompatible with the Expo SDK 54 native bridge.

## Rule 2: Expo SDK Upgrades Require Human Approval

- Do NOT upgrade Expo SDK without explicit human instruction
- Do NOT modify `mobile/app.json`, `mobile/metro.config.js`, or `mobile/babel.config.js`
- Do NOT generate or modify `mobile/ios/` or `mobile/android/` native folders

## Rule 3: Verify Before Dependency Changes

Before any `npm install` that affects mobile:

```bash
npm ls react --workspace=mobile
# Must show: react@18.3.1
```

## Rule 4: No Silent Overrides

- Never add global `overrides` or `resolutions` without documenting in `MIGRATION_NOTES.md`
- Never modify root `package.json` dependency fields without checking impact on all 3 workspaces
