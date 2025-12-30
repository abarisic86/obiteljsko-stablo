# Obiteljsko Stablo

A mobile-friendly family tree web application built with React and TypeScript. Displays a zoomable, pannable horizontal family tree with support for multiple generations, featuring interactive search, detailed person profiles, family statistics, upcoming events calendar, and an interactive quiz.

## Features

- 📱 **Mobile-optimized**: Touch gestures for zoom and pan, responsive design
- 🔍 **Search functionality**: Quick search with keyboard navigation and auto-scroll to selected person
- 🔎 **Zoomable & pannable**: Pinch-to-zoom, scroll wheel, or zoom controls with reset functionality
- 👥 **Multi-generation support**: Handles complex family trees with multiple generations
- 📊 **CSV data integration**: Supports Google Sheets CSV export or local CSV files with fallback support
- 🎨 **Person detail modal**: View photos, birthdates, addresses, phone numbers, spouse, parent, and children
- 📅 **Upcoming events**: Calendar view showing upcoming birthdays and death anniversaries
- 📈 **Family statistics**: View family stats including oldest/youngest living members, photo coverage, and more
- 🎯 **Interactive quiz**: Test your knowledge with birth year and person identification questions
- ✝️ **Deceased member support**: Properly displays deceased family members with death dates
- ⚡ **Performance optimized**: React.memo and efficient rendering for smooth interactions

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure data source in `src/App.tsx`:

The app supports two data sources:

- **Primary URL**: Google Sheets CSV export URL (optional)
- **Fallback URL**: Local CSV file in the `public` directory (default: `/real-data.csv`)

Currently configured to use local CSV data. To use Google Sheets:

```typescript
const { tree, people, loading, error } = useFamilyData({
  primaryUrl: "YOUR_GOOGLE_SHEETS_CSV_URL", // Optional
  fallbackUrl: "/real-data.csv", // Fallback if primary fails
});
```

### Google Sheets Setup

Your Google Sheet should have the following columns:

| Column         | Description                          | Example          |
| -------------- | ------------------------------------ | ---------------- |
| id             | Unique identifier                    | P001             |
| name           | Full name                            | Ivan Barišić     |
| birthdate      | Date of birth (YYYY-MM-DD)           | 1990-05-15       |
| photo_url      | URL to photo                         | https://...      |
| parent_id      | ID of one parent (optional)          | P000             |
| spouse_id      | ID of spouse (optional)              | P002             |
| street_address | Street address                       | Ulica 123        |
| phone_number   | Phone number                         | +385 123 456 789 |
| deceased_date  | Date of death (YYYY-MM-DD, optional) | 2020-03-20       |
| generation     | Generation number (0=oldest)         | 0                |

**To make the sheet public:**

1. Open your Google Sheet
2. File > Share > Publish to web
3. Select "Comma-separated values (.csv)"
4. Copy the generated URL
5. Update `src/App.tsx` with the URL as `primaryUrl`

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Usage

### Navigation

- **Zoom**:
  - Mobile: Pinch-to-zoom gesture
  - Desktop: Scroll wheel or use +/- buttons
  - Double-click to zoom in
- **Pan**: Drag to move around the tree
- **Reset**: Use the reset button (circular arrow) to return to initial view

### Search

- Click the search bar at the top
- Type a person's name (case-insensitive)
- Use arrow keys to navigate results
- Press Enter to select, Escape to close
- Selected person will automatically scroll into view

### Person Details

- Click/tap any person card to open detail modal
- View photo, birthdate, address, phone number
- See spouse information (if available)
- Navigate to parent or children by clicking their cards
- Birthday indicator (🎂) shows for upcoming birthdays (within 7 days)

### Additional Features

- **Quiz**: Click the quiz button (bottom controls) to test your knowledge of family members' birth years
- **Upcoming Events**: View upcoming birthdays and death anniversaries (next 10 events)
- **Statistics**: View family statistics including:
  - Total number of people
  - Oldest and youngest living members
  - Percentage of people with photos, addresses, phone numbers
  - Spouse statistics

## Project Structure

```
src/
├── components/
│   ├── FamilyTree.tsx              # Main tree container with zoom/pan
│   ├── GenerationColumn.tsx        # Generation column component
│   ├── PersonCard.tsx              # Individual person card display
│   ├── PersonDetailModal/         # Person detail modal components
│   │   ├── index.tsx              # Main modal component
│   │   ├── PersonPhoto.tsx        # Photo display
│   │   ├── PersonInfoSection.tsx  # Info display
│   │   ├── SpouseCard.tsx         # Spouse card
│   │   └── FamilyLinks.tsx        # Parent/children navigation
│   ├── QuizModal/                  # Quiz feature
│   │   ├── index.tsx             # Quiz modal
│   │   ├── QuestionCard.tsx      # Question display
│   │   └── ResultScreen.tsx      # Results display
│   ├── SearchBar.tsx               # Search functionality
│   ├── StatisticsModal.tsx         # Family statistics
│   ├── UpcomingEventsModal.tsx     # Calendar events
│   ├── ConnectionLines.tsx        # SVG connection lines between family members
│   └── ZoomControls.tsx           # Zoom control buttons
├── hooks/
│   ├── useFamilyData.ts            # Data fetching and parsing hook
│   ├── useTreeLayout.ts            # Tree layout calculation
│   └── useQuiz.ts                  # Quiz logic and state management
├── types/
│   └── family.ts                   # TypeScript type definitions
└── utils/
    ├── parseSheetData.ts           # CSV parsing with error handling
    ├── buildTreeStructure.ts       # Tree structure building logic
    ├── personUtils.ts              # Person utilities (date formatting, events)
    └── calendarUtils.ts            # Calendar-related utilities
```

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **react-zoom-pan-pinch** - Zoom and pan functionality
- **papaparse** - CSV parsing

## Data Format

The application expects CSV data with the following structure:

```csv
id,name,birthdate,photo_url,parent_id,spouse_id,street_address,phone_number,deceased_date,generation
P001,Ivan Barišić,1990-05-15,https://...,P000,P002,Ulica 123,+385 123 456 789,,0
```

- Empty fields are allowed (except `id` and `name`)
- Dates should be in `YYYY-MM-DD` format
- The parser handles common CSV issues (commas in addresses, etc.)

## Deployment

**Note**: We plan to add the custom domain `barisic.family` for this project.

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

   **VERCEL_TOKEN:**

   - Idi na [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Klikni "Create Token"
   - Daj mu ime (npr. "GitHub Actions")
   - Kopiraj token (prikazuje se samo jednom!)

   **VERCEL_ORG_ID i VERCEL_PROJECT_ID:**

   - Idi na [vercel.com/dashboard](https://vercel.com/dashboard)
   - Klikni na svoj projekt
   - Idi na **Settings** tab (lijevo u meniju)
   - U **General** sekciji, scrollaj dolje
   - Nađi **"Organization ID"** - to je tvoj `VERCEL_ORG_ID`
   - Nađi **"Project ID"** - to je tvoj `VERCEL_PROJECT_ID`

   **Alternativno - preko API:**

   - Ako ne vidiš ID-ove u Settings, možeš ih dobiti preko Vercel API:
   - `VERCEL_ORG_ID`: Idi na [vercel.com/account](https://vercel.com/account) → "General" → "Team ID" (ako si solo, to je tvoj User ID)
   - `VERCEL_PROJECT_ID`: U URL-u projekta na Vercel dashboardu, ili u Settings → General

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
