# Incentive PDF Tool

A web version of the Incentive PDF Tool: upload an Excel workbook, review the results,
then preview and download a PDF breakdown for every RM.

## Flow

1. **Upload** (`/`): drop or select an `.xlsx` with `RMs` and `Deals` sheets.
2. **Validation** (`/validate`): row counts plus any errors or warnings.
3. **Preview** (`/preview`): search and filter recipients, see each PDF, copy its HTML or
   plain text, and download a single PDF.
4. **Export** (`/export`): download every PDF as one ZIP, or the raw HTML files.

## Two ways to generate PDFs

Both are available on the site so they can be compared.

| Option | Where it runs | How |
|---|---|---|
| **Browser** | The visitor's browser | The HTML template is drawn to a canvas with `html2canvas`, then sliced into `jsPDF` pages. Image based. |
| **Server** | The ASP.NET Core backend | [QuestPDF](https://www.questpdf.com) redraws the same template with the same wording and colours. Real text PDFs, faster for large batches. |

The server version is `POST /api/pdf/single` (one RM) and `POST /api/pdf/zip` (an array of
RMs). Both take the same RM objects the frontend already holds (RM fields plus the
calculation results), so no calculation logic is duplicated in C#. The renderer is in
[backend/Pdf/Renderer.cs](backend/Pdf/Renderer.cs); fonts (Inter and JetBrains Mono, both
SIL OFL) are in `backend/Pdf/fonts`.

Rough numbers on a laptop: 500 RMs takes about 34 seconds on the server and produces a
ZIP of about 90 MB (each PDF embeds its fonts).

## Where the calculation lives

The validation, calculation and HTML template code is in
[frontend/src/lib/engine.js](frontend/src/lib/engine.js), a plain JavaScript file copied
from the original single-file tool. The only edits made to it are replacing em dashes with
hyphens in text that appears in the PDF. The backend's Excel job is to turn the upload into
raw row objects ([backend/Excel/ExcelSheetReader.cs](backend/Excel/ExcelSheetReader.cs)).

## Project structure

```
/frontend    React + TypeScript (Vite)
/backend     ASP.NET Core (.NET 8) Web API: Excel upload and QuestPDF generation
```

## Local development

Backend:
```bash
cd backend
dotnet run --urls http://localhost:5080
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL, defaults to http://localhost:5080
npm run dev
```

## Path note for .NET

If the repository path contains a `|` character, MSBuild fails to resolve project
outputs. Clone or copy the repo to a path without special characters before building the
backend. The frontend is not affected.

## Deploying

- **Backend** (Render Web Service): root `backend/`, build `dotnet publish -c Release -o out`,
  start `dotnet out/IncentiveTool.Api.dll`. Set `CORS_ORIGINS` to the frontend's URL.
  Font files are copied on publish.
- **Frontend** (Render Static Site): root `frontend/`, build `npm run build`, publish
  directory `dist/`. Set `VITE_API_BASE_URL` to the backend's URL.

## Licensing note

QuestPDF is used under its Community license, which is free for open-source projects and
small organisations. Check the current terms at https://www.questpdf.com/license/ if the
tool is used commercially.
