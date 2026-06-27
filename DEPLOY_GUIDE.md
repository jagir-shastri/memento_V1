# 🚀 How to Deploy to GitHub Pages (No Blank Page)

If your app was showing a completely blank page on GitHub Pages, it was due to two common Vite deployment issues:
1. **Absolute vs. Relative Asset Paths**: By default, Vite builds assets using absolute root paths (e.g., `/assets/index.js`), which points to the top-level domain `https://<username>.github.io/` instead of your repository's subfolder `https://<username>.github.io/<repo-name>/`.
2. **Raw Code Deployment**: GitHub Pages serves static files. If you point it to your raw repository root, the browser tries to run `src/main.tsx` directly. Browsers cannot run TypeScript (.tsx) files natively, resulting in a blank page and a console error.

---

## 🛠️ What We Fixed & Added

1. **Vite Configuration**: We updated `vite.config.ts` to include `base: './'`. This forces Vite to generate relative asset paths, making the site load perfectly on any subdirectory or subfolder on GitHub Pages.
2. **Automated Deploy Script**: We installed the official `gh-pages` helper and added deployment commands to your `package.json`.

---

## 🏎️ Deploy in 1 Step

To compile your code and publish it to GitHub Pages automatically, run the following command in your terminal:

```bash
npm run deploy
```

### What this command does:
1. **Predeploy**: Automatically runs `npm run build` to compile your TypeScript and React files into a highly optimized, static `dist/` directory.
2. **Deploy**: Automatically takes the contents of the `dist/` directory, pushes it to a dedicated `gh-pages` branch on your GitHub repository, and hosts it instantly.

---

## ⚙️ Set GitHub Pages to use the `gh-pages` branch

Once you run `npm run deploy`, follow these steps on GitHub:

1. Open your repository on **GitHub**.
2. Go to **Settings** (the gear icon on the top right).
3. On the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
5. Under **Branch**, select `gh-pages` and folder `/ (root)`.
6. Click **Save**.

Within a minute, your React/Vite Photo Booth will be live, fully functional, and fully responsive at your GitHub Pages URL!
