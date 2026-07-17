// ========================================
// DEE'S DATA DEALS - CONFIRMATION PAGE
// ========================================

// ========== PAGE INITIALIZATION ==========
window.addEventListener('DOMContentLoaded', () => {
    console.log('=== CONFIRM PAGE LOADED ===');
    
    // Get DOM elements
    const validationMsg = document.getElementById('validation-msg');
    const loadingMsg = document.getElementById('loading-msg');
    const submitBtn = document.getElementById('submit-btn');
    const recipientInput = document.getElementById('recipient');
    const envConfig = (window.__ENV__ && typeof window.__ENV__ === 'object') ? window.__ENV__ : {};
    const formspreeEndpoint = envConfig.FORMSPREE_ENDPOINT || '';
    const orderRecipientEmail = envConfig.ORDER_RECIPIENT_EMAIL || '';

    console.log('DOM Elements found:', {
        validationMsg: !!validationMsg,
        loadingMsg: !!loadingMsg,
        submitBtn: !!submitBtn,
        recipientInput: !!recipientInput
    });

    // CHECK: Payment must be verified
    const paymentVerified = JSON.parse(localStorage.getItem('paymentVerified'));
    
    if (!paymentVerified || paymentVerified.status !== 'confirmed') {
        console.error('❌ PAYMENT NOT VERIFIED - Redirecting to home');
        showValidationMessage('Payment not verified. Redirecting home...', false, validationMsg);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    console.log('✅ Payment verified - Reference:', paymentVerified.reference);

    // Load payment data from localStorage
    const paymentData = JSON.parse(localStorage.getItem('paymentData'));

    if (!paymentData) {
        console.error('❌ NO PAYMENT DATA - Redirecting to home');
        showValidationMessage('No payment data found. Redirecting home...', false, validationMsg);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    console.log('✅ Payment data loaded:', paymentData);

    // Display order summary
    displayOrderSummary(paymentData);

    // Setup submit button
    if (submitBtn) {
        console.log('✅ Submit button found - Setting up click handler');
        submitBtn.style.display = 'block';
        submitBtn.style.visibility = 'visible';
        submitBtn.style.opacity = '1';
        submitBtn.addEventListener('click', () => {
            console.log('📤 SUBMIT BUTTON CLICKED');
            handleSubmitOrder(paymentData, recipientInput, validationMsg, loadingMsg, submitBtn);
        });
    } else {
        console.error('❌ SUBMIT BUTTON NOT FOUND');
    }

    // Focus on recipient input
    if (recipientInput) {
        setTimeout(() => {
            recipientInput.focus();
        }, 300);
    }

    hideValidationMessage(validationMsg);
    console.log('✅ Confirm page ready');
});

// ========== DISPLAY ORDER SUMMARY ==========
function displayOrderSummary(paymentData) {
    console.log('Displaying order summary:', paymentData);
    
    const confirmNetwork = document.getElementById('confirm-network');
    const confirmBundle = document.getElementById('confirm-bundle');
    const confirmAmount = document.getElementById('confirm-amount');
    const confirmEmail = document.getElementById('confirm-email');

    if (confirmNetwork) confirmNetwork.textContent = paymentData.network;
    if (confirmBundle) confirmBundle.textContent = paymentData.bundle;
    if (confirmAmount) confirmAmount.textContent = `₵${paymentData.amount.toFixed(2)}`;
    if (confirmEmail) confirmEmail.textContent = paymentData.email;

    console.log('✅ Order summary displayed');
}

// ========== SUBMIT ORDER ==========
function handleSubmitOrder(paymentData, recipientInput, validationMsg, loadingMsg, submitBtn) {
    console.log('=== SUBMIT ORDER INITIATED ===');
    
    const recipient = recipientInput.value.trim();
    console.log('Recipient entered:', recipient);
    console.log('Recipient length:', recipient.length);
    
    // ✔ VALIDATION: Must enter recipient before submission
    if (!recipient) {
        console.warn('❌ No recipient entered');
        showValidationMessage('❌ Please enter a recipient phone number', false, validationMsg);
        return;
    }

    if (recipient.length < 7) {
        console.warn('❌ Phone number too short:', recipient.length);
        showValidationMessage('❌ Please enter a valid phone number (at least 7 digits)', false, validationMsg);
        return;
    }

    console.log('✅ Validation passed');

    if (!formspreeEndpoint || !orderRecipientEmail) {
        showValidationMessage('Order configuration is missing. Please contact support.', false, validationMsg);
        return;
    }

    showLoadingMessage('📧 Sending your order...', loadingMsg);
    submitBtn.disabled = true;

    // ✔ Prepare payload
    const payload = {
        order_id: 'DEE_' + Math.floor(Math.random() * 1000000),
        network: paymentData.network,
        bundle: paymentData.bundle,
        email: paymentData.email,
        recipient_number: recipient,
        amount: paymentData.amount,
        _subject: `New Order: ${paymentData.bundle} - ${paymentData.network}`,
        _replyto: paymentData.email,
        _to: orderRecipientEmail
    };

    console.log('📧 Submitting to Formspree:', payload);

    // ✔ FORMSPREE SUBMISSION
    fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        console.log('✅ Response received - Status:', response.status);
        console.log('✅ Response OK:', response.ok);
        
        return response.json().then(data => {
            console.log('Response data:', data);
            return { status: response.status, ok: response.ok, data: data };
        });
    })
    .then(result => {
        if (result.ok) {
            console.log('✅ Order sent successfully!');
            hideLoadingMessage(loadingMsg);
            
            showValidationMessage(
                `✅ SUCCESS!\n\nOrder ID: ${payload.order_id}\n\nOrder submitted successfully!\n\nCheck your email at ${payload.email}`,
                true,
                validationMsg
            );
            
            // Clear localStorage and redirect
            localStorage.clear();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            throw new Error(`Server error: ${result.status} - ${JSON.stringify(result.data)}`);
        }
    })
    .catch(error => {
        console.error('❌ Error caught:', error);
        console.error('Error message:', error.message);
        hideLoadingMessage(loadingMsg);
        showValidationMessage(`❌ Failed to send order: ${error.message}`, false, validationMsg);
        submitBtn.disabled = false;
    });
}

// ========== MESSAGE HANDLERS ==========
function showValidationMessage(msg, isSuccess = false, element = null) {
    if (!element) {
        element = document.getElementById('validation-msg');
    }
    if (element) {
        // Convert \n to <br> for proper line breaks
        const formattedMsg = msg.replace(/\n/g, '<br>');
        element.innerHTML = formattedMsg;
        element.classList.remove('hidden', 'success');
        if (isSuccess) {
            element.classList.add('success');
        }
        console.log('✅ Message displayed:', msg);
    } else {
        console.error('❌ Validation message element not found');
    }
}

function hideValidationMessage(element = null) {
    if (!element) {
        element = document.getElementById('validation-msg');
    }
    if (element) {
        element.classList.add('hidden');
    }
}

function showLoadingMessage(msg, element = null) {
    if (!element) {
        element = document.getElementById('loading-msg');
    }
    if (element) {
        element.textContent = msg;
        element.classList.remove('hidden');
    }
}

function hideLoadingMessage(element = null) {
    if (!element) {
        element = document.getElementById('loading-msg');
    }
    if (element) {
        element.classList.add('hidden');
    }
}
