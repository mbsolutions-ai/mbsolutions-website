// MB Solutions AI - Stripe Payment Integration
// Include this script on any page with payment buttons

class MBStripePayments {
  constructor(apiUrl = 'https://your-server-url.com') {
    this.apiUrl = apiUrl;
    this.stripe = null;
  }

  // Initialize Stripe
  async init(publishableKey) {
    this.stripe = Stripe(publishableKey);
  }

  // ============================================
  // 1. PAY SETUP FEE (One-time payment)
  // ============================================
  async paySetupFee(options) {
    const {
      amount = 50000, // $500 in cents
      clientName,
      clientEmail,
      businessName,
      successUrl,
      cancelUrl,
      onSuccess,
      onError
    } = options;

    try {
      const response = await fetch(`${this.apiUrl}/create-setup-fee-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          clientName,
          clientEmail,
          businessName,
          successUrl,
          cancelUrl
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Setup fee payment error:', error);
      if (onError) onError(error);
      alert('Something went wrong. Please try again or contact us.');
    }
  }

  // ============================================
  // 2. SUBSCRIBE TO MONTHLY PLAN
  // ============================================
  async subscribeToPlan(options) {
    const {
      plan = 'starter', // starter, pro, business
      clientName,
      clientEmail,
      businessName,
      successUrl,
      cancelUrl,
      onSuccess,
      onError
    } = options;

    try {
      const response = await fetch(`${this.apiUrl}/create-subscription-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          clientName,
          clientEmail,
          businessName,
          successUrl,
          cancelUrl
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create subscription session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      if (onError) onError(error);
      alert('Something went wrong. Please try again or contact us.');
    }
  }

  // ============================================
  // 3. BOOK & PAY (Individual service)
  // ============================================
  async bookAndPay(options) {
    const {
      amount, // Amount in cents (required)
      serviceName,
      serviceDescription,
      clientName,
      clientEmail,
      bookingDate,
      bookingTime,
      successUrl,
      cancelUrl,
      onSuccess,
      onError
    } = options;

    if (!amount) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/create-booking-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          serviceName,
          serviceDescription,
          clientName,
          clientEmail,
          bookingDate,
          bookingTime,
          successUrl,
          cancelUrl
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create booking payment');
      }
    } catch (error) {
      console.error('Booking payment error:', error);
      if (onError) onError(error);
      alert('Something went wrong. Please try again or contact us.');
    }
  }

  // ============================================
  // 4. CHECK SESSION STATUS (for success page)
  // ============================================
  async getSessionStatus(sessionId) {
    try {
      const response = await fetch(`${this.apiUrl}/session-status?session_id=${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('Error checking session status:', error);
      return null;
    }
  }
}

// Global instance
const mbPayments = new MBStripePayments();

// ============================================
// HELPER FUNCTIONS FOR EASY BUTTON SETUP
// ============================================

// Setup fee button handler
function setupPayButton(buttonId, options) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Get values from form fields if they exist
    const clientName = document.getElementById(options.nameField || 'clientName')?.value || options.clientName;
    const clientEmail = document.getElementById(options.emailField || 'clientEmail')?.value || options.clientEmail;
    const businessName = document.getElementById(options.businessField || 'businessName')?.value || options.businessName;

    mbPayments.paySetupFee({
      amount: options.amount || 50000,
      clientName,
      clientEmail,
      businessName,
      successUrl: options.successUrl,
      cancelUrl: options.cancelUrl
    });
  });
}

// Subscription button handler
function setupSubscribeButton(buttonId, plan, options = {}) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    const clientName = document.getElementById(options.nameField || 'clientName')?.value || options.clientName;
    const clientEmail = document.getElementById(options.emailField || 'clientEmail')?.value || options.clientEmail;
    const businessName = document.getElementById(options.businessField || 'businessName')?.value || options.businessName;

    mbPayments.subscribeToPlan({
      plan,
      clientName,
      clientEmail,
      businessName,
      successUrl: options.successUrl,
      cancelUrl: options.cancelUrl
    });
  });
}

// Book & Pay button handler
function setupBookPayButton(buttonId, options) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    const amount = parseInt(document.getElementById(options.amountField || 'amount')?.value) || options.amount;
    const clientName = document.getElementById(options.nameField || 'clientName')?.value || options.clientName;
    const clientEmail = document.getElementById(options.emailField || 'clientEmail')?.value || options.clientEmail;
    const bookingDate = document.getElementById(options.dateField || 'bookingDate')?.value;
    const bookingTime = document.getElementById(options.timeField || 'bookingTime')?.value;

    mbPayments.bookAndPay({
      amount,
      serviceName: options.serviceName,
      serviceDescription: options.serviceDescription,
      clientName,
      clientEmail,
      bookingDate,
      bookingTime,
      successUrl: options.successUrl,
      cancelUrl: options.cancelUrl
    });
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MBStripePayments, setupPayButton, setupSubscribeButton, setupBookPayButton };
}
