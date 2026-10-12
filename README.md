My name is Solomon Kamara.

- Registration number: 2423982
- App name: SolomonPortfolio
- Phone: 0792405593
- Email: kamara164@gmail.com
- Verification code: MOB-A2-3982

## Purpose
An offline personal portfolio app for SWE 3409 Individual Assignment 2.

## Features
Home intro and role rotation, grouped skills and education, leadership timeline, freelance projects with a detail stack, validated profile editor, profile-photo and app-wide background-photo persistence in app document storage, AsyncStorage persistence and reset, About/release info, and standalone Android APK.

## Setup and run
```bash
npm install
npx expo start
```

The app uses Bricolage Grotesque and Figtree when available and falls back to system fonts if font loading fails. It works offline; external project URLs are labelled "online".

## EAS build (APK)
```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

## Release details (fill in)
- Full name: Solomon Kamara
- Registration number: 2423982
- Phone: 0792405593
- Email: kamara164@gmail.com
- Tested device:
- Android version:
- Final commit hash:
- Release link:
- APK link:

## Known limitations
- Optional project links need internet and are labelled "online".
