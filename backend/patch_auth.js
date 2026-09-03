const fs = require('fs');

const file_path = "C:/Users/Deepanshu Singhal/prisha_enterprises/frontend/src/contexts/AuthContext.jsx";
let code = fs.readFileSync(file_path, 'utf8');

// Insert import
if (!code.includes('import { apiRequest }')) {
  code = code.replace(
    'import { createContext, useContext, useState, useEffect } from "react";',
    'import { createContext, useContext, useState, useEffect } from "react";\nimport { apiRequest } from "../services/api";'
  );
}

// Replace login
code = code.replace(
  /const login = async \([^)]+\) => \{[\s\S]*?return data;\n  \};/,
  `const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(AUTH_STORAGE_KEY, data.accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

    setAccessToken(data.accessToken);
    setUser(data.user);

    return data;
  };`
);

// Replace signup
code = code.replace(
  /const signup = async \([^)]+\) => \{[\s\S]*?return data;\n  \};/,
  `const signup = async (name, email, phone, password, confirmPassword) => {
    const data = await apiRequest('/auth/signup', {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password, confirmPassword }),
    });

    localStorage.setItem(AUTH_STORAGE_KEY, data.accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

    setAccessToken(data.accessToken);
    setUser(data.user);

    return data;
  };`
);

// Replace logout
code = code.replace(
  /const logout = async \(\) => \{[\s\S]*?setUser\(null\);\n  \};/,
  `const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    setAccessToken(null);
    setUser(null);
  };`
);

fs.writeFileSync(file_path, code);
console.log('patched AuthContext.jsx');
