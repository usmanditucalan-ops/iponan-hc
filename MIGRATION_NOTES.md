# Migration Notes — Barangay Iponan Health Clinic

> **Last updated**: 2026-02-14  
> **Migration**: Visual Studio → Antigravity

---

## Critical Version Constraints

| Package      | Version | Web        | Mobile     | Rule                                     |
| ------------ | ------- | ---------- | ---------- | ---------------------------------------- |
| React        | 19.2.4  | **19.2.4** | **19.2.4** | Forced to match Expo Router requirements |
| React DOM    | 19.2.4  | **19.2.4** | **19.2.4** | Matched to React                         |
| React Native | —       | —          | 0.81.5     | Pinned to Expo SDK 54 compatibility      |
| Expo SDK     | —       | —          | ~54.0.33   | DO NOT upgrade without full iOS re-test  |

## Expo SDK 54 — DO NOT TOUCH Zones

These files are locked to Expo SDK 54 compatibility. **Do not modify** without explicit human approval and a full iOS build test:

- `mobile/package.json` — all dependency versions
- `mobile/app.json` — native build configuration
- `mobile/metro.config.js` — Metro bundler (monorepo-aware)
- `mobile/babel.config.js` — NativeWind plugin config
- `mobile/tsconfig.json` — extends `expo/tsconfig.base`
- `mobile/ios/` and `mobile/android/` — native folders (if generated)

## Rule 1: Project-wide React 19.2.4 Alignment

**All workspaces (Web and Mobile) MUST remain on React 19.2.4.**

- Do NOT downgrade `react` or `react-dom` in any workspace.
- Root `overrides` MUST pin React to 19.2.4.
- Mobile `overrides` MUST also pin React to 19.2.4 to resolve local peer conflicts.

## Verification Commands

```bash
# Verify mobile gets React 18.3.1
npm ls react --workspace=mobile

# Verify web gets React 19.0.0
npm ls react --workspace=web

# Check Expo compatibility
cd mobile && npx expo doctor
```

## Files Cleaned During Migration (2026-02-14)

- 113 `tmpclaude-*-cwd` temp files (AI tool artifacts)
- `web/src/tailwind-built.css`, `web/src/test.css` (generated CSS)
- `web/src/App.tsx.bak` (backup file)
- `web/build_error.txt` (debug log)
- `.vscode/` directory (VS Code settings)
- Root `.expo/` (stale Expo cache)
- `mobile/.git/` (nested Git repo)
