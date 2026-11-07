# Setup: accounts, share links and live sync

Without these steps the app runs in **local mode**, where everything stays on one device. To let people share tasks by link and see each other's ticks live, connect a free Firebase project:

## 1. Create the Firebase project (about 5 minutes, free Spark plan)
1. Go to https://console.firebase.google.com, choose **Add project** and follow the steps (Analytics is optional).
2. **Build → Authentication → Get started**. Enable **Google** and **Email/Password**.
3. **Build → Firestore Database → Create database**. Choose production mode and a region near your users.
4. **Project settings (gear icon) → Your apps → Web (`</>`)**. Register the app and copy the `firebaseConfig` object.
5. Copy [`js/firebase-config.example.js`](js/firebase-config.example.js) to `js/firebase-config.js` and paste those values in. `js/firebase-config.js` is git-ignored, so the keys stay off GitHub (they still ship to browsers on the live site; that is normal for Firebase).
6. Restrict the key: Google Cloud Console → APIs & Services → Credentials → your Browser key → **Application restrictions: Websites** (`https://<project>.web.app/*`, `https://<project>.firebaseapp.com/*`, `http://localhost:5500/*`) and **API restrictions** limited to the Firebase APIs the app uses (Identity Toolkit, Token Service, Cloud Firestore, Firebase Installations).

## 2. Publish the security rules
These rules enforce **Private** vs **Shared via link**:
- **Private:** only the owner can read or write the task.
- **Shared via link:** anyone signed in who has the link can view the task, add it, and update its progress.

Either:
- paste the contents of [`firestore.rules`](firestore.rules) into **Firestore → Rules → Publish**, or
- run `npm i -g firebase-tools && firebase login && firebase use --add && firebase deploy --only firestore:rules`

## 3. Host it (share links must point at a real URL)
`firebase deploy --only hosting` gives you `https://<project>.web.app`. Any static host works (GitHub Pages, Netlify, Vercel).
Then add that domain under **Authentication → Settings → Authorized domains**. `localhost` is already there.

## 4. Make links open the Android app
If your APK is a Trusted Web Activity (Bubblewrap / PWABuilder) pointing at the hosted URL, add the
`/.well-known/assetlinks.json` file your packaging tool generates. Android will then open `https://<your-domain>/?share=…`
links directly in the installed app. Without the app installed, the same link opens in the browser.

## How sharing works
- When you create or edit a task, pick **Private** or **Shared via link**.
- On a shared task, tap the **share** icon and choose **Send link** (or **Copy**).
- When the other person opens the link, they sign in, see a preview and tap **Add to my tasks**.
- Ticking the task done, starting it, checking subtasks and adding attachments all sync live to everyone on the task. The Activity tab shows who did what.
- Switching a task back to **Private** removes everyone else's access straight away, and the link stops working.

## Run locally
Run `python -m http.server 5500` in this folder, then open http://localhost:5500. ES modules don't load from `file://`.
