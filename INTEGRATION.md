# Using Templates in Your Project

## Quick Integration

### 1. Copy Template Files
Copy the template HTML file from `templates/` folder to your project.

### 2. Install Puppeteer
```bash
npm install puppeteer handlebars
```

### 3. Generate PDF

```javascript
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');

async function generatePDF(templatePath, data, outputPath) {
    // Read template
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    
    // Compile with data
    const template = handlebars.compile(templateHtml);
    const finalHtml = template(data);
    
    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' }
    });
    
    await browser.close();
    console.log(`PDF generated: ${outputPath}`);
}

// Usage
const data = {
    billNumber: "251101002",
    LaboratoryName: "City Health Labs",
    // ... rest of your data
};

generatePDF('./bill1.html', data, './invoice.pdf');
```

## Template Data Structure
Check `data/<template-name>-data.json` for required data structure.

Check `templates/<template-name>-VARIABLES.md` for variable documentation.

## Example with Express API

```javascript
app.post('/generate-invoice', async (req, res) => {
    const data = req.body;
    const pdfPath = `./invoices/${data.billNumber}.pdf`;
    
    await generatePDF('./templates/bill1.html', data, pdfPath);
    
    res.download(pdfPath);
});
```

## Notes
- Templates are self-contained (CSS and JS included)
- Use Indian Rupees (₹) for currency
- Dates auto-format to DD.MM.YYYY
- All templates are A4 size optimized
