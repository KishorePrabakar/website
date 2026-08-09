const fs = require('fs');
const path = require('path');

const RESUME_LINK_PATTERNS = [
  /<a[^>]*id="resume-link"[^>]*href="([^"]+)"/i,
  /<a[^>]*href="([^"]+)"[^>]*id="resume-link"/i,
  /<a[^>]*href="([^"]+)"[^>]*>\s*Resume\s*<\/a>/i,
];

function extractResumeUrl(html) {
  for (const pattern of RESUME_LINK_PATTERNS) {
    const match = html.match(pattern);
    if (match && !match[1].startsWith('/resume')) return match[1];
  }
  return null;
}

function readHomepageFromDisk() {
  const indexPath = path.join(process.cwd(), 'index.html');
  return fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : null;
}

async function fetchHomepage(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (/^localhost|^127\./.test(host) ? 'http' : 'https');
  const url = `${protocol}://${host}/index.html`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
  return response.text();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let html = readHomepageFromDisk();
  if (html === null) {
    try {
      html = await fetchHomepage(req);
    } catch (error) {
      console.error('Failed to load homepage', error);
      return res.status(502).json({ error: 'Could not load the homepage to read the resume link' });
    }
  }

  const resumeUrl = extractResumeUrl(html);
  if (!resumeUrl) {
    return res.status(404).json({ error: 'No resume link found on the homepage' });
  }

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');

  if (/[?&]format=json(&|$)/.test(req.url || '')) {
    return res.status(200).json({ label: 'Resume', resumeUrl });
  }

  res.setHeader('Location', resumeUrl);
  return res.status(302).end();
};

module.exports.extractResumeUrl = extractResumeUrl;
