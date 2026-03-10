# Threshold

A curated discovery platform for architecturally significant homes.

## Deploy to Vercel in 5 steps

### Step 1 — Install Node.js
If you don't have it: https://nodejs.org — download and install the LTS version.

### Step 2 — Set up the project
Open Terminal (Mac: CMD+Space, type Terminal).

```bash
cd ~/Downloads/threshold
npm install
```

### Step 3 — Add your Anthropic API key
Create a file called `.env.local` in the threshold folder:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your key at: https://console.anthropic.com

### Step 4 — Test locally
```bash
npm run dev
```
Open http://localhost:3000 — you should see Threshold running with a working Insight Bar.

### Step 5 — Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Follow the prompts (it will ask you to log in / create an account).

When it asks "Want to override the settings?" — say No.

Then add your API key to Vercel:
1. Go to vercel.com → your project → Settings → Environment Variables
2. Add: `ANTHROPIC_API_KEY` = your key
3. Redeploy: `vercel --prod`

Your site is live. Connect threshold.estate in Vercel → Settings → Domains.

---

## Project structure

```
threshold/
├── app/
│   ├── layout.js          # fonts, metadata
│   ├── page.js            # root page, handles navigation
│   └── api/ask/route.js   # Anthropic API route (server-side, key never exposed)
├── components/
│   ├── HomePage.js        # dark hero, drifting grid, search, filter, cards
│   ├── PropertyPage.js    # editorial layout, image gallery, details
│   ├── InsightBar.js      # AI question bar
│   ├── VerifiedModal.js   # buyer verification form
│   ├── PropertyCard.js    # card with hover state
│   ├── DriftingGrid.js    # canvas animation
│   ├── RotatingPlaceholder.js
│   └── ThresholdMark.js   # SVG logo mark
├── lib/
│   └── properties.js      # all property data
└── .env.local             # YOUR API KEY (never commit this)
```

## Adding a new property

Open `lib/properties.js` and add a new object to the PROPERTIES array following the existing format. The property will automatically appear in the grid, filters, and Insight Bar.
