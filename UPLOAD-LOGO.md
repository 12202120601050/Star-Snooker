# Add the exact logo

The site shows a vector stand-in until the real logo file is added. To use the
exact artwork, add your logo as **`public/images/logo.png`** (transparent PNG).

### Easiest way — GitHub web (no commands)
1. Open the repo: https://github.com/12202120601050/Star-Snooker
2. Go to the **`public/images`** folder.
3. **Add file → Upload files** → drag in your logo, **rename it `logo.png`**.
4. **Commit changes.** Vercel redeploys automatically — the real logo appears everywhere.

### Or locally
```bash
# put the file at: C:\Users\trupa\star-snooker\public\images\logo.png
cd C:\Users\trupa\star-snooker
git add public/images/logo.png
git commit -m "Add real logo"
git push
```

Tip: a square, transparent-background PNG (≥512×512) looks best.
