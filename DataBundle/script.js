// ========================================
// DEE'S DATA DEALS - MAIN SCRIPT
// ========================================

// Bundle data by network
const bundleData = {
    MTN: [
        { size: '1GB', price: 5.50 },
        { size: '2GB', price: 9.35 },
        { size: '3GB', price: 13.50 },
        { size: '4GB', price: 17.50 },
        { size: '5GB', price: 22.50 },
        { size: '6GB', price: 25.50 },
        { size: '7GB', price: 29.50 },
        { size: '8GB', price: 35.00 },
        { size: '10GB', price: 42.35 },
        { size: '15GB', price: 69.50 },
        { size: '20GB', price: 79.00 },
        { size: '25GB', price: 99.00 },
        { size: '30GB', price: 118.50 },
        { size: '40GB', price: 157.00 },
        { size: '50GB', price: 194.00 }
    ],
    AirtelTigo: [
        { size: '1GB', price: 4.75 },
        { size: '2GB', price: 8.60 },
        { size: '3GB', price: 12.50 },
        { size: '4GB', price: 16.50 },
        { size: '5GB', price: 20.00 },
        { size: '6GB', price: 23.50 },
        { size: '7GB', price: 27.00 },
        { size: '8GB', price: 32.00 },
        { size: '9GB', price: 35.75 },
        { size: '10GB', price: 39.50 },
        { size: '12GB', price: 47.00 },
        { size: '15GB', price: 58.00 },
        { size: '20GB', price: 77.00 }
    ],
    Telecel: [
        { size: '10GB', price: 38.00 },
        { size: '15GB', price: 54.50 },
        { size: '20GB', price: 73.00 },
        { size: '25GB', price: 90.00 },
        { size: '30GB', price: 107.00 },
        { size: '40GB', price: 142.00 },
        { size: '50GB', price: 177.00 },
        { size: '100GB', price: 350.00 }
    ]
};

// Store selected data
let selectedData = {
    network: null,
    bundle: null,
    amount: null
};

// DOM Elements - Payment Form
const networkSelect = document.getElementById('network');
const bundleSelect = document.getElementById('bundle');
const emailInput = document.getElementById('email');
const payBtn = document.getElementById('pay-btn');
const bundlesContainer = document.getElementById('bundles-container');
const bundlesTitle = document.getElementById('bundles-title');
const planSummary = document.getElementById('plan-summary');
const validationMsg = document.getElementById('validation-msg');
const envConfig = (window.__ENV__ && typeof window.__ENV__ === 'object') ? window.__ENV__ : {};
const paystackPublicKey = envConfig.PAYSTACK_PUBLIC_KEY || '';

// ========== EVENT LISTENERS ==========
networkSelect.addEventListener('change', handleNetworkChange);
bundleSelect.addEventListener('change', handleBundleChange);
emailInput.addEventListener('input', validateForm);
payBtn.addEventListener('click', handlePayment);

// ========== NETWORK SELECTION ==========
function handleNetworkChange(e) {
    const network = e.target.value;
    selectedData.network = network || null;
    
    if (!network) {
        // Reset bundles
        bundleSelect.innerHTML = '<option value="">Select a bundle...</option>';
        bundleSelect.disabled = true;
        bundlesContainer.innerHTML = '';
        bundlesTitle.textContent = 'Select a network to see bundles';
        document.getElementById('network-logo').classList.add('hidden');
        planSummary.classList.add('hidden');
        selectedData.bundle = null;
        selectedData.amount = null;
        validateForm();
        return;
    }

    // Show network logo
    const networkLogo = document.getElementById('network-logo');
    const logos = {
        'MTN': 'mtn.png',
        'AirtelTigo': 'airteltigo.png',
        'Telecel': 'Tele.png'
    };
    
    networkLogo.src = logos[network];
    networkLogo.classList.remove('hidden');

    // Populate bundle dropdown
    const bundles = bundleData[network];
    bundleSelect.innerHTML = '<option value="">Select a bundle...</option>';
    bundles.forEach(bundle => {
        const option = document.createElement('option');
        option.value = bundle.size;
        option.textContent = `${bundle.size} - ₵${bundle.price.toFixed(2)}`;
        option.dataset.price = bundle.price;
        bundleSelect.appendChild(option);
    });
    bundleSelect.disabled = false;

    // Display bundles visually
    displayBundles(network);
    bundlesTitle.textContent = `${network} Bundles`;

    // Reset selection
    selectedData.bundle = null;
    selectedData.amount = null;
    planSummary.classList.add('hidden');
    validateForm();
}

// ========== DISPLAY BUNDLES ==========
function displayBundles(network) {
    const bundles = bundleData[network];
    bundlesContainer.innerHTML = '';

    bundles.forEach(bundle => {
        const bundleElement = document.createElement('div');
        bundleElement.className = 'bundle-item';
        bundleElement.innerHTML = `
            <div class="bundle-size">${bundle.size}</div>
            <div class="bundle-price">₵${bundle.price.toFixed(2)}</div>
        `;

        bundleElement.addEventListener('click', () => {
            selectBundle(network, bundle.size, bundle.price);
        });

        bundlesContainer.appendChild(bundleElement);
    });
}

// ========== BUNDLE SELECTION ==========
function selectBundle(network, size, price) {
    selectedData.bundle = size;
    selectedData.amount = price;
    selectedData.network = network;

    // Update dropdown
    bundleSelect.value = size;

    // Highlight selected bundle
    document.querySelectorAll('.bundle-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.bundle-item').classList.add('selected');

    // Update plan summary
    updatePlanSummary();
    validateForm();
}

function handleBundleChange(e) {
    const bundle = e.target.value;
    if (!bundle) {
        selectedData.bundle = null;
        selectedData.amount = null;
        planSummary.classList.add('hidden');
        document.querySelectorAll('.bundle-item').forEach(item => {
            item.classList.remove('selected');
        });
        validateForm();
        return;
    }

    const network = selectedData.network;
    const bundles = bundleData[network];
    const selected = bundles.find(b => b.size === bundle);

    if (selected) {
        selectedData.bundle = bundle;
        selectedData.amount = selected.price;
        updatePlanSummary();

        // Highlight the bundle in the visual grid
        const bundleItems = document.querySelectorAll('.bundle-item');
        bundleItems.forEach(item => {
            if (item.querySelector('.bundle-size').textContent === bundle) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    validateForm();
}

// ========== UPDATE PLAN SUMMARY ==========
function updatePlanSummary() {
    if (selectedData.network && selectedData.bundle && selectedData.amount) {
        document.getElementById('summary-network').textContent = selectedData.network;
        document.getElementById('summary-bundle').textContent = selectedData.bundle;
        document.getElementById('summary-amount').textContent = `₵${selectedData.amount.toFixed(2)}`;
        planSummary.classList.remove('hidden');
    }
}

// ========== VALIDATION ==========
function validateForm() {
    const email = emailInput.value.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isFormValid =
        selectedData.network &&
        selectedData.bundle &&
        isValidEmail;

    payBtn.disabled = !isFormValid;

    // Show validation message
    if (!isFormValid && (email || selectedData.bundle)) {
        showValidationMessage('Please fill in all fields correctly', false);
    } else {
        hideValidationMessage();
    }
}

function showValidationMessage(msg, isSuccess = false) {
    validationMsg.textContent = msg;
    validationMsg.classList.remove('hidden', 'success');
    if (isSuccess) {
        validationMsg.classList.add('success');
    }
}

function hideValidationMessage() {
    validationMsg.classList.add('hidden');
}

// ========== PAYSTACK PAYMENT ==========
function handlePayment() {
    console.log('=== PAYMENT INITIATED ===');
    console.log('Network:', selectedData.network);
    console.log('Bundle:', selectedData.bundle);
    console.log('Amount:', selectedData.amount);
    console.log('Email:', emailInput.value);

    // Save payment data to localStorage before opening Paystack
    const paymentData = {
        network: selectedData.network,
        bundle: selectedData.bundle,
        amount: selectedData.amount,
        email: emailInput.value.trim()
    };
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    console.log('💾 Payment data saved to localStorage:', paymentData);

    if (!paystackPublicKey) {
        showValidationMessage('Payment configuration is missing. Please contact support.', false);
        return;
    }

    const paymentRef = 'DEE_' + Math.floor(Math.random() * 10000000);
    
    // Get the current page URL to build absolute redirect URL
    const currentPageUrl = window.location.href;
    const baseUrl = currentPageUrl.substring(0, currentPageUrl.lastIndexOf('/') + 1);
    const confirmPageUrl = baseUrl + 'confirm.html';

    const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: emailInput.value.trim(),
        amount: Math.round(selectedData.amount * 100), // Convert to kobo
        currency: 'GHS',
        ref: paymentRef,
        redirectUrl: confirmPageUrl, // ✅ ABSOLUTE URL TO CONFIRM PAGE
        
        onClose: function() {
            console.log('❌ Payment dialog closed');
            showValidationMessage('Payment not completed. Please try again.', false);
        },
        
        onSuccess: function(response) {
            console.log('✅ PAYMENT CONFIRMED - onSuccess fired');
            console.log('Reference:', response.reference);
            
            // ✅ VERIFY PAYMENT AND SAVE VERIFICATION DETAILS BEFORE REDIRECT
            verifyPaymentAndRedirect(response.reference, paymentRef);
        }
    });

    console.log('🔘 Opening Paystack payment dialog...');
    console.log('📍 Redirect URL:', confirmPageUrl);
    handler.openIframe();
}

// ========== VERIFY PAYMENT AND REDIRECT ==========
function verifyPaymentAndRedirect(reference, paymentRef) {
    console.log('=== VERIFYING PAYMENT ===');
    console.log('Reference:', reference);
    
    // Save payment verification details to localStorage
    localStorage.setItem('paymentVerified', JSON.stringify({
        reference: reference,
        paymentRef: paymentRef,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
    }));
    
    console.log('✅ Payment verified and saved');
    console.log('🔄 Redirecting to confirmation page...');
    
    // Redirect to confirm page after payment is confirmed
    setTimeout(() => {
        window.location.href = 'confirm.html';
    }, 500);
}

// ========== INITIALIZE ==========
window.addEventListener('load', () => {
    validationMsg.classList.add('hidden');
});
