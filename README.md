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


---
# React-PDF Integration Guide for Medical Lab Reports

## Overview

This guide explains how to integrate the React-PDF template into your main project to generate medical lab report PDFs. The template we built (Report1Template.js) takes structured JSON data and produces professional PDF reports.

---

## 1. Required Dependencies

Install these packages in your backend project:

```bash
npm install @react-pdf/renderer react react-pdf-html
```

---

## 2. File Structure to Copy

Copy these files/folders from the `PdfTemplateGenerator` project to your main project:

```
your-backend/
├── pdf-engine/
│   ├── fonts/
│   │   ├── Roboto-Regular.ttf
│   │   ├── Roboto-Medium.ttf
│   │   └── Roboto-Bold.ttf
│   ├── templates/
│   │   └── Report1Template.js
│   └── generate.js
```

---

## 3. Data Structure Required

Your backend must produce a JSON object with this structure:

### 3.1 Root Level Structure

```javascript
{
  laboratory: { ... },      // Lab info
  doctors: [ ... ],         // Array of doctors with signatures
  reportSettings: { ... },  // PDF layout settings
  report: { ... },          // Report metadata
  dates: { ... },           // All dates
  patient: { ... },         // Patient details
  tests: [ ... ],           // Array of test results
}
```

### 3.2 Detailed Field Reference

#### `laboratory` (Object)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Laboratory name |
| `phone` | string | Contact number |
| `email` | string | Email address |
| `address` | string | Full address |
| `city` | string | City |
| `website` | string | Website URL |
| `ownerName` | string | Owner/Director name |
| `registrationNumber` | string | Lab registration number |

#### `doctors` (Array)
Each doctor object:
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Doctor's name |
| `qualification` | string | Qualifications (supports `\n` for line breaks) |
| `registrationNumber` | string | Medical registration number |
| `signatureUrl` | string | **URL to signature image** (PNG/JPEG) |
| `departments` | array | Array of department names |
| `hasSignature` | boolean | Whether signature exists |

#### `reportSettings` (Object) - **Critical for Layout**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `backgroundUrl` | string | - | **URL to letterhead background image** |
| `headerHeight` | number | 80 | Height in mm reserved for header |
| `footerHeight` | number | 60 | Height in mm reserved for footer |
| `endingLine` | string | - | Text shown at end of report |
| `endingLineFontSize` | number | 12 | Font size for ending line |
| `hasBackground` | boolean | false | Whether background image exists |
| `patientDesignLayout` | string | "layout1" | Patient info layout style |

#### `report` (Object)
| Field | Type | Description |
|-------|------|-------------|
| `reportNumber` | string | Unique report number |
| `billNumber` | string | Associated bill number |
| `barcode` | string | Barcode data (optional) |
| `status` | string | Report status |
| `urgency` | string | "normal" or "urgent" |
| `isUrgent` | boolean | Urgency flag |

#### `dates` (Object)
| Field | Type | Description |
|-------|------|-------------|
| `reportDate` | string | Formatted report date (e.g., "02 Dec 2025") |
| `collectionDate` | string | Sample collection date |
| `reportedDate` | string | Date report was finalized |
| `reportTime` | string | Time of report (e.g., "10:44 pm") |

#### `patient` (Object)
| Field | Type | Description |
|-------|------|-------------|
| `designation` | string | Mr/Mrs/Ms etc. |
| `fullName` | string | Complete name with designation |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `age` | number | Age value |
| `ageType` | string | "years", "months", "days" |
| `ageDisplay` | string | Formatted age (e.g., "22 years") |
| `gender` | string | "male", "female", "other" |
| `genderDisplay` | string | Formatted gender |
| `phone` | string | Contact number |
| `email` | string | Email |
| `address` | string | Address |
| `referringDoctor` | string | Referring doctor name |

---

## 4. Test Data Structure (Most Important)

The `tests` array contains all test results. **Three types of fields are supported:**

### 4.1 Numeric Fields (e.g., CBC)
```javascript
{
  testCode: "CBC",
  testName: "Complete Blood Count (CBC)",
  category: "Hematology",
  status: "approved",
  fields: [
    {
      type: "field",           // Simple field
      name: "Haemoglobin",
      value: "15",
      unit: "g/dL",
      referenceRange: "13 - 17",
      isAbnormal: false,
      abnormalType: "normal",  // "normal", "high", or "low"
    },
    // More fields...
  ],
  hasAbnormalValues: false
}
```

### 4.2 Grouped Fields (e.g., DLC in CBC, Urine Routine)
```javascript
{
  type: "group",
  name: "Differential Leucocyte Count",
  sub_fields: [
    {
      type: "field",
      name: "Neutrophils",
      value: "50",
      unit: "%",
      referenceRange: "40 - 80",
      isAbnormal: false,
      abnormalType: "normal",
    },
    // More sub-fields...
  ],
  hasAbnormal: false  // true if any sub_field is abnormal
}
```

### 4.3 HTML Content Fields (e.g., WIDAL, Culture Reports)
For tests with rich content from TinyMCE editor:
```javascript
{
  testCode: "WIDAL",
  testName: "WIDAL TEST (TUBE METHOD)",
  category: "Serology",
  fields: [
    {
      type: "field",
      name: "Test Results",
      value: "<table>...</table><p><strong>Result</strong></p>",  // HTML content
      unit: "",
      referenceRange: "",
      isAbnormal: false,
    }
  ]
}
```

**The template automatically detects HTML content** (checks if value contains `<table`, `<p>`, `<div>`, etc.) and renders it using `react-pdf-html`.

---

## 5. Backend Integration Code

### 5.1 PDF Generation Service

Create a service file in your backend:

```javascript
// services/pdfService.js
const React = require('react');
const ReactPDF = require('@react-pdf/renderer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// Import the template
const Report1Template = require('../pdf-engine/templates/Report1Template');

/**
 * Convert image URL to base64 data URI
 */
async function imageUrlToBase64(url) {
  if (!url) return null;
  
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        return imageUrlToBase64(response.headers.location).then(resolve).catch(reject);
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = response.headers['content-type'] || 'image/png';
        const base64 = buffer.toString('base64');
        resolve(`data:${contentType};base64,${base64}`);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Prepare report data by converting all image URLs to base64
 */
async function prepareReportData(reportData) {
  const prepared = JSON.parse(JSON.stringify(reportData)); // Deep clone
  
  // Convert background image
  if (prepared.reportSettings?.backgroundUrl) {
    try {
      prepared.reportSettings.backgroundBase64 = await imageUrlToBase64(
        prepared.reportSettings.backgroundUrl
      );
      console.log('✅ Background image converted');
    } catch (err) {
      console.warn('⚠️ Failed to convert background:', err.message);
    }
  }
  
  // Convert doctor signatures
  if (prepared.doctors?.length) {
    for (let i = 0; i < prepared.doctors.length; i++) {
      const doctor = prepared.doctors[i];
      if (doctor.signatureUrl) {
        try {
          doctor.signatureBase64 = await imageUrlToBase64(doctor.signatureUrl);
          console.log(`✅ Doctor ${i + 1} signature converted`);
        } catch (err) {
          console.warn(`⚠️ Failed to convert doctor ${i + 1} signature:`, err.message);
        }
      }
    }
  }
  
  return prepared;
}

/**
 * Generate PDF buffer from report data
 */
async function generateReportPdf(reportData) {
  // Prepare data (convert images to base64)
  const preparedData = await prepareReportData(reportData);
  
  // Create React element
  const element = React.createElement(Report1Template, { data: preparedData });
  
  // Render to buffer
  const pdfBuffer = await ReactPDF.renderToBuffer(element);
  
  return pdfBuffer;
}

/**
 * Generate PDF and save to file
 */
async function generateReportPdfToFile(reportData, outputPath) {
  const preparedData = await prepareReportData(reportData);
  const element = React.createElement(Report1Template, { data: preparedData });
  
  await ReactPDF.render(element, outputPath);
  
  return outputPath;
}

/**
 * Generate PDF as stream (for HTTP response)
 */
async function generateReportPdfStream(reportData) {
  const preparedData = await prepareReportData(reportData);
  const element = React.createElement(Report1Template, { data: preparedData });
  
  return await ReactPDF.renderToStream(element);
}

module.exports = {
  generateReportPdf,
  generateReportPdfToFile,
  generateReportPdfStream,
  prepareReportData
};
```

### 5.2 Express.js Route Example

```javascript
// routes/reports.js
const express = require('express');
const router = express.Router();
const { generateReportPdf, generateReportPdfStream } = require('../services/pdfService');

// Generate PDF and return as download
router.get('/report/:reportId/pdf', async (req, res) => {
  try {
    // Fetch report data from your database
    const reportData = await fetchReportData(req.params.reportId);
    
    // Generate PDF buffer
    const pdfBuffer = await generateReportPdf(reportData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportData.report.reportNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate PDF and stream (better for large files)
router.get('/report/:reportId/pdf/stream', async (req, res) => {
  try {
    const reportData = await fetchReportData(req.params.reportId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="report-${reportData.report.reportNumber}.pdf"`);
    
    const pdfStream = await generateReportPdfStream(reportData);
    pdfStream.pipe(res);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
```

---

## 6. Frontend Integration

### 6.1 Download PDF Button

```javascript
// React component
const DownloadReportButton = ({ reportId }) => {
  const [loading, setLoading] = useState(false);
  
  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/report/${reportId}/pdf`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Generating...' : 'Download PDF'}
    </button>
  );
};
```

### 6.2 Preview PDF in Browser

```javascript
const PreviewReportButton = ({ reportId }) => {
  const handlePreview = () => {
    // Open PDF in new tab
    window.open(`/api/report/${reportId}/pdf/stream`, '_blank');
  };
  
  return (
    <button onClick={handlePreview}>
      Preview PDF
    </button>
  );
};
```

---

## 7. Key Configuration Points

### 7.1 Header & Footer Heights

These are **critical** for proper layout:

```javascript
reportSettings: {
  headerHeight: 80,  // mm - Space reserved at top for letterhead
  footerHeight: 60,  // mm - Space reserved at bottom for signatures
}
```

- Measure your letterhead image to determine correct values
- Header area: Lab logo, name, contact info
- Footer area: Doctor signatures, qualifications

### 7.2 Background Image

The background image (letterhead) should be:
- **Size**: A4 (210mm × 297mm) or matching aspect ratio
- **Format**: JPEG or PNG
- **Resolution**: 150-300 DPI for print quality
- The template overlays content on top of this background

### 7.3 Doctor Signatures

- Signatures should be PNG with transparent background (preferred)
- JPEG works but won't have transparency
- Recommended size: 150-300px width

---

## 8. Abnormal Value Highlighting

The template automatically highlights abnormal values:

| Condition | Name Style | Value Style |
|-----------|------------|-------------|
| Normal | Regular, black | Regular, black |
| High | **Bold**, black | **Bold**, red |
| Low | **Bold**, black | **Bold**, blue |

Set these in your field data:
```javascript
{
  isAbnormal: true,
  abnormalType: "high",  // or "low"
}
```

---

## 9. HTML Content (TinyMCE) Support

For tests that use TinyMCE rich text editor (like WIDAL tables):

1. Store HTML string in the `value` field
2. Template auto-detects HTML content
3. Tables, paragraphs, bold text, etc. are rendered

**Supported HTML elements:**
- `<table>`, `<tr>`, `<td>`, `<th>`
- `<p>`, `<strong>`, `<em>`
- `<ul>`, `<ol>`, `<li>`
- Inline styles (padding, border, text-align, font-weight)

---

## 10. Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  (React/Vue/Angular)                                        │
│                                                             │
│  1. User creates/edits test results                         │
│  2. TinyMCE for rich content (WIDAL tables)                 │
│  3. Numeric inputs for CBC, etc.                            │
│  4. Click "Generate PDF" button                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ API Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  (Node.js/Express)                                          │
│                                                             │
│  1. Fetch report data from database                         │
│  2. Structure data as per schema above                      │
│  3. Call generateReportPdf(reportData)                      │
│     ├── Convert image URLs to base64                        │
│     ├── Create React element with Report1Template           │
│     └── Render to PDF buffer/stream                         │
│  4. Return PDF to frontend                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │ PDF Response
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                             │
│  - Download PDF file                                        │
│  - Or preview in browser                                    │
│  - Or send to printer                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not showing | Ensure URLs are converted to base64 before rendering |
| Layout broken | Check `headerHeight` and `footerHeight` values match your letterhead |
| Fonts not loading | Ensure `.ttf` files are in correct path and Font.register is called |
| HTML tables misaligned | Check if TinyMCE HTML has proper inline styles |
| PDF blank | Check console for React-PDF errors, ensure data structure is correct |

---

## 12. Performance Tips

1. **Cache base64 images** - Don't convert on every request
2. **Use streams** for large PDFs - `renderToStream()` instead of `renderToBuffer()`
3. **Queue PDF generation** - For high traffic, use job queue (Bull, etc.)
4. **Pre-generate PDFs** - Generate when report is approved, store and serve

---

## Summary

To integrate React-PDF into your project:

1. ✅ Install dependencies: `@react-pdf/renderer`, `react`, `react-pdf-html`
2. ✅ Copy template files and fonts
3. ✅ Structure your backend data as per the schema
4. ✅ Convert image URLs to base64 before rendering
5. ✅ Use `renderToBuffer()` or `renderToStream()` for PDF output
6. ✅ Return PDF via API endpoint
7. ✅ Frontend downloads or previews the PDF

The template handles all the complex rendering - you just need to pass properly structured data!