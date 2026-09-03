
import { apiRequest } from './api';

/**
 * Razorpay Service for Prisha Enterprises
 * Handles payment initialization, verification, and order management
 *
 * IMPORTANT:
 * - RAZORPAY_KEY_ID is safe to use in frontend.
 * - RAZORPAY_KEY_SECRET MUST NEVER be used in frontend.
 * - Razorpay Key Secret must remain on the backend.
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Debug configuration (development only)
 */
if (import.meta.env.DEV) {
  console.log('Razorpay Key ID:', RAZORPAY_KEY_ID ? 'configured' : 'missing');
  console.log('API URL:', API_URL);
}

if (!RAZORPAY_KEY_ID) {
  console.error(
    '❌ Razorpay Key ID is missing!\n' +
    'Make sure frontend/.env contains:\n' +
    'VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx'
  );
}

/**
 * Load Razorpay SDK dynamically
 */
const loadRazorpaySDK = () => {
  return new Promise((resolve, reject) => {
    // SDK already loaded
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          reject(new Error('Razorpay SDK loaded but Razorpay is unavailable'));
        }
      });

      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Razorpay SDK'));
      });

      return;
    }

    // Load SDK
    const script = document.createElement('script');

    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve(window.Razorpay);
      } else {
        reject(
          new Error('Razorpay SDK loaded but window.Razorpay is unavailable')
        );
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Razorpay SDK'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Safely parse API response
 *
 * This helps diagnose errors such as:
 * Unexpected token '<', "<!DOCTYPE..."
 *
 * That error means the backend returned HTML instead of JSON.
 */
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await response.json();
  }

  const text = await response.text();

  console.error('❌ API returned non-JSON response:');
  console.error('Status:', response.status);
  console.error('Response:', text);

  throw new Error(
    `Server returned an invalid response (${response.status}). ` +
    `Expected JSON but received ${contentType || 'unknown content type'}.`
  );
};

/**
 * Create a Razorpay order via backend API
 */
export const createRazorpayOrder = async (
  items,
  shippingAddress,
  token
) => {
  try {
    if (!token) {
      throw new Error('Authentication token is missing. Please login again.');
    }

    if (!items || items.length === 0) {
      throw new Error('No items found in cart.');
    }

    console.log('========================================');
    console.log('Creating Razorpay Order');
    console.log('========================================');
    console.log('API:', `${API_URL}/cart/checkout/create-order`);
    console.log('Items:', items);
    console.log('Shipping Address:', shippingAddress);
    console.log('========================================');

    const data = await apiRequest('/cart/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify({
        items,
        shippingAddress,
      }),
    });

    console.log('Create order response:', data);

    if (!data) {
      throw new Error('Empty response received from order API');
    }

    if (!data.order) {
      console.error('❌ Order missing from backend response:', data);

      throw new Error(
        data.message ||
        'Backend did not return a valid order'
      );
    }

    if (!data.order.razorpay_order_id) {
      console.error(
        '❌ Razorpay Order ID missing:',
        data.order
      );

      throw new Error(
        'Razorpay Order ID was not returned by the backend'
      );
    }

    console.log(
      '✅ Razorpay Order ID:',
      data.order.razorpay_order_id
    );

    return data;

  } catch (error) {
    console.error(
      '❌ Error creating Razorpay order:',
      error
    );

    throw error;
  }
};

/**
 * Verify payment signature via backend
 *
 * IMPORTANT:
 * Signature verification must happen on the backend.
 */
export const verifyPayment = async (
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  token
) => {
  try {
    if (!token) {
      throw new Error(
        'Authentication token is missing. Please login again.'
      );
    }

    if (!razorpayOrderId) {
      throw new Error('Razorpay Order ID is missing');
    }

    if (!razorpayPaymentId) {
      throw new Error('Razorpay Payment ID is missing');
    }

    if (!razorpaySignature) {
      throw new Error('Razorpay payment signature is missing');
    }

    console.log('========================================');
    console.log('Verifying Razorpay Payment');
    console.log('========================================');
    console.log('Application Order ID:', orderId);
    console.log('Razorpay Order ID:', razorpayOrderId);
    console.log('Razorpay Payment ID:', razorpayPaymentId);
    console.log('========================================');

    const data = await apiRequest('/cart/checkout/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    });

    console.log('Payment verification response:', data);

    return data;

  } catch (error) {
    console.error(
      '❌ Error verifying payment:',
      error
    );

    throw error;
  }
};

/**
 * Initialize Razorpay payment
 */
export const initializePayment = async (options) => {
  try {
    console.log('========================================');
    console.log('Initializing Razorpay Checkout');
    console.log('========================================');

    // Make sure Key ID exists
    if (!RAZORPAY_KEY_ID) {
      throw new Error(
        'Razorpay Key ID is missing. ' +
        'Check VITE_RAZORPAY_KEY_ID in frontend/.env and restart Vite.'
      );
    }

    // Make sure it looks like a Razorpay key
    if (
      !RAZORPAY_KEY_ID.startsWith('rzp_test_') &&
      !RAZORPAY_KEY_ID.startsWith('rzp_live_')
    ) {
      console.warn(
        '⚠️ Razorpay Key ID does not look like a standard Razorpay key:',
        RAZORPAY_KEY_ID
      );
    }

    // Load Razorpay SDK
    const Razorpay = await loadRazorpaySDK();

    if (!Razorpay) {
      throw new Error('Razorpay SDK is unavailable');
    }

    if (!options.orderId) {
      throw new Error(
        'Razorpay Order ID is missing'
      );
    }

    if (!options.amount) {
      throw new Error(
        'Payment amount is missing'
      );
    }

    /**
     * IMPORTANT:
     *
     * Razorpay expects amount in paise.
     *
     * Your backend should ideally return:
     *
     * order.amount = amount in paise
     *
     * Example:
     * ₹7,500 = 750000 paise
     *
     * If your backend returns rupees instead, use:
     *
     * amount: options.amount * 100
     *
     * The current implementation assumes your backend
     * follows Razorpay's standard order response and
     * returns amount in paise.
     */
    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,

      amount: options.amount,

      currency: options.currency || 'INR',

      name: options.name || 'Prisha Enterprises',

      description:
        options.description || 'Purchase',

      order_id: options.orderId,

      handler: async (response) => {
        console.log(
          '✅ Razorpay payment completed:',
          response
        );

        if (options.handler) {
          await options.handler(response);
        }
      },

      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },

      theme: {
        color:
          options.theme?.color || '#1E40AF',
      },

      modal: {
        ondismiss: () => {
          console.log(
            'Razorpay checkout dismissed'
          );

          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },

      retry: {
        enabled: true,
        max_count: 4,
      },
    };

    console.log(
      'Razorpay Checkout Options:',
      {
        ...razorpayOptions,
        key: `${RAZORPAY_KEY_ID.substring(0, 12)}...`,
      }
    );

    /**
     * Initialize Razorpay
     */
    const rzp = new Razorpay(
      razorpayOptions
    );

    /**
     * Razorpay payment failure event
     */
    rzp.on(
      'payment.failed',
      (response) => {
        console.error(
          '❌ Razorpay payment failed:',
          response
        );

        const errorMessage =
          response?.error?.description ||
          response?.error?.reason ||
          'Payment failed';

        if (options.onError) {
          options.onError(errorMessage);
        }
      }
    );

    /**
     * Open Razorpay Checkout
     */
    rzp.open();

    console.log(
      '✅ Razorpay Checkout opened'
    );

    return rzp;

  } catch (error) {
    console.error(
      '❌ Error initializing payment:',
      error
    );

    throw error;
  }
};

/**
 * Process a complete payment flow
 */
export const processPayment = async ({
  items,
  shippingAddress,
  token,
  onSuccess,
  onError,
}) => {
  try {
    console.log('========================================');
    console.log('Starting Payment Process');
    console.log('========================================');

    /**
     * Validate Key ID before doing anything
     */
    if (!RAZORPAY_KEY_ID) {
      const error =
        'Razorpay Key ID is missing. ' +
        'Please check VITE_RAZORPAY_KEY_ID in frontend/.env';

      console.error('❌', error);

      onError?.(error);

      throw new Error(error);
    }

    /**
     * Validate authentication
     */
    if (!token) {
      const error =
        'Authentication token is missing. Please login again.';

      console.error('❌', error);

      onError?.(error);

      throw new Error(error);
    }

    /**
     * Validate cart
     */
    if (!items || items.length === 0) {
      const error =
        'Your cart is empty.';

      console.error('❌', error);

      onError?.(error);

      throw new Error(error);
    }

    /**
     * STEP 1
     *
     * Create order through backend.
     */
    console.log(
      'STEP 1: Creating backend/Razorpay order...'
    );

    const orderData =
      await createRazorpayOrder(
        items,
        shippingAddress,
        token
      );

    console.log(
      '✅ Backend order created:',
      orderData
    );

    /**
     * Validate order data
     */
    if (!orderData.order) {
      throw new Error(
        'Invalid order response from backend'
      );
    }

    if (
      !orderData.order.razorpay_order_id
    ) {
      throw new Error(
        'Backend did not return razorpay_order_id'
      );
    }

    if (
      orderData.order.amount === undefined ||
      orderData.order.amount === null
    ) {
      throw new Error(
        'Backend did not return order amount'
      );
    }

    /**
     * STEP 2
     *
     * Open Razorpay Checkout.
     */
    console.log(
      'STEP 2: Opening Razorpay Checkout...'
    );

    const rzp =
      await initializePayment({
        /**
         * Razorpay's order.amount is normally
         * already in paise.
         */
        amount:
          orderData.order.amount,

        orderId:
          orderData.order.razorpay_order_id,

        currency:
          orderData.order.currency || 'INR',

        name:
          'Prisha Enterprises',

        description:
          'LED TV Purchase',

        prefill: {
          name:
            orderData.user?.name || '',

          email:
            orderData.user?.email || '',

          contact:
            orderData.user?.phone || '',
        },

        theme: {
          color: '#1E40AF',
        },

        /**
         * STEP 3
         *
         * Razorpay calls this after successful payment.
         */
        handler: async (response) => {
          try {
            console.log(
              '========================================'
            );
            console.log(
              'STEP 3: Payment successful, verifying...'
            );
            console.log(
              '========================================'
            );

            console.log(
              'Razorpay response:',
              response
            );

            /**
             * Verify payment on backend
             */
            const verifyData =
              await verifyPayment(
                orderData.order.id,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                token
              );

            console.log(
              'Verification result:',
              verifyData
            );

            if (verifyData.success) {
              console.log(
                '✅ Payment verified successfully'
              );

              onSuccess?.(verifyData);
            } else {
              const error =
                verifyData.message ||
                'Payment verification failed';

              console.error(
                '❌ Payment verification failed:',
                error
              );

              onError?.(error);
            }

          } catch (verifyError) {
            console.error(
              '❌ Payment verification error:',
              verifyError
            );

            onError?.(
              verifyError.message ||
              'Payment verification failed'
            );
          }
        },

        /**
         * User closes Razorpay Checkout.
         */
        onDismiss: () => {
          console.log(
            'Razorpay Checkout dismissed'
          );

          onError?.(
            'Payment cancelled'
          );
        },

        /**
         * Razorpay payment failure callback.
         */
        onError: (error) => {
          console.error(
            '❌ Razorpay payment failed:',
            error
          );

          onError?.(
            error ||
            'Payment failed'
          );
        },
      });

    console.log(
      '========================================'
    );
    console.log(
      'Payment flow initialized successfully'
    );
    console.log(
      '========================================'
    );

    return rzp;

  } catch (error) {
    console.error(
      '❌ Payment processing failed:',
      error
    );

    onError?.(
      error.message ||
      'Payment processing failed'
    );

    throw error;
  }
};

export default {
  createRazorpayOrder,
  verifyPayment,
  initializePayment,
  processPayment,
};

