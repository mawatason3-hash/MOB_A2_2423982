# Test Log

Record the actual device, date, Android version, and result before submission. Do not mark a manual test as passed until it has been run on the target APK.

## Development checks

| Check | Result | Notes |
|---|---|---|
| `npx tsc --noEmit` final redesign check | Passed | Completed after implementing the requested screens, navigation and persistence changes. |
| `npx expo start -c` | Passed with port override | Port 8081 was occupied by an existing process; started on 8082 and confirmed Metro `/status` returned HTTP 200. |
| `npx expo install --check` | Passed | Expo SDK package versions are compatible after adding web, SVG and font dependencies. |
| `npx expo export --platform web` | Passed | Web bundle exported to `dist` after the redesign. |
| `npx expo export --platform android` | Passed | Android JS bundle exported to `dist`; this is not an EAS APK build. |
| `npx tsc --noEmit` after profile/background photo changes | Passed | Profile photo headers, background-photo picker/storage, and screen backdrop type-check successfully. |
| `npx expo export --platform android` after profile/background photo changes | Passed | Android bundle exported successfully. |
| `npx expo export --platform web` after profile/background photo changes | Passed | Web bundle exported successfully; this is the final `dist` output. |
| `npx expo-doctor` | Blocked | 20 checks completed; Expo's remote app-config schema check failed because the network connection could not establish TLS. |

## Physical-device APK checks

| Check | Result | Device / notes |
|---|---|---|
| Install and launch standalone APK without Expo Go | Pending | |
| Open Home, Skills, Leadership, Projects, Edit profile, and About tabs | Pending | |
| Open a project detail; Android Back returns to Projects list with search/filter preserved | Pending | |
| Save with invalid profile fields; verify save is blocked and field messages appear | Pending | |
| Save a valid profile; fully close/restart app and verify profile persists | Pending | |
| Deny camera permission; verify safe message | Pending | |
| Cancel camera capture; verify safe message and unchanged photo | Pending | |
| Deny gallery permission; verify safe message | Pending | |
| Cancel gallery selection; verify safe message and unchanged photo | Pending | |
| Select photo, save profile, fully restart; verify photo persists | Pending | |
| Select and save a background photo; verify it appears across screens and persists after restart | Pending | |
| Reset profile and verify defaults are restored | Pending | |
| Enable maximum system font size; verify all screens remain readable | Pending | |
| Enable Airplane Mode; verify app remains usable and online links are clearly labelled | Pending | |
| Verify reduced-motion setting shows final UI without animations | Pending | |
| Build standalone APK with `eas build -p android --profile preview` | Pending | |

## Device details

- Test date:
- Device model:
- Android version:
- APK version:
- EAS build URL:
