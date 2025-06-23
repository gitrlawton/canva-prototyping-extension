# Canva Prototyping Extension

A Canva App extension that allows users to create interactive prototypes by adding clickable hotspots to their designs and exporting them as interactive HTML files.

## Features

- Create clickable hotspots on any element in your Canva design
- Link hotspots to specific pages within your design
- Export your prototype as a zipped HTML file for sharing
- Preview your interactive prototype directly within your browser

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Canva Developer Account
- Canva CLI tools (optional)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/gitrlawton/canva-prototyping-extension
cd canva-prototyping-extension
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Follow the Canva Developer documentation to link your local app to your Canva Developer account.

## Usage

1. Open your design in Canva
2. Launch the Prototyping Extension from the Apps panel
3. Select an element in your design
4. Choose a target page for the hotspot
5. Add the hotspot
6. Repeat for all interactive elements
7. Export your prototype as a zip file using the Export button

## Project Structure

- `src/` - Main application code
  - `components/` - React components
  - `app.tsx` - Main application component that orchestrates the prototyping workflow
  - `types.ts` - TypeScript interfaces and shared type definitions

## Development

This project is built using:

- React
- TypeScript
- Canva SDK

  ## Acknowledgments

  - Canva Developer Platform
  - Canva UI Kit

## FAQ

### How do I create a hotspot?

Select any text element in your Canva design, then use the extension to choose a target page. The selected element will become clickable in the exported prototype.

### Can I edit a hotspot after creating it?

Yes, you can edit or delete existing hotspots using the hotspots manager panel in the extension.

### What file format is the exported prototype?

The prototype is exported as a zip file containing HTML, CSS, and JavaScript files.

### Can I preview my prototype before exporting?

No, the prototype is created upon exporting.

### Can I add multiple hotspots to the same page?

Yes, you can add as many hotspots as needed to any page in your design.

### How does the application interact with the Canva SDK?

The application uses Canva's selection API to detect when a user selects elements. It also uses the page navigation APIs to get information about pages and the export functionality to generate the interactive prototype.

### How is the hotspot data structure designed?

Hotspots are stored as an array of objects, each containing:

- A unique identifier
- The source element ID
- The target page ID
- Position and dimension data
  This structure allows for efficient lookup and modification of hotspots.

### How does the export process work?

When a user exports their prototype:

1. The app collects all hotspot data
2. Generates HTML with embedded JavaScript for interactivity
3. Packages assets and code into a zip file
4. Provides the zip for download

### What improvements could be made to the current implementation?

Potential improvements include:

- Supporting linking more element types beyond text elements
- Supporting querying the location of elements for a more realistic interactive experience
- Implementing a more robust, in-app preview system
