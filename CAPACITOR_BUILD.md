# Building GSM Driving School as Native Apps

Capacitor is configured. Follow these steps on a computer with the required tools.

## App identity
- **App ID:** `com.gsmdrivingschool.app`
- **App name:** GSM Driving School
- **Web build folder:** `dist/client`

---

## One-time setup (any machine)

```bash
# 1. Clone your project locally (Lovable → GitHub → git clone)
git clone <your-repo-url>
cd <project-folder>
bun install

# 2. Build the web app
bun run build

# 3. Add native platforms (creates ios/ and android/ folders)
npx cap add android
npx cap add ios        # macOS only

# 4. Sync web build into native projects
npx cap sync
```

After any code change, re-run:
```bash
bun run build && npx cap sync
```

---

## Android (Google Play)

**Requirements:** Any OS · [Android Studio](https://developer.android.com/studio) · Google Play Developer account ($25 one-time)

```bash
npx cap open android
```

In Android Studio:
1. **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**
2. Create a new keystore (save the file + passwords — you'll need them for every future update)
3. Choose **release** build variant
4. Output: `android/app/release/app-release.aab`

Upload the `.aab` to [Play Console](https://play.google.com/console) → create app → Internal testing → Production.

---

## iOS (App Store) — macOS only

**Requirements:** macOS · [Xcode](https://apps.apple.com/app/xcode/id497799835) · Apple Developer Program ($99/year)

```bash
cd ios/App
pod install
cd ../..
npx cap open ios
```

In Xcode:
1. Select the **App** target → **Signing & Capabilities** → sign in with your Apple ID → pick your team
2. Change **Bundle Identifier** to `com.gsmdrivingschool.app` (already set) and bump **Version/Build** if needed
3. **Product → Archive** → **Distribute App → App Store Connect → Upload**
4. In [App Store Connect](https://appstoreconnect.apple.com): create the app, fill in screenshots, privacy policy, then submit for review

**Apple review tip:** Apps that are pure website wrappers get rejected under guideline 4.2. Your PWA already has offline caching and installable icons, which helps — but if rejected, we can add native push notifications or a native camera feature to strengthen the submission.

---

## Updating the app after publishing

For content/UI changes, the PWA auto-updates via the web view — users get changes without a store update.

For native config changes (icons, splash, plugins):
```bash
bun run build
npx cap sync
```
Then rebuild and re-upload the .aab / .ipa.

---

## Icons & splash screens

Install once:
```bash
bun add -d @capacitor/assets
```
Place a 1024×1024 icon at `resources/icon.png` and a 2732×2732 splash at `resources/splash.png`, then:
```bash
npx @capacitor/assets generate
```
This populates both Android and iOS icon/splash sets automatically.