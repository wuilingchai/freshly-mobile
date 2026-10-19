# Freshly Mobile — Offline Expiry Tracker

A mobile-first Capacitor project based on Freshly. Includes offline inventory, a native SQLite database on iOS/Android, expiry countdown, category filters, CSV export, and browser-based product-label OCR with manual confirmation. **No account or hosted Java backend is needed for this offline edition.**

## Requirements
- Node.js 20+ and npm
- iOS: Mac, Xcode (current compatible version), Xcode command-line tools, CocoaPods if requested by Xcode/Capacitor
- Android: Android Studio and Android SDK

## Browser preview (free)
```bash
npm install
npm run dev
```
Open the localhost address shown by Vite. Browser mode saves to localStorage; **it is not SQLite in browser**.

## iPhone (free personal device testing)
```bash
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```
In Xcode, choose your team under Signing & Capabilities and run on an iPhone or simulator. For personal testing, a free Apple account can be used with provisioning limitations. Public App Store distribution requires a paid developer membership.

## Android
```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Photo OCR
Click **Scan product** and take/select a photo. First OCR use downloads Tesseract.js and English OCR data over the internet; a connection is needed. It runs on device and photos are not uploaded to our server. Verify name/category/expiry before saving. The OCR uses heuristic label selection and date patterns, not a product catalog. Some scans will fail.

## Data & architecture
- Native apps: `@capacitor-community/sqlite` stores products in local SQLite database `freshly_inventory`.
- Browser preview: localStorage fallback.
- Data is **device-local**: not shared with the previous Freshly Spring Boot app, and there is no account/cloud sync yet.
- No automatic notifications yet; expiry status updates when the app is opened.
- CSV export available for backups. Deleting app data can permanently delete records; back up first.

## Troubleshooting
- If you get `command not found: npm`, install Node.js first.
- If you get `xcodebuild` errors, install/open Xcode and accept the license.
- Run `npm run sync` after changing web files; native project requires `npx cap add ios` once.
- `@capacitor-community/sqlite` may require platform-specific setup and compatible native build tools; consult its README if native builds fail.

## Status
Source packaged, basic JavaScript syntax checked. **Dependencies and actual iOS/Android builds have not been run in this environment** (npm registry/Xcode unavailable). This is a mobile starter implementation, not an App Store-tested release.
