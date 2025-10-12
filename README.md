# PDF Template Designer

A dedicated backend environment for designing and testing PDF templates with live-reloading preview.

## 🚀 Features

- **Live Preview Server**: Automatically refreshes when you make changes to templates or data
- **PDF Generation**: Generate high-quality PDFs from your templates
- **Handlebars Templating**: Powerful templating engine for dynamic content
- **Isolated Environment**: Keep template design separate from your main project

## 📦 Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## 🛠️ Usage

### Design and Preview Templates

Start the live development server:

```bash
npm run dev
```

- Open your browser to `http://localhost:3000`
- Edit `report-template.html` or `sample-data.json`
- The browser automatically refreshes when you save changes

### Generate Final PDF

Once you're happy with your design:

```bash
npm run generate
```

This creates `final-report.pdf` in the project folder.

## 📁 Project Structure

```
/PdfTemplateGenerator
├── node_modules/           # Dependencies
├── package.json           # Project configuration
├── dev-server.js          # Live-preview server
├── generate-pdf.js        # PDF generation script
├── report-template.html   # Your HTML/CSS template
├── sample-data.json       # Sample data for live preview
└── final-report.pdf       # Generated PDF (created after running npm run generate)
```

## ✨ Customization

### Modify Template
Edit `report-template.html` to change the design, layout, and styling.

### Update Sample Data
Edit `sample-data.json` to test with different data during development.

### PDF Settings
Modify `generate-pdf.js` to adjust:
- Page format (A4, Letter, etc.)
- Margins
- Print background settings
- Output filename

## 🎯 Workflow

1. **Design Phase**: Run `npm run dev` and design your template with live reload
2. **Test Phase**: Update `sample-data.json` with different test cases
3. **Generate Phase**: Run `npm run generate` to create the final PDF
4. **Integration Phase**: Copy your template and generation logic to your main project

## 📝 Notes

- The live reload server watches all files in the current directory
- Changes to any file will trigger a browser refresh
- Generated PDFs include print backgrounds and maintain A4 format
- Puppeteer headless browser ensures consistent PDF rendering

## 🔧 Technologies Used

- **Express**: Web server framework
- **Handlebars**: Templating engine
- **Puppeteer**: Headless Chrome for PDF generation
- **Nodemon**: Development server with auto-restart
- **LiveReload**: Browser auto-refresh on file changes
