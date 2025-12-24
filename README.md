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

## License

MIT
