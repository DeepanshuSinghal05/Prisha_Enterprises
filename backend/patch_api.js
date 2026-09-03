const fs = require('fs');

const file_path = "C:/Users/Deepanshu Singhal/prisha_enterprises/frontend/src/services/api.js";
let code = fs.readFileSync(file_path, 'utf8');

const regex = /export const apiRequest = async \(endpoint, options = \{\}\) => \{/;

const injection = `export const apiRequest = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  
  // If mutating request and no CSRF cookie, fetch it first
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!document.cookie || !document.cookie.includes('XSRF-TOKEN=')) {
      try {
        await fetch(\`\${API_URL}/health\`, { credentials: 'include' });
      } catch (e) {
        console.warn('Failed to pre-fetch CSRF token', e);
      }
    }
  }`;

code = code.replace(regex, injection);

fs.writeFileSync(file_path, code);
console.log('patched api.js');
