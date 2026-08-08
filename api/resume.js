import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the index.html file
    const indexPath = path.join(process.cwd(), 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');

    // Extract the resume link from the HTML
    // Looking for the anchor tag with "Resume" text
    const resumeMatch = htmlContent.match(/<a[^>]*href="([^"]*)"[^>]*>Resume<\/a>/);

    if (resumeMatch && resumeMatch[1]) {
      const resumeData = {
        resumeUrl: resumeMatch[1],
        label: 'Resume'
      };
      res.status(200).json(resumeData);
    } else {
      res.status(404).json({ error: 'Resume link not found in index.html' });
    }
  } catch (error) {
    console.error('Error reading index.html:', error);
    res.status(500).json({ error: 'Failed to read resume link' });
  }
}