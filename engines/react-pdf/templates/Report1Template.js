/**
 * React-PDF Report1 Template
 * 
 * This template uses @react-pdf/renderer to create medical lab reports.
 * Written without JSX to work directly with Node.js (no transpilation needed).
 * Uses react-pdf-html for rendering HTML content from TinyMCE editor.
 */

const React = require('react');
const path = require('path');
const { Document, Page, Text, View, Image, StyleSheet, Font } = require('@react-pdf/renderer');
const Html = require('react-pdf-html').default;

const e = React.createElement;

// ============================================
// Register Professional Fonts (Roboto)
// ============================================
// Using Roboto - a professional, clean font similar to Inter
// Local TTF files for reliable loading

const fontsDir = path.resolve(__dirname, '../fonts');

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: path.join(fontsDir, 'Roboto-Regular.ttf'),
      fontWeight: 400,
    },
    {
      src: path.join(fontsDir, 'Roboto-Medium.ttf'),
      fontWeight: 500,
    },
    {
      src: path.join(fontsDir, 'Roboto-Medium.ttf'),
      fontWeight: 600,
    },
    {
      src: path.join(fontsDir, 'Roboto-Bold.ttf'),
      fontWeight: 700,
    },
  ],
});

// Disable hyphenation for cleaner text
Font.registerHyphenationCallback(word => [word]);

// ============================================
// HTML Stylesheet for react-pdf-html
// ============================================
// This stylesheet is used by react-pdf-html to style HTML content
// from TinyMCE (like Widal test tables)

const htmlStylesheet = {
  // Global styles
  body: {
    fontFamily: 'Roboto',
    fontSize: 9,
  },
  // Table styles - clean, minimal
  table: {
    width: '100%',
    marginVertical: 5,
  },
  thead: {
    backgroundColor: '#cdc1c1ff',
  },
  tr: {
    // Default row style
  },
  th: {
    fontFamily: 'Roboto',
    fontWeight: 600,
    fontSize: 9,
    padding: 3,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
  },
  td: {
    fontFamily: 'Roboto',
    fontSize: 9,
    padding: 3,
    textAlign: 'center',
  },
  // Text styles
  p: {
    fontFamily: 'Roboto',
    fontSize: 9,
    marginVertical: 2,
  },
  strong: {
    fontFamily: 'Roboto',
    fontWeight: 600,
  },
  b: {
    fontFamily: 'Roboto',
    fontWeight: 600,
  },
};

// ============================================
// HTML Cleaner for TinyMCE content
// ============================================
// Minimally cleans TinyMCE HTML - only removes what's necessary
// for our header row background to apply

function cleanHtmlForPdf(html) {
  if (!html) return html;
  
  let cleaned = html;
  
  // Only remove background-color from the FIRST row (header row)
  // so our grey header background can apply
  // Match first <tr> and remove background-color from it
  cleaned = cleaned.replace(
    /(<tr[^>]*style="[^"]*)(background-color:\s*[^;}"']+;?)([^"]*")/i,
    '$1$3'
  );
  
  // Convert first row's td to th if they have font-weight: bold
  // This allows our th { backgroundColor } style to apply
  cleaned = cleaned.replace(
    /<tr([^>]*)>([\s\S]*?)<\/tr>/i,
    (match, attrs, content) => {
      // Check if this row has bold cells (header row)
      if (/font-weight:\s*bold/i.test(content)) {
        // Replace td with th for header cells
        const newContent = content
          .replace(/<td/gi, '<th')
          .replace(/<\/td>/gi, '</th>');
        return `<tr${attrs}>${newContent}</tr>`;
      }
      return match;
    }
  );
  
  return cleaned;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    position: 'relative',
  },
  
  // Background image - covers full page
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '210mm',
    height: '297mm',
    zIndex: -1,
  },
  
  // Content wrapper with padding for header/footer
  contentWrapper: {
    flex: 1,
    paddingLeft: '10mm',
    paddingRight: '10mm',
  },
  
  // Header spacer (dynamic height)
  headerSpacer: {
    width: '100%',
  },
  
  // Footer spacer (dynamic height)
  footerSpacer: {
    width: '100%',
  },
  
  // Fixed Header (patient info)
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '210mm',
    paddingLeft: '10mm',
    paddingRight: '10mm',
    paddingBottom: '8mm',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  
  headerBorder: {
    border: '1pt solid #000',
    padding: '8 12',
    flexDirection: 'row',
  },
  
  headerColumn: {
    flex: 2,
    flexDirection: 'column',
  },
  
  headerColumnSmall: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 10,
  },
  
  infoLabel: {
    width: 85,
  },
  
  infoSeparator: {
    width: 10,
  },
  
  infoValue: {
    flex: 1,
    fontFamily: 'Roboto',
    fontWeight: 600,
  },
  
  qrCode: {
    width: 50,
    height: 50,
  },
  
  // Fixed Footer (doctor signatures)
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '210mm',
    paddingLeft: '10mm',
    paddingRight: '10mm',
    paddingTop: '9mm',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  doctorSign: {
    alignItems: 'center',
    width: 120,
  },
  
  signatureImage: {
    width: 100,
    height: 60,
    objectFit: 'contain',
  },
  
  doctorName: {
    fontSize: 11,
    fontFamily: 'Roboto',
    fontWeight: 600,
    textAlign: 'center',
    marginTop: 2,
  },
  
  doctorQualification: {
    fontSize: 8,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  
  // Main content styles
  mainContent: {
    flex: 1,
  },
  
  // Test section styles
  testSection: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  
  departmentHeader: {
    fontSize: 11,
    fontFamily: 'Roboto',
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  
  testName: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 600,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  
  // Results table styles
  resultsTable: {
    width: '100%',
    marginBottom: 8,
  },
  
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Roboto',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  
  groupRow: {
    flexDirection: 'row',
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  
  tableCell: {
    fontSize: 9,
    fontFamily: 'Roboto',
  },
  
  // Column widths
  colTestName: { width: '40%' },
  colResult: { width: '15%', textAlign: 'center' },
  colFlag: { width: '10%', textAlign: 'center' },
  colRange: { width: '20%', textAlign: 'center' },
  colUnit: { width: '15%', textAlign: 'center' },
  
  // Abnormal value styles
  abnormalHigh: {
    color: '#d32f2f',
    fontFamily: 'Roboto',
    fontWeight: 600,
  },
  
  abnormalLow: {
    color: '#1976d2',
    fontFamily: 'Roboto',
    fontWeight: 600,
  },
  
  // Indent styles
  indent1: { paddingLeft: 10 },
  indent2: { paddingLeft: 20 },
  
  // Ending line
  endingLine: {
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
    fontFamily: 'Roboto',
  },
  
  // Interpretation
  interpretation: {
    padding: 5,
    marginBottom: 5,
    marginTop: 3,
  },
  
  interpretationTitle: {
    fontFamily: 'Roboto',
    fontWeight: 600,
    marginBottom: 2,
  },
});

// Header Component - renders on every page when fixed=true
function Header({ patient, report, dates, headerHeight }) {
  return e(View, { style: [styles.fixedHeader, { height: headerHeight + 'mm' }], fixed: true },
    e(View, { style: styles.headerBorder },
      // First column - Patient info
      e(View, { style: styles.headerColumn },
        e(View, { style: styles.infoRow },
          e(Text, { style: styles.infoLabel }, 'Name'),
          e(Text, { style: styles.infoSeparator }, ':'),
          e(Text, { style: styles.infoValue }, patient.fullName)
        ),
        e(View, { style: styles.infoRow },
          e(Text, { style: styles.infoLabel }, 'Age/Gender'),
          e(Text, { style: styles.infoSeparator }, ':'),
          e(Text, { style: styles.infoValue }, patient.ageDisplay + ' / ' + patient.genderDisplay)
        ),
        e(View, { style: styles.infoRow },
          e(Text, { style: styles.infoLabel }, 'Referred By'),
          e(Text, { style: styles.infoSeparator }, ':'),
          e(Text, { style: styles.infoValue }, patient.referringDoctor || '')
        ),
        e(View, { style: styles.infoRow },
          e(Text, { style: styles.infoLabel }, 'Patient ID'),
          e(Text, { style: styles.infoSeparator }, ':'),
          e(Text, { style: styles.infoValue }, report.billNumber)
        )
      ),
      // Second column - Report info
      e(View, { style: styles.headerColumn },
        e(View, { style: styles.infoRow },
          e(Text, { style: styles.infoLabel }, 'Report ID'),
          e(Text, { style: styles.infoSeparator }, ':'),
          e(Text, { style: styles.infoValue }, report.reportNumber)
        ),
        e(View, { style: styles.infoRow },
          e(Text, { style: styles.infoLabel }, 'Report Date'),
          e(Text, { style: styles.infoSeparator }, ':'),
          e(Text, { style: styles.infoValue }, dates.reportDate + ' ' + (dates.reportTime || ''))
        ),
        e(View, { style: styles.infoRow },
          e(Text, { style: styles.infoLabel }, 'Reg. Date'),
          e(Text, { style: styles.infoSeparator }, ':'),
          e(Text, { style: styles.infoValue }, dates.collectionDate || '')
        )
      ),
      // Third column - QR Code
      e(View, { style: styles.headerColumnSmall },
        report.barcode ? e(Image, { src: report.barcode, style: styles.qrCode }) : null
      )
    )
  );
}

// Footer Component - renders on every page when fixed=true
function Footer({ doctors, footerHeight }) {
  const filteredDoctors = doctors.filter(doc => doc.hasSignature);
  
  return e(View, { style: [styles.fixedFooter, { height: footerHeight + 'mm' }], fixed: true },
    e(View, { style: styles.footerContainer },
      ...filteredDoctors.map((doctor, index) =>
        e(View, { key: index, style: styles.doctorSign },
          doctor.signatureBase64 ? e(Image, { src: doctor.signatureBase64, style: styles.signatureImage }) : null,
          e(Text, { style: styles.doctorName }, doctor.name),
          doctor.qualification ? e(Text, { style: styles.doctorQualification }, doctor.qualification.replace(/\n/g, ', ')) : null,
          doctor.registrationNumber ? e(Text, { style: styles.doctorQualification }, 'Reg: ' + doctor.registrationNumber) : null
        )
      )
    )
  );
}

// Table Header Component
function TableHeader() {
  return e(View, { style: styles.tableHeader },
    e(Text, { style: [styles.tableHeaderCell, styles.colTestName] }, 'Test Description'),
    e(Text, { style: [styles.tableHeaderCell, styles.colResult] }, 'Result'),
    e(Text, { style: [styles.tableHeaderCell, styles.colFlag] }, 'Flag'),
    e(Text, { style: [styles.tableHeaderCell, styles.colRange] }, 'Ref. Range'),
    e(Text, { style: [styles.tableHeaderCell, styles.colUnit] }, 'Unit')
  );
}

// Field Row Component
function FieldRow({ field, indent }) {
  const indentStyle = indent === 1 ? styles.indent1 : indent === 2 ? styles.indent2 : {};
  const abnormalStyle = field.abnormalType === 'high' ? styles.abnormalHigh : 
                        field.abnormalType === 'low' ? styles.abnormalLow : {};
  
  // Make field name bold if abnormal (black color)
  const nameStyle = field.isAbnormal ? { fontWeight: 600 } : {};
  
  const flag = field.isAbnormal ? (field.abnormalType === 'high' ? 'H' : field.abnormalType === 'low' ? 'L' : '') : '';
  
  return e(View, { style: styles.tableRow, wrap: false },
    e(Text, { style: [styles.tableCell, styles.colTestName, indentStyle, nameStyle] }, field.name),
    e(Text, { style: [styles.tableCell, styles.colResult, abnormalStyle] }, field.value || ''),
    e(Text, { style: [styles.tableCell, styles.colFlag, abnormalStyle] }, flag),
    e(Text, { style: [styles.tableCell, styles.colRange] }, field.referenceRange || ''),
    e(Text, { style: [styles.tableCell, styles.colUnit] }, field.unit || '')
  );
}

// Group Row Component
function GroupRow({ name, indent }) {
  const indentStyle = indent === 1 ? styles.indent1 : {};
  
  return e(View, { style: styles.groupRow, wrap: false },
    e(Text, { style: [styles.tableCell, { width: '100%' }, indentStyle] }, name)
  );
}

// Render fields recursively (for numeric/tabular data)
function renderFields(fields, indent = 0, parentKey = '') {
  const elements = [];
  
  if (!fields) return elements;
  
  fields.forEach((field, index) => {
    const uniqueKey = parentKey + '-' + index;
    
    if (field.type === 'field' && field.value) {
      // Skip HTML content - it's handled separately in TestSection
      if (isHtmlValue(field.value)) {
        return;
      }
      elements.push(
        e(FieldRow, { key: 'field' + uniqueKey, field: field, indent: indent })
      );
    } else if (field.type === 'group') {
      elements.push(
        e(GroupRow, { key: 'group' + uniqueKey, name: field.name, indent: indent })
      );
      if (field.sub_fields) {
        elements.push(...renderFields(field.sub_fields, indent + 1, uniqueKey));
      }
    }
  });
  
  return elements;
}

// Test Section Component
function TestSection({ test }) {
  // Detect if any field contains HTML content
  const hasHtmlContent = test.fields && test.fields.some(f => 
    f.type === 'field' && f.value && (
      f.value.includes('<table') || 
      f.value.includes('<p>') || 
      f.value.includes('<br') ||
      f.value.includes('<strong')
    )
  );
  
  // Check if has numeric/tabular fields (fields with units/reference ranges)
  const hasTableFields = test.fields && test.fields.some(f => 
    (f.type === 'field' && f.value && !isHtmlValue(f.value) && (f.unit || f.referenceRange)) ||
    f.type === 'group'
  );
  
  const children = [
    e(Text, { key: 'dept', style: styles.departmentHeader }, test.category),
    e(Text, { key: 'name', style: styles.testName }, test.testName)
  ];
  
  if (hasHtmlContent) {
    // For tests with HTML content (like Widal) - use react-pdf-html
    test.fields && test.fields.forEach((field, idx) => {
      if (field.type === 'field' && field.value && isHtmlValue(field.value)) {
        // Clean the HTML - only remove header row background-color so our grey can apply
        const cleanedHtml = cleanHtmlForPdf(field.value);
        
        // Use react-pdf-html to render HTML content directly
        // Keep TinyMCE's inline styles (padding, text-align, etc.) - don't use resetStyles
        children.push(
          e(Html, { 
            key: 'html-content-' + idx, 
            stylesheet: htmlStylesheet,
            style: { fontSize: 9 }
          }, cleanedHtml)
        );
      }
    });
  }
  
  if (hasTableFields) {
    // For numeric tests, show table
    children.push(
      e(View, { key: 'table', style: styles.resultsTable },
        e(TableHeader, { key: 'header' }),
        ...renderFields(test.fields)
      )
    );
  }
  
  // Handle simple text fields (no HTML, no unit/range)
  if (!hasHtmlContent && !hasTableFields) {
    test.fields && test.fields.forEach((field, idx) => {
      if (field.type === 'field' && field.value) {
        children.push(
          e(View, { key: 'simple-field-' + idx, style: { marginBottom: 5, flexDirection: 'row' } },
            field.name ? e(Text, { style: { fontFamily: 'Roboto', fontWeight: 600, marginRight: 10 } }, field.name + ':') : null,
            e(Text, null, field.value)
          )
        );
      }
    });
  }
  
  // Interpretation
  if (test.interpretation && test.interpretation.text) {
    children.push(
      e(View, { key: 'interp', style: styles.interpretation },
        e(Text, { style: styles.interpretationTitle }, 'Interpretation:'),
        e(Text, null, test.interpretation.text)
      )
    );
  }
  
  return e(View, { style: styles.testSection, wrap: false }, ...children);
}

// Helper function to check if a value contains HTML
function isHtmlValue(value) {
  if (!value || typeof value !== 'string') return false;
  return value.includes('<table') || 
         value.includes('<p>') || 
         value.includes('<br') ||
         value.includes('<strong') ||
         value.includes('<b>') ||
         value.includes('</');
}

// Main Document Component
function Report1Template({ data }) {
  const {
    patient,
    report,
    dates,
    doctors,
    tests,
    reportSettings
  } = data;
  
  const headerHeight = reportSettings?.headerHeight || 80;
  const footerHeight = reportSettings?.footerHeight || 60;
  const endingLine = reportSettings?.endingLine || '';
  const endingLineFontSize = reportSettings?.endingLineFontSize || 12;
  
  const pageChildren = [];
  
  // Background Image - fixed to appear on every page
  if (reportSettings?.backgroundBase64) {
    pageChildren.push(
      e(Image, { key: 'bg', src: reportSettings.backgroundBase64, style: styles.backgroundImage, fixed: true })
    );
  }
  
  // Fixed Header
  pageChildren.push(
    e(Header, { 
      key: 'header',
      patient: patient, 
      report: report, 
      dates: dates, 
      headerHeight: headerHeight 
    })
  );
  
  // Fixed Footer
  pageChildren.push(
    e(Footer, { 
      key: 'footer',
      doctors: doctors || [], 
      footerHeight: footerHeight 
    })
  );
  
  // Main Content
  const contentChildren = [
    // Header Spacer - fixed to reserve space on every page
    e(View, { key: 'header-spacer', style: [styles.headerSpacer, { height: headerHeight + 'mm' }], fixed: true }),
    
    // Main Content
    e(View, { key: 'main', style: styles.mainContent },
      ...(tests || []).map((test, index) =>
        e(TestSection, { key: 'test-' + index, test: test })
      ),
      // Ending Line
      endingLine ? e(Text, { key: 'ending', style: [styles.endingLine, { fontSize: endingLineFontSize }] }, endingLine) : null
    ),
    
    // Footer Spacer - fixed to reserve space on every page
    e(View, { key: 'footer-spacer', style: [styles.footerSpacer, { height: footerHeight + 'mm' }], fixed: true })
  ];
  
  pageChildren.push(
    e(View, { key: 'content', style: styles.contentWrapper }, ...contentChildren)
  );
  
  return e(Document, null,
    e(Page, { size: 'A4', style: styles.page }, ...pageChildren)
  );
}

module.exports = Report1Template;
