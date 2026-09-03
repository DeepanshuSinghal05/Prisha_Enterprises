const baseUrl = 'http://localhost:5000/api';
let csrfTokenGlobal = '';

const customerEmail = `testcustomer@test.com`;
const customerPassword = `Password123!`;
const adminEmail = `admin@prishaenterprises.com`;
const adminPassword = `AdminPassword123!`;

class Session {
  constructor() {
    this.cookies = new Map();
  }

  parseAndSave(res) {
    const raw = res.headers.raw ? res.headers.raw() : null; // check if node-fetch raw() exists
    let setCookieHeaders = [];
    if (raw && raw['set-cookie']) {
      setCookieHeaders = raw['set-cookie'];
    } else {
      // In native fetch, get('set-cookie') concatenates with comma
      // This is a naive split
      const headerStr = res.headers.get('set-cookie');
      if (headerStr) {
        setCookieHeaders = headerStr.split(/,(?=\s*[a-zA-Z0-9_\-]+(?:=|$))/);
      }
    }

    for (let cookie of setCookieHeaders) {
      let cookieVal = cookie.split(';')[0].trim();
      let [k, ...v] = cookieVal.split('=');
      if (k) {
        this.cookies.set(k.trim(), v.join('=').trim());
        if (k.trim() === 'XSRF-TOKEN') csrfTokenGlobal = v.join('=').trim();
      }
    }
  }

  getCookieHeader() {
    let parts = [];
    for (let [k,v] of this.cookies.entries()) {
      parts.push(`${k}=${v}`);
    }
    if (csrfTokenGlobal && !this.cookies.has('XSRF-TOKEN')) {
      parts.push(`XSRF-TOKEN=${csrfTokenGlobal}`);
    }
    return parts.join('; ');
  }

  getCsrf() {
    if (this.cookies.has('XSRF-TOKEN')) return this.cookies.get('XSRF-TOKEN');
    return csrfTokenGlobal;
  }
}

const customerSession = new Session();
const adminSession = new Session();

async function req(path, method = 'GET', body = null, session = customerSession) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  const cHeader = session.getCookieHeader();
  if (cHeader) options.headers['Cookie'] = cHeader;

  const csrf = session.getCsrf();
  if (csrf) options.headers['X-XSRF-Token'] = csrf;

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(baseUrl + path, options);
  session.parseAndSave(res);

  let data;
  try { data = await res.json(); } catch (e) { data = await res.text(); }
  return { status: res.status, data };
}

async function runTests() {
  console.log('=== E2E FLOW TEST (Backend) ===\n');

  console.log('Getting CSRF token...');
  let res = await req('/health');
  if (csrfTokenGlobal) console.log('CSRF token obtained\n');

  // ============================================
  // 1. CUSTOMER AUTHENTICATION
  // ============================================
  console.log('--- 1. Customer Authentication ---');

  res = await req('/auth/login', 'POST', { email: customerEmail, password: 'WrongPassword123!' }, customerSession);
  console.log(`1d. Testing Login (wrong) -> Status: ${res.status}`);
  console.log(res.status === 400 || res.status === 401 ? '   Result: PASS' : '   Result: FAIL');

  res = await req('/auth/login', 'POST', { email: customerEmail, password: customerPassword }, customerSession);
  console.log(`1e. Testing Login (valid) -> Status: ${res.status}`);
  if (res.status === 200 && customerSession.cookies.has('accessToken')) {
    console.log('   Result: PASS');
  } else {
    console.log(`   Result: FAIL - ${JSON.stringify(res.data)}`);
  }

  const unauthSession = new Session();
  res = await req('/auth/me', 'GET', null, unauthSession);
  console.log(`1f. Protected route (no token) -> Status: ${res.status}`);
  console.log(res.status === 401 ? '   Result: PASS' : '   Result: FAIL');

  res = await req('/auth/me', 'GET', null, customerSession);
  console.log(`1g. Protected route (token) -> Status: ${res.status}`);
  console.log(res.status === 200 ? '   Result: PASS' : '   Result: FAIL');

  // ============================================
  // 2. ADMIN AUTHENTICATION
  // ============================================
  console.log('\n--- 2. Admin Authentication ---');
  res = await req('/admin/login', 'POST', { email: adminEmail, password: adminPassword }, adminSession);
  console.log(`2a. Admin Login -> Status: ${res.status}`);
  let adminLoggedIn = false;
  if (res.status === 200 && adminSession.cookies.has('accessToken')) {
      console.log('   Result: PASS');
      adminLoggedIn = true;
  } else {
      console.log(`   Result: FAIL - ${JSON.stringify(res.data)}`);
  }

  res = await req('/admin/stats', 'GET', null, customerSession);
  console.log(`2b. Admin route + Customer session -> Status: ${res.status}`);
  console.log(res.status === 401 || res.status === 403 ? '   Result: PASS' : '   Result: FAIL');

  // ============================================
  // 3. CORE SHOPPING FLOW
  // ============================================
  console.log('\n--- 3. Core Shopping Flow ---');
  res = await req('/products', 'GET', null, customerSession);
  console.log(`3a. Get Products -> Status: ${res.status}`);
  if (res.status === 200 && res.data.products?.length > 0) {
    console.log('   Result: PASS');
  } else {
    console.log('   Result: FAIL');
  }
  const productId = res.data?.products?.[0]?.id;
  let orderId;

  if (productId) {
    res = await req('/cart/checkout/place-order', 'POST', {
      items: [{ productId, quantity: 1 }],
      shippingAddress: {
        address_line1: '123 Test St', city: 'Delhi', state: 'Delhi', pincode: '110001', phone: '9876543210'
      }
    }, customerSession);
    console.log(`3b. Mock Order Placement -> Status: ${res.status}`);
    if (res.status === 200) {
      console.log(`   Result: PASS`);
      orderId = res.data?.order?.id;
    } else {
      console.log(`   Result: FAIL - ${JSON.stringify(res.data)}`);
    }
  }

  // ============================================
  // 4. ORDER MANAGEMENT (Customer)
  // ============================================
  console.log('\n--- 4. Order Management (Customer) ---');
  res = await req('/orders/my-orders', 'GET', null, customerSession);
  console.log(`4a. Get My Orders -> Status: ${res.status}`);
  console.log(res.status === 200 ? '   Result: PASS' : '   Result: FAIL');

  if (orderId) {
    res = await req(`/orders/${orderId}`, 'GET', null, customerSession);
    console.log(`4b. Get Order Details -> Status: ${res.status}`);
    console.log(res.status === 200 ? '   Result: PASS' : '   Result: FAIL');
  }

  res = await req('/orders/99999', 'GET', null, customerSession);
  console.log(`4c. Check non-existent order -> Status: ${res.status}`);
  console.log(res.status === 403 || res.status === 404 ? '   Result: PASS' : '   Result: FAIL');

  // ============================================
  // 5. ORDER MANAGEMENT (Admin)
  // ============================================
  console.log('\n--- 5. Order Management (Admin) ---');
  if (adminLoggedIn) {
    res = await req('/admin/orders', 'GET', null, adminSession);
    console.log(`5a. Admin Get Orders -> Status: ${res.status}`);
    console.log(res.status === 200 ? '   Result: PASS' : '   Result: FAIL');

    if (orderId) {
      res = await req(`/admin/orders/${orderId}/status`, 'PATCH', {
        status: 'shipped', notes: 'Shipped via test courier'
      }, adminSession);
      console.log(`5b. Admin Update Order Status -> Status: ${res.status}`);
      console.log(res.status === 200 ? '   Result: PASS' : '   Result: FAIL');

      res = await req(`/admin/orders/${orderId}/status`, 'PATCH', {
        status: 'invalid_status'
      }, adminSession);
      console.log(`5c. Admin Update invalid status -> Status: ${res.status}`);
      console.log(res.status === 400 ? '   Result: PASS' : '   Result: FAIL');
    }
  }

  // ============================================
  // 6. INPUT VALIDATION
  // ============================================
  console.log('\n--- 6. Input Validation ---');
  res = await req('/products/1 OR 1=1', 'GET', null, customerSession);
  console.log(`6a. SQL Injection protection -> Status: ${res.status}`);
  console.log(res.status === 400 || res.status === 404 ? '   Result: PASS' : '   Result: FAIL');

  res = await req('/cart/checkout/place-order', 'POST', {
    items: [{ productId: productId || 1, quantity: -5 }],
    shippingAddress: {
      address_line1: '123 St', city: 'Delhi', state: 'Delhi', pincode: '110001', phone: '9876543210'
    }
  }, customerSession);
  console.log(`6c. Invalid quantity validation -> Status: ${res.status}`);
  console.log(res.status === 400 ? '   Result: PASS' : '   Result: FAIL');

  console.log('\n=== TEST COMPLETE ===');
}

runTests().catch(console.error);
