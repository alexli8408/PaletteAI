# PaletteAI

**Generate beautiful, harmonized color palettes using AI.**

Describe a mood, enter a keyword, or upload an image — PaletteAI uses Azure OpenAI to create stunning color palettes instantly.

**Live Demo:** [paletteai.app](https://paletteai.app)

---

## Features

- **Keyword-Based Generation** — Enter a keyword like "sunset" or "neon" and get an AI-generated palette
- **Image Color Extraction** — Upload an image to extract a harmonized palette from it
- **Save & Manage** — Save palettes to your collection with Google authentication
- **Export Options** — Export palettes as CSS, JSON, or SVG
- **Palette Details** — View, rename, and delete saved palettes
- **Responsive Design** — Works seamlessly across desktop and mobile

---

## Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| **Framework**  | Next.js 16 (App Router)                |
| **Language**   | TypeScript                             |
| **Styling**    | CSS Modules + Custom Design System     |
| **AI**         | Azure OpenAI (GPT-4o)                  |
| **Database**   | MongoDB (Mongoose)                     |
| **Auth**       | NextAuth.js (Google OAuth)             |
| **Icons**      | Lucide React                           |
| **Hosting**    | Vercel                                 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Azure OpenAI resource
- Google OAuth credentials

### Environment Variables

Create a `.env.local` file:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_DEPLOYMENT=your_deployment_name

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
├── page.tsx              # Home — palette generation
├── saved/                # Saved palettes gallery
├── palette/[id]/         # Individual palette view
├── api/
│   ├── palettes/         # CRUD + generate + extract APIs
│   ├── auth/             # NextAuth endpoints
│   └── user/             # User endpoints
components/
├── Navbar.tsx            # Navigation bar
├── PaletteCard.tsx       # Palette card component
├── ColorSwatch.tsx       # Color swatch with copy
├── ExportModal.tsx       # Export dialog (CSS/JSON/SVG)
└── ImageDropzone.tsx     # Image upload dropzone
lib/
├── palette-utils.ts      # Color utilities
├── mongodb.ts            # Database connection
└── auth.ts               # Auth configuration
```

---

## License

This project is for educational purposes.
