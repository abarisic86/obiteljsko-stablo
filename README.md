# Obiteljsko Stablo

A mobile-friendly family tree web application built with React and TypeScript. Displays a zoomable, pannable horizontal family tree with support for 4+ generations and 36+ cousins.

## Features

- 📱 **Mobile-optimized**: Touch gestures for zoom and pan
- 🔍 **Zoomable**: Pinch-to-zoom and zoom controls
- 👥 **Multi-generation support**: Handles 4+ generations
- 📊 **Google Sheets integration**: Data sourced from public Google Sheets
- 🎨 **Responsive design**: Adapts to different screen sizes
- ⚡ **Performance optimized**: React.memo and efficient rendering

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Google Sheets URL in `src/App.tsx`:
   - Replace `YOUR_SHEET_ID` with your actual Google Sheets ID
   - Or update the `GOOGLE_SHEETS_URL` constant with your CSV export URL

### Google Sheets Setup

Your Google Sheet should have the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | P001 |
| name | Full name | Ivan Barišić |
| birthdate | Date of birth | 1990-05-15 |
| photo_url | URL to photo | https://... |
| parent_id | ID of one parent | P000 |
| spouse_id | ID of spouse (optional) | P002 |
| location | Current city/country | Zagreb, Hrvatska |
| contact | Email or phone | ivan@example.com |
| generation | Generation number (0=oldest) | 0 |

**To make the sheet public:**
1. Open your Google Sheet
2. File > Share > Publish to web
3. Select "Comma-separated values (.csv)"
4. Copy the generated URL
5. Paste it in `src/App.tsx` as `GOOGLE_SHEETS_URL`

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

- **Zoom**: Pinch-to-zoom on mobile, scroll wheel on desktop, or use +/- buttons
- **Pan**: Drag to move around the tree
- **View details**: Tap/click on any person card to see full information
- **Reset**: Use the reset button (circular arrow) to return to initial view

## Project Structure

```
src/
├── components/
│   ├── FamilyTree.tsx        # Main tree container
│   ├── GenerationColumn.tsx  # Generation column component
│   ├── PersonCard.tsx        # Individual person card
│   ├── PersonDetailModal.tsx # Person detail modal
│   ├── ConnectionLines.tsx   # SVG connection lines
│   └── ZoomControls.tsx     # Zoom control buttons
├── hooks/
│   ├── useFamilyData.ts      # Data fetching hook
│   └── useTreeLayout.ts      # Tree layout calculation
├── types/
│   └── family.ts             # TypeScript types
└── utils/
    ├── parseSheetData.ts     # CSV parsing
    └── buildTreeStructure.ts # Tree building logic
```

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- react-zoom-pan-pinch
- papaparse

## Deployment

### Vercel (Preporučeno - Besplatno)

Vercel je najjednostavnija opcija za deploy React/Vite aplikacija:

1. **Instaliraj Vercel CLI** (opcionalno, možeš i preko web sučelja):
```bash
npm i -g vercel
```

2. **Deploy preko CLI**:
```bash
# U root direktoriju projekta
vercel
```
Slijedi upute - prvi put će te pitati za login i konfiguraciju.

3. **Ili deploy preko GitHub**:
   - Pushaj kod na GitHub
   - Idi na [vercel.com](https://vercel.com)
   - Klikni "New Project"
   - Poveži GitHub repo
   - Vercel će automatski detektirati Vite i konfigurirati build
   - Klikni "Deploy"

**Build Settings** (Vercel automatski detektira, ali možeš provjeriti):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Nakon deploya, aplikacija će biti dostupna na URL-u poput: `https://obiteljsko-stablo.vercel.app`

#### Automatski Deploy s GitHub Actions

Ako želiš automatski deploy svaki put kad pushaš na `main` branch, postavi GitHub Actions:

1. **Prvo deployaj jednom preko Vercel dashboarda** (korak 3 gore) - ovo će kreirati Vercel projekt

2. **Dohvati Vercel credentials**:
   - Idi na [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Kreiraj novi token i kopiraj ga
   - Idi na svoj projekt na Vercel dashboardu
   - U Settings → General, kopiraj **Org ID** i **Project ID**

3. **Dodaj GitHub Secrets**:
   - Idi na GitHub repo → Settings → Secrets and variables → Actions
   - Dodaj tri secrets:
     - `VERCEL_TOKEN` - token koji si kopirao
     - `VERCEL_ORG_ID` - Org ID iz Vercel projekta
     - `VERCEL_PROJECT_ID` - Project ID iz Vercel projekta

4. **Pushaj kod** - GitHub Actions workflow (`.github/workflows/deploy.yml`) će automatski deployati na svaki push na `main` branch

**Napomena**: Workflow je već konfiguriran u projektu, samo trebaš dodati secrets!

### Netlify (Alternativa - Besplatno)

1. Pushaj kod na GitHub
2. Idi na [netlify.com](https://netlify.com)
3. Klikni "Add new site" > "Import an existing project"
4. Poveži GitHub repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Klikni "Deploy site"

### GitHub Pages

Za GitHub Pages, trebaš malo više konfiguracije:
1. Dodaj `base` u `vite.config.ts`: `base: '/obiteljsko-stablo/'` (zamijeni s imenom repo-a)
2. Instaliraj `gh-pages`: `npm install --save-dev gh-pages`
3. Dodaj script u `package.json`: `"deploy": "npm run build && gh-pages -d dist"`
4. Pokreni: `npm run deploy`

## License

MIT
