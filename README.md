# Rizky Bintang — Hugo Portfolio Starter

A custom Hugo portfolio starter with a corporate + minimalist visual direction.

## Requirements
- Hugo Extended (recommended)
- Git
- Visual Studio Code (or another code editor)

## Run locally
```powershell
hugo version
hugo server
```
Open the local URL shown in the terminal (usually http://localhost:1313).

## Before publishing
1. Edit `hugo.toml`: replace the email, LinkedIn URL, WhatsApp number, and baseURL.
2. Replace placeholder project cards with real work you are allowed to publish.
3. Add your CV and project images under `static/`.
4. Update your GitHub username and repository settings.

## GitHub Pages
1. Create a GitHub repository named `YOUR-USERNAME.github.io` for a personal site.
2. Set `baseURL` in `hugo.toml` to `https://YOUR-USERNAME.github.io/`.
3. Push this project to the `main` branch.
4. In repository Settings → Pages → Build and deployment, choose **GitHub Actions**.
5. The workflow in `.github/workflows/hugo.yaml` builds and deploys the site.

If you use a project repository instead (for example `portfolio`), the site URL will be `https://YOUR-USERNAME.github.io/portfolio/`; set `baseURL` accordingly.

## Content and privacy
Only publish project images, documents, and client information that you have permission to share. The initial project cards are placeholders, not claims of completed work.
