const fs = require('fs');

const file_path = "C:/Users/Deepanshu Singhal/prisha_enterprises/frontend/src/services/adminAPI.js";
let code = fs.readFileSync(file_path, 'utf8');

const injection = `
// Intercept requests to fetch CSRF token if missing for mutating requests
adminAxios.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    if (!document.cookie || !document.cookie.includes('XSRF-TOKEN=')) {
      try {
        await axios.get(\`\${API_URL}/health\`, { withCredentials: true });
      } catch (e) {
        console.warn('Failed to pre-fetch CSRF token', e);
      }
    }
  }
  return config;
});

const adminAPI = {
`;

code = code.replace(/const adminAPI = \{/, injection);

fs.writeFileSync(file_path, code);
console.log('patched adminAPI.js');
