// Global variables
let currentStep = 1;
let currentDate = new Date();
let selectedService = '';
let selectedServices = [];
let currentSchedulingService = null;
let serviceConfigurations = null; // Added to store fetched configurations

// Create a currentMonth variable since it's used in some functions but might be undefined
let currentMonth = currentDate; // Use existing currentDate variable

// Service prices
const servicePrices = {
    'housekeeping': {
        base: 125, // Kitchen ($40) + Living Room ($35) + Dining Room ($30) + Hallway ($20)
        bedrooms: {
            '1': 35,
            '2': 70,
            '3': 105,
            '4': 140,
            '5': 175
        },
        bathrooms: {
            '1': 30,
            '2': 60,
            '3': 90,
            '4': 120,
            '5': 150
        },
        cleaningType: {
            'standard': 1,
            'deep': 1.5,
            'move-in-out': 2
        }
    },
    'lawn-care': {
        base: 50, // Small lawn price
        lawnSize: {
            'small': 50,
            'medium': 75,
            'large': 100,
            'xlarge': 150
        },
        serviceType: {
            'mowing': 0,
            'full': 30,
            'cleanup': 50
        }
    },
    'pool-service': {
        base: 60, // Small pool price
        poolSize: {
            'small': 60,
            'medium': 100,
            'large': 140
        },
        poolType: {
            'in-ground': 20,
            'above-ground': 0
        },
        serviceType: {
            'cleaning': 0,
            'maintenance': 40,
            'repair': 80
        }
    }
};

// Current prices for each service
let currentPrices = {};
let totalPrice = 0;
let selectedDates = {};
let selectedTimes = {};

// Placeholder for service ID mapping - adjust based on your services table
const serviceKeyToIdMap = {
    'housekeeping': 1, // Standard House Cleaning
    'lawn-care': 4,    // Lawn Mowing
    'pool-service': 7  // Regular Pool Cleaning
    // Add other services if any
};

// Initialize Stripe
// const stripe = Stripe('your_stripe_publishable_key'); // Commented out or to be handled within DOMContentLoaded
// const elements = stripe.elements(); // Commented out

// Create card element
// const card = elements.create('card'); // Commented out
// card.mount('#card-element'); // Commented out

// Document ready function
document.addEventListener('DOMContentLoaded', async function() {
    // Add a global flag to prevent multiple alerts/redirects
    window.emailCheckInProgress = false;
    window.emailValidationErrorActive = false;
    
    // Fetch service configurations
    try {
        const response = await fetch('assets/php/get_service_configurations.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const configData = await response.json();
        if (configData.success) {
            serviceConfigurations = configData.configurations;
            // console.log('Service configurations loaded:', serviceConfigurations);
            // Now that configurations are loaded, populate the forms
            populateServiceFormsFromConfig();
        } else {
            console.error('Failed to load service configurations:', configData.message);
        }
    } catch (e) {
        console.error("Error fetching service configurations:", e);
    }
    
    // Initialize Stripe and card element here
    try {
        const stripe = Stripe('pk_test_51QYa5WGhSQCacuRewyp6fwxtc4vMLwkzDywAXIfVDRvlHCkRF6vjBFf3aTISrbmlLbiPjeHijIMHgBiLQbWlzo8j00aeLOIJ9p'); // Replace with your actual publishable key
        const elements = stripe.elements();
        const cardElement = document.getElementById('card-element');
        if (cardElement) {
            const card = elements.create('card');
            card.mount(cardElement);
        } else {
            console.warn('Stripe card element #card-element not found on DOMContentLoaded. Payment form might not render correctly.');
        }
    } catch (e) {
        console.error("Error initializing Stripe card element:", e);
    }
    
    // Initialize the form
    initializeForm();
    
    // Check for address in localStorage (old version) or sessionStorage (new version)
    checkForAddress();
    
    // Generate calendar
    generateCalendar(currentDate);
    
    // Disable next button initially (only for form navigation buttons)
    document.querySelectorAll('#multi-step-form .btn-next').forEach(button => {
        // Specific handling for step 1 button if needed, or general disable
        // if (button.closest('.form-page').id === 'page1') { 
        //    button.disabled = true;
        // }
    });
    
    // Event listeners
    setupEventListeners();
});

// Initialize the form
function initializeForm() {
    // Reset all selections
    document.querySelectorAll('.service-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Hide all service forms
    document.querySelectorAll('.service-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Reset service summary
    document.getElementById('service-summary-items').innerHTML = '';
    document.getElementById('total-price').textContent = '$0.00';
    
    // Reset schedule summary
    document.getElementById('schedule-summary-items').innerHTML = '';
    
    // Reset the service tabs
    document.getElementById('service-tabs').innerHTML = '';
    
    // Reset selected services
    selectedServices = [];
    currentPrices = {};
}

// Check for address in storage
function checkForAddress() {
    // Try localStorage (old method) first
    const localStorageData = localStorage.getItem('serviceAddress');
    // Try sessionStorage (new method) 
    const sessionStorageData = sessionStorage.getItem('userAddress');

    // Check sessionStorage first (newer method)
    if (sessionStorageData) {
        const address = JSON.parse(sessionStorageData);
        
        // Display address confirmation modal
        const modalAddress = document.getElementById('modal-address');
        modalAddress.innerHTML = `
            <p>${address.street}</p>
            <p>${address.city}, ${address.state} ${address.zipcode}</p>
        `;
        
        // Show the modal
        document.getElementById('address-confirm-modal').style.display = 'block';
        
        // Update summary address
        document.getElementById('summary-address').textContent = 
            `${address.street}, ${address.city}, ${address.state} ${address.zipcode}`;
        
        // Disable the form while modal is showing
        const form = document.getElementById('multi-step-form');
        if (form) {
            form.style.pointerEvents = 'none';
            form.style.opacity = '0.5';
        }
        
        // Clear localStorage if both are present (to avoid conflicts)
        if (localStorageData) {
            localStorage.removeItem('serviceAddress');
        }
        
        return;
    }
    
    // Fall back to localStorage if sessionStorage is empty
    if (localStorageData) {
        const addressData = JSON.parse(localStorageData || '{}');
        if (addressData && addressData.street) {
            const formattedAddress = `${addressData.street}, ${addressData.city}, ${addressData.state} ${addressData.zipcode}`;
            document.getElementById('modal-address').textContent = formattedAddress;
            document.getElementById('summary-address').textContent = formattedAddress;
            
            // Show modal when page loads
            document.getElementById('address-confirm-modal').style.display = 'block';
            
            // Disable the form while modal is showing
            const form = document.getElementById('multi-step-form');
            if (form) {
                form.style.pointerEvents = 'none';
                form.style.opacity = '0.5';
            }
            
            // Also save to sessionStorage for consistency
            const addressObject = {
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                zipcode: addressData.zipcode
            };
            sessionStorage.setItem('userAddress', JSON.stringify(addressObject));
            
            return;
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // This is handled by inline onclick handlers in the HTML
}

// Toggle service selection for multiple services
function toggleServiceSelection(element, service) {
    // Toggle selected class
    element.classList.toggle('selected');
    
    // Toggle checkbox
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    
    // Update selected services array
    if (checkbox.checked) {
        selectedServices.push(service);
    } else {
        const index = selectedServices.indexOf(service);
        if (index > -1) {
            selectedServices.splice(index, 1);
        }
    }
    
    // Update validation for next step
    const nextButton = document.querySelector('.btn-next');
    if (nextButton) {
        nextButton.disabled = selectedServices.length === 0;
    }
}

// Get the current step
function getCurrentStep() {
    const activePage = document.querySelector('.form-page.active');
    return activePage ? parseInt(activePage.id.replace('page', '')) : 1;
}

// Modified nextStep function for multi-step form
function nextStep(step) {
    // Validate current step
    if (step === 1) {
        // Validate personal information
        const requiredFields = ['full-name', 'email', 'phone'];
        for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                alert('Please fill in all required fields.');
                return;
            }
        }
        
        // Validate email format
        const email = document.getElementById('email').value;
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Validate service selection
        if (selectedServices.length === 0) {
            alert('Please select at least one service to continue.');
            return;
        }

        // Get PHP session_id from session storage (saved during address entry)
        const addressData = JSON.parse(sessionStorage.getItem('addressData') || '{}');
        const phpSessionId = addressData.session_id; // Changed from leadId

        // console.log('[nextStep(1)] Retrieved addressData from sessionStorage:', addressData); // DEBUG
        // console.log('[nextStep(1)] phpSessionId value:', phpSessionId); // DEBUG

        if (phpSessionId) { // Check if phpSessionId is available
            // Update the lead with contact information
            const fullName = document.getElementById('full-name').value.trim();
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            const leadData = {
                session_id: phpSessionId, // Send phpSessionId instead of lead_id
                first_name: firstName,
                last_name: lastName,
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim()
            };

            // console.log('Attempting to update lead with data:', JSON.stringify(leadData)); // Added console log
            // Send lead data to server
            fetch('assets/php/update_lead.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leadData)
            })
            .then(response => response.json()) // Add this to parse the JSON response
            .then(data => { // Add this to log the data from PHP
                // console.log('[update_lead.php] Response:', data);
            })
            .catch(error => {
                console.error('Error updating lead:', error);
            });
        }
        
        // Generate service tabs
        const allServicesConfigured = generateServiceTabs();
        
        if (!allServicesConfigured) {
            // generateServiceTabs or its sub-functions would have alerted the specific issue
            return; // Prevent moving to next step
        }
        
        // Initialize service prices
        initializeServicePrices();
        
        // Update service summary
        updateServiceSummary();
    } else if (step === 2) {
        // Generate service selection boxes for step 3
        generateServiceSelectionBoxes();
        
        // Set the first service as active for scheduling
        if (selectedServices.length > 0) {
            switchScheduleTab(selectedServices[0]);
        }
        
        // Update order summary
        updateOrderSummary();
        
        // Update the schedule summary when entering step 3
        updateScheduleSummary();
    } else if (step === 3) {
        // Validate that all services have been scheduled
        let allServicesScheduled = true;
        
        selectedServices.forEach(service => {
            if (!selectedDates[service] || !selectedTimes[service]) {
                allServicesScheduled = false;
            }
        });
        
        if (!allServicesScheduled) {
            alert('Please schedule all services before continuing.');
            return;
        }
        
        // Update the appointment summary on the payment page
        updateAppointmentSummary();
    }
    
    // For debugging
    // console.log(`Moving from step ${currentStep} to step ${currentStep + 1}`);
    
    // Hide current step
    const currentPage = document.getElementById(`page${currentStep}`);
    if (currentPage) {
        currentPage.classList.remove('active');
    } else {
        console.error(`Could not find page${currentStep}`);
    }
    
    // Show next step
    currentStep++;
    const nextPage = document.getElementById(`page${currentStep}`);
    if (nextPage) {
        nextPage.classList.add('active');
    } else {
        console.error(`Could not find page${currentStep}`);
        // Fallback - try to go back to previous step
        currentStep--;
        document.getElementById(`page${currentStep}`).classList.add('active');
    }
    
    // Update step indicators if they exist
    try {
        if (document.getElementById(`step${step}`)) {
            document.getElementById(`step${step}`).classList.add('completed');
        }
        if (document.getElementById(`step${step+1}`)) {
            document.getElementById(`step${step+1}`).classList.add('active');
        }
    } catch (e) {
        // console.log("Step indicators not found, skipping update");
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Navigate to the previous step
function prevStep(currentStepNumber) {
    // Hide current step
    document.getElementById(`page${currentStepNumber}`).classList.remove('active');
    
    // Show previous step
    const prevStepNumber = currentStepNumber - 1;
    document.getElementById(`page${prevStepNumber}`).classList.add('active');
    
    // Update step indicators
    document.getElementById(`step${currentStepNumber}`).classList.remove('active');
    document.getElementById(`step${prevStepNumber}`).classList.add('active');
    document.getElementById(`step${currentStepNumber}`).classList.remove('completed');
    
    // Update current step tracker
    currentStep = prevStepNumber;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Validate email format
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Validate the current step (alternative validation function)
async function validateStep(step) {
    let isValid = true;
    // Clear previous errors
    document.querySelectorAll('.form-group .error-message').forEach(el => el.remove());

    if (step === 1) {
        const fullName = document.getElementById('full-name');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const selectedServicesCheckboxes = document.querySelectorAll('input[name="selected-services[]"]:checked');

        clearEmailError('email'); // Clear previous email error
        window.emailValidationErrorActive = false;

        if (!fullName.value.trim()) {
            showError(fullName, 'Full name is required.');
            isValid = false;
        }
        if (!email.value.trim()) {
            showError(email, 'Email address is required.');
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showError(email, 'Please enter a valid email address.');
            isValid = false;
        } else {
            // Perform live email check only if format is valid
            const emailCheckResult = await checkEmailExists(email.value.trim());
            if (emailCheckResult && emailCheckResult.emailExists) {
                displayEmailError('email', 'This email is already registered. Please <a href="login.html">login</a> or use a different email.');
                isValid = false;
                window.emailValidationErrorActive = true;
                // Do not proceed to updateLead if email is registered
                alert("This email address is already associated with a registered user account. Please sign in or use a different email. You will now be redirected to the homepage.");
                window.location.href = 'index.html';
                return false; // Stop further processing and prevent next step
            }
        }

        if (!phone.value.trim()) {
            showError(phone, 'Phone number is required.');
            isValid = false;
        } else if (!/^\+?[1-9]\d{1,14}$/.test(phone.value.trim())) {
             showError(phone, 'Please enter a valid phone number.');
             isValid = false;
        }

        if (selectedServicesCheckboxes.length === 0) {
            // Find the service options container to show error nearby
            const serviceOptionsContainer = document.querySelector('.service-options');
            if (serviceOptionsContainer) {
                showError(serviceOptionsContainer, 'Please select at least one service.', true);
            }
            isValid = false;
        }

        // If all basic validations pass and email is not already registered, then update lead.
        // The updateLead function will only be called if isValid is still true at this point.
        if (isValid && !window.emailValidationErrorActive) { // Check flag again
            await updateLead(); // updateLead will handle its own CRM logic.
        }
    } else if (step === 2) {
        // Make sure there's at least one service in the summary
        const summaryItems = document.getElementById('service-summary-items').children;
        if (summaryItems.length === 0) {
            alert('Please configure at least one service.');
            return false;
        }
        
        return true;
    } else if (step === 3) {
        // Check if all services have scheduled dates
        for (const service of selectedServices) {
            if (!selectedDates[service] || !selectedTimes[service]) {
                alert(`Please schedule your ${service.replace('-', ' ')} service.`);
                return false;
            }
        }
        
        // Update summary datetime
        updateSummaryDateTime();
        
        return true;
    }
    
    return true;
}

// Generate service tabs based on selected services
function generateServiceTabs() {
    const tabsContainer = document.getElementById('service-tabs');
    tabsContainer.innerHTML = '';
    let allServicesSuccessfullyPopulated = true;
    
    selectedServices.forEach((service, index) => {
        const tab = document.createElement('div');
        tab.className = 'service-tab';
        if (index === 0) tab.className += ' active';
        
        let serviceName = '';
        let icon = '';
        
        if (service === 'housekeeping') {
            serviceName = 'Housekeeping';
            icon = 'broom';
        } else if (service === 'lawn-care') {
            serviceName = 'Lawn Care';
            icon = 'leaf';
        } else if (service === 'pool-service') {
            serviceName = 'Pool Service';
            icon = 'swimming-pool';
        }
        
        tab.innerHTML = `<i class="fas fa-${icon}"></i> ${serviceName}`;
        tab.setAttribute('data-service', service);
        tab.onclick = function() { showServiceForm(service); };
        tabsContainer.appendChild(tab);

        // Check if this service has essential configurations
        if (!serviceConfigurations[service] || !serviceConfigurations[service].main_types || serviceConfigurations[service].main_types.length === 0) {
            console.error(`Essential main_types configuration missing for service: ${service}. Halting further processing for this service form.`);
            alert(`Configuration for ${getServiceName(service)} is incomplete. Please try deselecting and reselecting the service, or contact support if the issue persists.`);
            // Mark this service form as unconfigurable or hide it
            const serviceFormElement = document.getElementById(`${service}-options`);
            if(serviceFormElement) {
                serviceFormElement.innerHTML = `<p>Configuration for ${getServiceName(service)} is currently unavailable. Please try again later or contact support.</p>`;
                serviceFormElement.style.display = 'block'; // Make sure it's visible to show the error
            }
            allServicesSuccessfullyPopulated = false; 
        }
    });
    
    // Show the first service form if all are good
    if (allServicesSuccessfullyPopulated && selectedServices.length > 0) {
        showServiceForm(selectedServices[0]);
    } else if (!allServicesSuccessfullyPopulated && selectedServices.length > 0) {
        // If some services failed to populate, don't automatically show the first one
        // The user should see the error message in the respective service tab content.
        console.warn("Some services could not be fully configured. User action may be required.");
    }
    return allServicesSuccessfullyPopulated;
}

// Update service tabs based on selected services (alternative method)
function updateServiceTabs() {
    generateServiceTabs();
}

// Show the selected service form
function showServiceForm(service) {
    // Hide all service forms
    const serviceForms = document.querySelectorAll('.service-form');
    serviceForms.forEach(form => {
        form.style.display = 'none';
    });
    
    // Show the selected service form
    document.getElementById(`${service}-options`).style.display = 'block';
    
    // Update active tab
    const tabs = document.querySelectorAll('.service-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the tab for this service
    tabs.forEach(tab => {
        if (tab.getAttribute('data-service') === service) {
            tab.classList.add('active');
        }
    });
    
    // Update service price
    updateServicePrice(service);
}

// Activate a service tab (alternative method)
function activateServiceTab(tab) {
    const service = tab.getAttribute('data-service');
    showServiceForm(service);
}

// Initialize service prices
function initializeServicePrices() {
    selectedServices.forEach(service => {
        currentPrices[service] = servicePrices[service].base;
    });
}

// Toggle room options visibility
function toggleRoomOptions(roomType) {
    const checkbox = document.querySelector(`input[value="${roomType}"]`);
    const optionsDiv = document.getElementById(`${roomType}-options`);
    
    if (checkbox.checked) {
        optionsDiv.style.display = 'block';
        // Smooth appearance
        setTimeout(() => {
            optionsDiv.style.opacity = '1';
        }, 10);
    } else {
        optionsDiv.style.opacity = '0';
        setTimeout(() => {
            optionsDiv.style.display = 'none';
        }, 300);
    }
    
    // Update price calculation
    updateServicePrice('housekeeping');
}

// Update service price based on selections
function updateServicePrice(service) {
    let price = 0;
    
    // if (!serviceConfigurations) { // Commenting out as it might prevent initial price calc from static elements
    //     console.warn('Service configurations not loaded yet, cannot update price accurately.');
    // }

    // --- HOUSEKEEPING --- 
    if (service === 'housekeeping') {
        // Price from selected main cleaning type (dynamic radio button)
        const selectedCleaningType = document.querySelector('input[name="cleaning-type"]:checked');
        if (selectedCleaningType && selectedCleaningType.dataset.price) {
            price += parseFloat(selectedCleaningType.dataset.price);
        } else {
            // Fallback or default if no dynamic radio is selected or has price
            // This might happen if the main_types array was empty for housekeeping
            console.warn('No dynamic cleaning type selected or priced for housekeeping. Check config.');
            // Potentially add a base price from old static logic if needed as ultimate fallback
        }

        // Add prices from static housekeeping elements (rooms, bedrooms, bathrooms, home type)
        const roomCheckboxes = document.querySelectorAll('input[name="rooms[]"]:checked');
        roomCheckboxes.forEach(checkbox => {
            // Only add price if it's not the bedroom/bathroom checkbox itself (those are handled by selects)
            if (checkbox.value !== 'bedroom' && checkbox.value !== 'bathroom' && checkbox.dataset.price) {
                price += parseFloat(checkbox.dataset.price);
            }
        });
        
        const bedroomCheckbox = document.querySelector('input[name="rooms[]"][value="bedroom"]');
        if (bedroomCheckbox && bedroomCheckbox.checked) {
            const bedroomSelect = document.getElementById('bedrooms');
            if (bedroomSelect && bedroomSelect.value && bedroomSelect.options[bedroomSelect.selectedIndex].dataset.price) {
                price += parseFloat(bedroomSelect.options[bedroomSelect.selectedIndex].dataset.price);
            }
        }

        const bathroomCheckbox = document.querySelector('input[name="rooms[]"][value="bathroom"]');
        if (bathroomCheckbox && bathroomCheckbox.checked) {
            const bathroomSelect = document.getElementById('bathrooms');
            if (bathroomSelect && bathroomSelect.value && bathroomSelect.options[bathroomSelect.selectedIndex].dataset.price) {
                price += parseFloat(bathroomSelect.options[bathroomSelect.selectedIndex].dataset.price);
            }
        }
        
        const homeTypeSelect = document.getElementById('home-type');
        if (homeTypeSelect && homeTypeSelect.value && homeTypeSelect.options[homeTypeSelect.selectedIndex].dataset.price) {
            price += parseFloat(homeTypeSelect.options[homeTypeSelect.selectedIndex].dataset.price);
        }

        // Add extras (dynamic checkboxes)
        const extrasCheckboxes = document.querySelectorAll('input[name="housekeeping-extras[]"]:checked');
        extrasCheckboxes.forEach(extraCheckbox => {
            if (extraCheckbox.dataset.price) {
                price += parseFloat(extraCheckbox.dataset.price);
            }
        });
    } 
    // --- LAWN CARE --- 
    else if (service === 'lawn-care') {
        const selectedLawnServiceType = document.querySelector('input[name="lawn-service-type"]:checked');
        if (selectedLawnServiceType && selectedLawnServiceType.dataset.price) {
            price += parseFloat(selectedLawnServiceType.dataset.price);
        } else {
             console.warn('No dynamic lawn service type selected or priced for lawn-care. Check config.');
        }

        // Add price from static lawn size select
        const lawnSizeSelect = document.getElementById('lawn-size');
        if (lawnSizeSelect && lawnSizeSelect.value && lawnSizeSelect.options[lawnSizeSelect.selectedIndex].dataset.price) {
            price += parseFloat(lawnSizeSelect.options[lawnSizeSelect.selectedIndex].dataset.price);
        }

        const extrasCheckboxes = document.querySelectorAll('input[name="lawn-extras[]"]:checked');
        extrasCheckboxes.forEach(extraCheckbox => {
            if (extraCheckbox.dataset.price) {
                price += parseFloat(extraCheckbox.dataset.price);
            }
        });
    } 
    // --- POOL SERVICE --- 
    else if (service === 'pool-service') {
        const selectedPoolServiceType = document.querySelector('input[name="pool-service-type"]:checked');
        if (selectedPoolServiceType && selectedPoolServiceType.dataset.price) {
            price += parseFloat(selectedPoolServiceType.dataset.price);
        } else {
            console.warn('No dynamic pool service type selected or priced for pool-service. Check config.');
        }

        // Add price from static pool size and type selects
        const poolSizeSelect = document.getElementById('pool-size');
        if (poolSizeSelect && poolSizeSelect.value && poolSizeSelect.options[poolSizeSelect.selectedIndex].dataset.price) {
            price += parseFloat(poolSizeSelect.options[poolSizeSelect.selectedIndex].dataset.price);
        }
        const poolTypeSelect = document.getElementById('pool-type');
        if (poolTypeSelect && poolTypeSelect.value && poolTypeSelect.options[poolTypeSelect.selectedIndex].dataset.price) {
            price += parseFloat(poolTypeSelect.options[poolTypeSelect.selectedIndex].dataset.price);
        }

        const extrasCheckboxes = document.querySelectorAll('input[name="pool-extras[]"]:checked');
        extrasCheckboxes.forEach(extraCheckbox => {
            if (extraCheckbox.dataset.price) {
                price += parseFloat(extraCheckbox.dataset.price);
            }
        });
    }
    
    currentPrices[service] = price;
    updateServiceSummary();
}

// Update service summary with detailed breakdown
function updateServiceSummary() {
    const summaryContainer = document.getElementById('service-summary-items');
    if (!summaryContainer) {
        console.error('Service summary container not found');
        return;
    }
    summaryContainer.innerHTML = '';
    let grandTotal = 0;

    selectedServices.forEach(serviceKey => {
        const priceForThisService = currentPrices[serviceKey] || 0;
        grandTotal += priceForThisService;

        let mainServiceRadioName = '';
        if (serviceKey === 'housekeeping') mainServiceRadioName = 'cleaning-type';
        else if (serviceKey === 'lawn-care') mainServiceRadioName = 'lawn-service-type';
        else if (serviceKey === 'pool-service') mainServiceRadioName = 'pool-service-type';

        let selectedMainTypeName = getServiceName(serviceKey); // Default to general service name
        let selectedMainTypeConfig = null;

        if (mainServiceRadioName) {
            const selectedMainRadio = document.querySelector(`input[name="${mainServiceRadioName}"]:checked`);
            if (selectedMainRadio) {
                selectedMainTypeName = selectedMainRadio.labels && selectedMainRadio.labels.length > 0 ?
                                       selectedMainRadio.labels[0].textContent.trim().split('(+$')[0].trim() :
                                       selectedMainRadio.value;
                if (serviceConfigurations && serviceConfigurations[serviceKey] && serviceConfigurations[serviceKey].main_types) {
                    selectedMainTypeConfig = serviceConfigurations[serviceKey].main_types.find(mt => String(mt.id) === selectedMainRadio.dataset.serviceId);
                }
            }
        }

        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        
        // Create a new wrapper for header and included tasks
        const headerAndIncludedWrapper = document.createElement('div');
        // Optionally, add a class for specific styling if needed:
        // headerAndIncludedWrapper.className = 'service-header-details'; 

        let headerHTML = `
                <div class="summary-header">
                <span class="service-name">${selectedMainTypeName}</span>
                <span class="service-price">$${priceForThisService.toFixed(2)}</span>
                </div>
            `;
        headerAndIncludedWrapper.innerHTML = headerHTML;
            
        let includedTasksHTML = '';
        if (selectedMainTypeConfig && selectedMainTypeConfig.required_tasks && selectedMainTypeConfig.required_tasks.length > 0) {
            includedTasksHTML += `<div class="breakdown-item"><strong>Included:</strong></div>`;
            selectedMainTypeConfig.required_tasks.forEach(taskName => {
                includedTasksHTML += `<div class="breakdown-item indent">- ${taskName}</div>`;
            });
            // Append included tasks HTML to the wrapper
            headerAndIncludedWrapper.innerHTML += includedTasksHTML; 
        }
        
        summaryItem.appendChild(headerAndIncludedWrapper);
            
        const breakdown = document.createElement('div'); // This div is for static options and extras
            breakdown.className = 'service-breakdown';
        // let breakdownHasContentForStaticExtras = false; // We will check breakdown.innerHTML directly later
            
        // Display static selections if they apply to this serviceKey
        if (serviceKey === 'housekeeping') {
            const roomCheckboxes = document.querySelectorAll('input[name="rooms[]"]:checked');
            if (roomCheckboxes.length > 0) {
                breakdown.innerHTML += '<div class="breakdown-item sub-header">Rooms:</div>';
            roomCheckboxes.forEach(checkbox => {
                    const roomName = checkbox.labels[0].textContent.split('($')[0].trim();
                    breakdown.innerHTML += `<div class="breakdown-item indent">- ${roomName}</div>`;
                    // breakdownHasContentForStaticExtras = true;
                });
            }
            const bedroomCheckbox = document.querySelector('input[name="rooms[]"][value="bedroom"]');
            if (bedroomCheckbox && bedroomCheckbox.checked) {
                const bedroomSelect = document.getElementById('bedrooms');
                if (bedroomSelect && bedroomSelect.value) {
                    breakdown.innerHTML += `<div class="breakdown-item indent">- ${bedroomSelect.options[bedroomSelect.selectedIndex].text}</div>`;
                    // breakdownHasContentForStaticExtras = true;
                }
            }
            const bathroomCheckbox = document.querySelector('input[name="rooms[]"][value="bathroom"]');
            if (bathroomCheckbox && bathroomCheckbox.checked) {
                const bathroomSelect = document.getElementById('bathrooms');
                if (bathroomSelect && bathroomSelect.value) {
                    breakdown.innerHTML += `<div class="breakdown-item indent">- ${bathroomSelect.options[bathroomSelect.selectedIndex].text}</div>`;
                    // breakdownHasContentForStaticExtras = true;
                }
            }
            const homeTypeSelect = document.getElementById('home-type');
            if (homeTypeSelect && homeTypeSelect.value && homeTypeSelect.options[homeTypeSelect.selectedIndex].dataset.price !== "0") { // Show if not base
                breakdown.innerHTML += `<div class="breakdown-item">Layout: ${homeTypeSelect.options[homeTypeSelect.selectedIndex].text}</div>`;
                // breakdownHasContentForStaticExtras = true;
            }
        } else if (serviceKey === 'lawn-care') {
            const lawnSizeSelect = document.getElementById('lawn-size');
            if (lawnSizeSelect && lawnSizeSelect.value) {
                breakdown.innerHTML += `<div class="breakdown-item">Lawn Size: ${lawnSizeSelect.options[lawnSizeSelect.selectedIndex].text.split('-')[0].trim()}</div>`;
                // console.log(`[Lawn Care] breakdown.innerHTML after static: '${breakdown.innerHTML}'`); // DEBUG
            }
        } else if (serviceKey === 'pool-service') {
            const poolSizeSelect = document.getElementById('pool-size');
            if (poolSizeSelect && poolSizeSelect.value) {
                breakdown.innerHTML += `<div class="breakdown-item">Pool Size: ${poolSizeSelect.options[poolSizeSelect.selectedIndex].text.split('-')[0].trim()}</div>`;
            }
            const poolTypeSelect = document.getElementById('pool-type');
            if (poolTypeSelect && poolTypeSelect.value && poolTypeSelect.options[poolTypeSelect.selectedIndex].dataset.price !== "0") { // Show if not base
                breakdown.innerHTML += `<div class="breakdown-item">Pool Type: ${poolTypeSelect.options[poolTypeSelect.selectedIndex].text}</div>`;
            }
            // console.log(`[Pool Service] breakdown.innerHTML after static: '${breakdown.innerHTML}'`); // DEBUG
        }

        // Display selected dynamic extras (checkboxes)
        const extrasSelector = `input[name="${serviceKey}-extras[]"]:checked`;
        if (serviceKey === 'lawn-care' || serviceKey === 'pool-service') {
            // console.log(`[${serviceKey}] Attempting to find extras with selector: "${extrasSelector}"`); // DEBUG
            const allExtrasForService = document.querySelectorAll(`input[name="${serviceKey}-extras[]"]`); // Get all, not just checked
            // console.log(`[${serviceKey}] Found ${allExtrasForService.length} total extras checkboxes. First one name: ${allExtrasForService.length > 0 ? allExtrasForService[0].name : 'N/A'}`);
        }
        const extrasCheckboxes = document.querySelectorAll(extrasSelector);
        if (serviceKey === 'lawn-care' || serviceKey === 'pool-service') {
            // console.log(`[${serviceKey}] Found ${extrasCheckboxes.length} checked extras checkboxes.`); // DEBUG
        }

        if (extrasCheckboxes.length > 0) {
            breakdown.innerHTML += '<div class="breakdown-item sub-header">Additional Tasks:</div>';
            extrasCheckboxes.forEach(extraCheckbox => {
                if (extraCheckbox.dataset.price) {
                    const extraName = extraCheckbox.labels && extraCheckbox.labels.length > 0 ? 
                                      extraCheckbox.labels[0].textContent.trim().split('(+$')[0].trim() :
                                      extraCheckbox.value; 
                    breakdown.innerHTML += `<div class="breakdown-item indent">- ${extraName} ($${parseFloat(extraCheckbox.dataset.price).toFixed(2)})</div>`;
                }
            });
            if (serviceKey === 'lawn-care' || serviceKey === 'pool-service') {
                // console.log(`[${serviceKey}] breakdown.innerHTML after extras: '${breakdown.innerHTML}'`); // DEBUG
            }
        }

        // If breakdown div has any content after attempting to populate static options and extras, append it.
        if (serviceKey === 'lawn-care' || serviceKey === 'pool-service') {
            // console.log(`[${serviceKey}] Final check: breakdown.innerHTML.trim() is '${breakdown.innerHTML.trim()}'. Condition is: ${breakdown.innerHTML.trim() !== ''}`); // DEBUG
        }
        if (breakdown.innerHTML.trim() !== '') {
            summaryItem.appendChild(breakdown);
        }
        
        summaryContainer.appendChild(summaryItem);
    });
    
    // Update total price display
    document.getElementById('total-price').textContent = `$${grandTotal.toFixed(2)}`;
    
    // Also update the final summary service text (used on payment page)
    const summaryServiceElement = document.getElementById('summary-service');
    if (summaryServiceElement) {
        // Make sure this styling exists or adjust as needed:
        // .service-summary .breakdown-item.sub-header.indent { margin-left: 10px; font-style: italic; }
        // .service-summary .breakdown-item.আরও-indent { margin-left: 20px; }
        summaryServiceElement.textContent = getSummaryServiceText();
    }
    const servicePriceElement = document.getElementById('service-price'); // For payment page summary
    if (servicePriceElement) {
        servicePriceElement.textContent = grandTotal.toFixed(2);
    }
}

// Get service name from service type
function getServiceName(serviceType) {
    switch (serviceType) {
        case 'housekeeping':
            return 'Housekeeping';
        case 'lawn-care':
            return 'Lawn Care';
        case 'pool-service':
            return 'Pool Service';
        default:
            return '';
    }
}

// Get comma-separated list of selected services
function getSummaryServiceText() {
    return selectedServices.map(serviceKey => {
        let mainServiceRadioName = '';
        if (serviceKey === 'housekeeping') mainServiceRadioName = 'cleaning-type';
        else if (serviceKey === 'lawn-care') mainServiceRadioName = 'lawn-service-type';
        else if (serviceKey === 'pool-service') mainServiceRadioName = 'pool-service-type';

        if (mainServiceRadioName) {
            const selectedMainRadio = document.querySelector(`input[name="${mainServiceRadioName}"]:checked`);
            if (selectedMainRadio) {
                return selectedMainRadio.labels && selectedMainRadio.labels.length > 0 ?
                       selectedMainRadio.labels[0].textContent.trim().split('(+$')[0].trim() :
                       selectedMainRadio.value;
            }
        }
        return getServiceName(serviceKey); // Fallback to general service name
    }).join(', ');
}

// Update appointment summary on the payment page
function updateAppointmentSummary() {
    const datetimeElement = document.getElementById('summary-datetime');
    if (!datetimeElement) return;
    
    datetimeElement.innerHTML = '';
    
    selectedServices.forEach(service => {
        const serviceName = getServiceName(service);
        
        if (selectedDates[service] && selectedDates[service].display && selectedTimes[service] && selectedTimes[service].display) {
            // Use .display for UI elements
            const appointmentLine = document.createElement('div');
            appointmentLine.innerHTML = `${serviceName}: ${selectedDates[service].display} at ${selectedTimes[service].display}`;
            datetimeElement.appendChild(appointmentLine);
        }
    });
}

// Update the summary datetime display
function updateSummaryDateTime() {
    const firstService = selectedServices.length > 0 ? 
        selectedServices[0] : Object.keys(selectedDates)[0];
        
    if (firstService && selectedDates[firstService] && selectedTimes[firstService]) {
        let datetimeText;
        
        // Handle both date formats
        if (selectedDates[firstService].includes('T')) {
            // ISO string format from old code
            const date = new Date(selectedDates[firstService]);
            datetimeText = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }) + ' at ' + selectedTimes[firstService];
        } else {
            // Localized string from new code
            datetimeText = selectedDates[firstService] + ' at ' + selectedTimes[firstService];
        }
        
        const summaryDatetimeElement = document.getElementById('summary-datetime');
        if (summaryDatetimeElement) {
            summaryDatetimeElement.textContent = datetimeText;
        }
    }
}

// Generate service selection boxes
function generateServiceSelectionBoxes() {
    // Check for both container types (for compatibility)
    const container = document.querySelector('.service-selection-boxes') || 
                     document.querySelector('.service-boxes');
    
    if (!container) {
        console.error('Service selection boxes container not found');
        return;
    }
    
    container.innerHTML = '';
    
    // Always use selectedServices array
    selectedServices.forEach(service => {
        let serviceName = getServiceName(service);
        let icon = '';
        
        if (service === 'housekeeping') {
            icon = 'broom';
        } else if (service === 'lawn-care') {
            icon = 'leaf';
        } else if (service === 'pool-service') {
            icon = 'swimming-pool';
        }
        
        const isScheduled = selectedDates[service] && selectedTimes[service];
        const statusClass = isScheduled ? 'scheduled' : 'not-scheduled';
        const statusText = isScheduled ? 'Scheduled' : 'Not Scheduled';
        
        // Format date and time for display
        let dateTimeDisplay = '';
        if (isScheduled) {
            // Use .display versions for UI
            const displayDate = selectedDates[service].display;
            const displayTime = selectedTimes[service].display;

            // Simplified display for the box, e.g., "May 20, 10:00 AM"
            // Assuming displayDate is like "Monday, May 20, 2025"
            const dateParts = displayDate.split(', '); // ["Monday", "May 20", "2025"]
                if (dateParts.length >= 2) {
                const shortDate = dateParts[1]; // "May 20"
                dateTimeDisplay = `${shortDate}, ${displayTime}`;
            } else { // Fallback
                dateTimeDisplay = `${displayDate}, ${displayTime}`;
            }
        }
        
        // Always create service-box style boxes regardless of container class
        const box = document.createElement('div');
        box.className = `service-box ${currentSchedulingService === service ? 'selected' : ''}`;
        box.setAttribute('data-service', service);
        box.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <h3>${serviceName}</h3>
            <p>Click to schedule this service</p>
            <div class="status ${statusClass}">${statusText}</div>
            <div class="schedule-info">
                ${dateTimeDisplay}
            </div>
        `;
        
        box.addEventListener('click', function() {
            // Update selected box
            document.querySelectorAll('.service-box').forEach(b => {
                b.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Switch to this service for scheduling
            switchScheduleTab(service);
        });
        
        container.appendChild(box);
    });
    
    // Set the first service as active if nothing is currently selected
    if (!currentSchedulingService && selectedServices.length > 0) {
        switchScheduleTab(selectedServices[0]);
    }
}

// Select payment option
function selectPaymentOption(element, option) {
    // Remove selection from all payment options
    const allOptions = document.querySelectorAll('.payment-option');
    allOptions.forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selection to clicked option
    element.classList.add('selected');
    element.querySelector('input').checked = true;
    
    // Show/hide appropriate payment form
    const oneTimeForm = document.getElementById('one-time-payment');
    const subscriptionForm = document.getElementById('subscription-signup');
    const submitButton = document.querySelector('#page4 .btn-next');
    
    if (option === 'subscription') {
        oneTimeForm.style.display = 'none';
        subscriptionForm.style.display = 'block';
        
        // Update price with 15% discount
        const basePrice = parseFloat(document.getElementById('service-price').textContent);
        const discountedPrice = basePrice * 0.85;
        document.getElementById('service-price').textContent = discountedPrice.toFixed(2);
        
        // Change button text for subscription
        if (submitButton) {
            submitButton.textContent = 'Create Account';
        }
        
        // If subscription, pre-fill email
        const email = document.getElementById('email').value;
        if (email && document.getElementById('signup-email')) {
            document.getElementById('signup-email').value = email;
        }
    } else {
        oneTimeForm.style.display = 'block';
        subscriptionForm.style.display = 'none';
        
        // Reset to original price
        updateOrderSummary(); // This will reset to the original price
        
        // Change button text back for one-time payment
        if (submitButton) {
            submitButton.textContent = 'Continue to Payment';
        }
    }
}

// Helper function to validate subscription fields
function validateSubscriptionFields() {
    const fieldsToValidate = [
        { id: 'username', name: 'Username' },
        { id: 'signup-email', name: 'Email for signup' },
        { id: 'password', name: 'Password' },
        { id: 'confirm-password', name: 'Confirm Password' },
        { id: 'subscription-frequency', name: 'Service Frequency' }
    ];
    let firstErrorMessage = "";

    for (const fieldInfo of fieldsToValidate) {
        const fieldElement = document.getElementById(fieldInfo.id);
        if (fieldElement && fieldElement.value.trim() === "") {
            if (!firstErrorMessage) {
                firstErrorMessage = `Please fill in the ${fieldInfo.name} field.`;
            }
            fieldElement.style.borderColor = 'red'; // Highlight empty field
        } else if (fieldElement) {
            fieldElement.style.borderColor = '#ddd'; // Reset border color
        }
    }

    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        if (!firstErrorMessage) {
            firstErrorMessage = "Passwords do not match.";
        }
        password.style.borderColor = 'red';
        confirmPassword.style.borderColor = 'red';
    } else if (password && confirmPassword && password.value === confirmPassword.value && password.value !== "") {
        // Only reset if they match and are not empty, and no prior error on them
        if (password.style.borderColor === 'red' || confirmPassword.style.borderColor === 'red') {
             password.style.borderColor = '#ddd';
             confirmPassword.style.borderColor = '#ddd';
        }
    }

    if (firstErrorMessage) {
        alert(firstErrorMessage);
        return false;
    }
    return true;
}

// Handle booking submission
async function handleBookingSubmission() {
    const paymentOption = document.querySelector('input[name="payment-option"]:checked');
    const submitButton = document.querySelector('#page4 .btn-next');
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    if (!paymentOption) {
        alert('Please select a payment option.');
        submitButton.disabled = false;
        submitButton.textContent = 'Continue to Payment';
        return;
    }

    const paymentType = paymentOption.value;

    if (paymentType === 'subscription') {
        if (!validateSubscriptionFields()) {
            submitButton.disabled = false;
            submitButton.textContent = 'Continue to Payment';
            return;
        }
        // Check if subscription email already exists for a registered user
        const signupEmailField = document.getElementById('signup-email');
        const signupEmail = signupEmailField.value.trim();
        clearEmailError('signup-email'); // Clear previous error

        if (signupEmail && isValidEmail(signupEmail)) {
            const emailCheckResult = await checkEmailExists(signupEmail);
            if (emailCheckResult && emailCheckResult.emailExists) {
                displayEmailError('signup-email', 'This email is already registered. Please <a href="login.html">login</a> to subscribe or use a different email for your new account.');
                alert("The email provided for the new account is already registered. Please log in or use a different email. You will be redirected to the homepage.");
                window.location.href = 'index.html';
                // submitButton.disabled = false; // Not needed due to redirect
                // submitButton.textContent = 'Continue to Payment'; // Not needed
                return; // Stop processing
            }
        } else if (!signupEmail || !isValidEmail(signupEmail)){
            displayEmailError('signup-email', 'Please enter a valid email for your subscription account.');
            submitButton.disabled = false;
            submitButton.textContent = 'Continue to Payment';
            return;
        }
    }

    // Collect all form data from the entire multi-step form
    const formData = new FormData(document.getElementById('multi-step-form'));

    // ... existing code ...
}

// Edit Address function
function editAddress() {
    // Clear stored addresses before redirecting
    localStorage.removeItem('serviceAddress');
    sessionStorage.removeItem('userAddress');
    sessionStorage.removeItem('addressId');
    
    window.location.href = 'index.html';
}

// Confirm Address function
function confirmAddress() {
    // Hide modal
    document.getElementById('address-confirm-modal').style.display = 'none';
    
    // Enable form
    const form = document.getElementById('multi-step-form');
    if (form) {
        form.style.pointerEvents = 'auto';
        form.style.opacity = '1';
    }
}

// Add this missing function for scheduling a service
function scheduleService(service, name) {
    selectedService = service;
    
    // Make sure the element exists before updating it
    const serviceNameElement = document.getElementById('scheduling-service-name');
    if (serviceNameElement) {
        serviceNameElement.textContent = name;
    }
    
    // Mark the selected service box
    document.querySelectorAll('.service-selection-box').forEach(box => {
        box.classList.remove('selected');
        if (box.getAttribute('data-service') === service) {
            box.classList.add('selected');
        }
    });
    
    // Make sure time slots element exists
    const timeSlotsElement = document.getElementById('time-slots');
    if (timeSlotsElement) {
        timeSlotsElement.style.display = 'none';
    }
    
    // Highlight already selected date if any
    highlightSelectedDate();
}

// Add the updateCalendar function as a wrapper for generateCalendar
function updateCalendar() {
    generateCalendar(currentDate || new Date());
}


//Generate Timeframe
function generateTimeSlots() {
    const container = document.getElementById("timeSlotsContainer");
    container.innerHTML = ""; // Clear existing slots
    console.log('the work')
    const now = new Date();
    const startHour = 7;
    const endHour = 19;

    for (let hour = startHour; hour <= endHour; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const time = new Date();
            time.setHours(hour, min, 0, 0);

            const formatted = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const div = document.createElement("div");
            div.className = "time-slot";
            div.textContent = formatted;

            if (time <= now) {
                div.classList.add("disabled");
            } else {
                div.setAttribute("onclick", "selectTimeSlot(this)");
            }

            container.appendChild(div);
        }
    }
}

// Ensure switchScheduleTab function is defined
function switchScheduleTab(service) {
    // Update current service for scheduling
    currentSchedulingService = service;
    selectedService = service; // For new code compatibility
    
    // Update service boxes
    document.querySelectorAll('.service-box').forEach(box => {
        box.classList.remove('selected');
        if (box.getAttribute('data-service') === service) {
            box.classList.add('selected');
        }
    });
    
    // Also update service selection boxes (new code)
    document.querySelectorAll('.service-selection-box').forEach(box => {
        box.classList.remove('selected');
        if (box.getAttribute('data-service') === service) {
            box.classList.add('selected');
        }
    });
    
    // Update calendar selection if a date was already selected for this service
    if (selectedDates[service]) {
        // Show time slots
        const timeSlotsElement = document.getElementById('time-slots');
        if (timeSlotsElement) {
            timeSlotsElement.style.display = 'block';
            generateTimeSlots();
        }
    } else {
        // Hide time slots
        const timeSlotsElement = document.getElementById('time-slots');
        if (timeSlotsElement) {
            timeSlotsElement.style.display = 'none';
        }
    }
    
    // Update the service name in the scheduling section
    const serviceName = getServiceName(service);
    const schedulingServiceName = document.getElementById('scheduling-service-name');
    if (schedulingServiceName) {
        schedulingServiceName.textContent = serviceName;
    }
    
    // Highlight already selected date
    highlightSelectedDate();
    
    // Update the appointment summary 
    updateScheduleSummary();

    //Time frame show
    generateTimeSlots();
}

// Add the missing highlightSelectedDate function
function highlightSelectedDate() {
    // Make sure we have the calendar days element
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) {
        console.error('Calendar days element not found');
        return;
    }
    
    // Clear all selections first
    document.querySelectorAll('.calendar-day.selected, .day.selected').forEach(d => {
        d.classList.remove('selected');
    });
    
    // Determine which service to use for highlighting
    const serviceToCheck = currentSchedulingService || selectedService;
    
    // If there's a date selected for this service
    if (serviceToCheck && selectedDates[serviceToCheck] && selectedDates[serviceToCheck].value) {
        let selectedDateValue = selectedDates[serviceToCheck].value; // YYYY-MM-DD
        
        // Parse YYYY-MM-DD to compare with calendar's current view
        const [sYear, sMonth, sDay] = selectedDateValue.split('-').map(Number);
        
        // currentDate is the calendar's currently displayed month/year
        if (sMonth - 1 === currentDate.getMonth() &&
            sYear === currentDate.getFullYear()) {
            
            // Check both calendar-day (old code) and day (new code) classes
            const daysElements = document.querySelectorAll('.calendar-day:not(.empty), .day:not(.empty)');
            daysElements.forEach(dayElem => {
                if (parseInt(dayElem.textContent) === sDay) {
                    dayElem.classList.add('selected');
                }
            });

            // Show time slots
            const timeSlotsElement = document.getElementById('time-slots');
            if (timeSlotsElement) {
                timeSlotsElement.style.display = 'block';
            }
        }
    }
}

// Calendar generation function
function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Update month display
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const monthDisplayElement = document.getElementById('current-month');
    if (monthDisplayElement) {
        monthDisplayElement.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Get first day of month and total days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Clear previous calendar
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) return; // Exit if calendar days element doesn't exist
    
    calendarDays.innerHTML = '';
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        // Disable past dates
        const currentDate = new Date(year, month, i);
        if (currentDate < today && !(currentDate.getDate() === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear())) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', function() {
                selectDate(this, year, month, i);
            });
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Highlight selected date if available
    highlightSelectedDate();
}

// Navigate to previous month
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
}

// Navigate to next month
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
}

// Select date function
function selectDate(element, year, month, day) {
    // Remove selection from all days
    const allDays = document.querySelectorAll('.calendar-day');
    allDays.forEach(d => {
        d.classList.remove('selected');
    });
    
    // Add selection to clicked day
    element.classList.add('selected');
    
    // Store selected date for current service
    const selectedDateObj = new Date(year, month, day);
    const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const machineReadableDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Store the service's selected date (both display and value)
    const currentServiceKey = selectedService || currentSchedulingService;
    selectedDates[currentServiceKey] = {
        display: formattedDate,
        value: machineReadableDate
    };

    generateTimeSlots();    
    // Show time slots
    const timeSlotsElement = document.getElementById('time-slots');
    if (timeSlotsElement) {
        timeSlotsElement.style.display = 'block';
    }
    
    // Update schedule summary
    updateScheduleSummary();
    
    // Update service boxes to reflect scheduling status
    generateServiceSelectionBoxes();
}

// Select time slot function
function selectTimeSlot(element) {
    var selectedTime = document.querySelector(".time-slots");
    console.log(selectedTime.innerHTML)
    
    // Remove selection from all time slots
    const allTimeSlots = document.querySelectorAll('.time-slot');
    allTimeSlots.forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selection to clicked time slot
    element.classList.add('selected');
    
    // Store selected time for current service
    const timeText = element.textContent; // e.g., "8:00 AM"
    const [timePart, modifier] = timeText.split(' '); // timePart is "8:00", modifier is "AM"
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours, 10);

    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    } else if (modifier === 'AM' && hours === 12) { // Midnight case
        hours = 0;
    }

    const machineReadableTime = `${String(hours).padStart(2, '0')}:${minutes}:00`;
    
    const currentServiceKey = selectedService || currentSchedulingService;
    selectedTimes[currentServiceKey] = {
        display: timeText,
        value: machineReadableTime
    };
    
    // Update schedule summary
    updateScheduleSummary();
    
    // Update service boxes to reflect scheduling status
    generateServiceSelectionBoxes();
}

// Update order summary on the payment page
function updateOrderSummary() {
    let total = 0;
    selectedServices.forEach(service => {
        total += currentPrices[service] || 0;
    });
    
    // Update service list in summary
    const serviceNames = selectedServices.map(service => {
        return getServiceName(service);
    });
    
    const summaryServiceElement = document.getElementById('summary-service');
    if (summaryServiceElement) {
        summaryServiceElement.textContent = serviceNames.join(', ');
    }
    
    const servicePriceElement = document.getElementById('service-price');
    if (servicePriceElement) {
        servicePriceElement.textContent = total.toFixed(2);
    }
}

// Update the schedule summary
function updateScheduleSummary() {
    const summaryContainer = document.getElementById('schedule-summary-items');
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    
    let allServicesScheduled = true;
    
    selectedServices.forEach(service => {
        const serviceName = getServiceName(service);
        
        let dateTimeDisplay = 'Not scheduled';
        
        if (selectedDates[service] && selectedDates[service].display && selectedTimes[service] && selectedTimes[service].display) {
            // Use .display for UI elements
            dateTimeDisplay = selectedDates[service].display + ' at ' + selectedTimes[service].display;
        } else {
            allServicesScheduled = false;
        }
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <span>${serviceName}</span>
            <span>${dateTimeDisplay}</span>
        `;
        
        summaryContainer.appendChild(summaryItem);
    });
    
    // Enable/disable continue button based on whether all services are scheduled
    const nextButton = document.querySelector('#page3 .btn-next');
    if (nextButton) {
        nextButton.disabled = !allServicesScheduled;
    }
}

function populateServiceFormsFromConfig() {
    if (!serviceConfigurations) {
        console.error("Service configurations not available to populate forms.");
        return;
    }

    // Populate Housekeeping
    if (serviceConfigurations.housekeeping) {
        populateMainServiceRadios('housekeeping', 'housekeeping-cleaning-type-group', 'cleaning-type', serviceConfigurations.housekeeping.main_types);
        populateExtrasCheckboxes('housekeeping', 'housekeeping-kitchen-extras-group', 'housekeeping-extras[]', serviceConfigurations.housekeeping.extras, 'Kitchen Extras');
        populateExtrasCheckboxes('housekeeping', 'housekeeping-general-extras-group', 'housekeeping-extras[]', serviceConfigurations.housekeeping.extras, 'General Services');
        populateExtrasCheckboxes('housekeeping', 'housekeeping-laundry-extras-group', 'housekeeping-extras[]', serviceConfigurations.housekeeping.extras, 'Laundry & Organization');
    }

    // Populate Lawn Care
    if (serviceConfigurations['lawn-care']) {
        populateMainServiceRadios('lawn-care', 'lawn-care-service-type-group', 'lawn-service-type', serviceConfigurations['lawn-care'].main_types);
        const lawnCareExtrasName = 'lawn-care-extras[]'; // Correct name
        populateExtrasCheckboxes('lawn-care', 'lawn-care-treatment-extras-group', lawnCareExtrasName, serviceConfigurations['lawn-care'].extras, 'Lawn Treatment');
        populateExtrasCheckboxes('lawn-care', 'lawn-care-seasonal-extras-group', lawnCareExtrasName, serviceConfigurations['lawn-care'].extras, 'Seasonal Services');
        populateExtrasCheckboxes('lawn-care', 'lawn-care-landscaping-extras-group', lawnCareExtrasName, serviceConfigurations['lawn-care'].extras, 'Landscaping');
    }

    // Populate Pool Service
    if (serviceConfigurations['pool-service']) {
        populateMainServiceRadios('pool-service', 'pool-service-service-type-group', 'pool-service-type', serviceConfigurations['pool-service'].main_types);
        const poolServiceExtrasName = 'pool-service-extras[]'; // Correct name
        populateExtrasCheckboxes('pool-service', 'pool-water-treatment-extras-group', poolServiceExtrasName, serviceConfigurations['pool-service'].extras, 'Water Treatment');
        populateExtrasCheckboxes('pool-service', 'pool-equipment-extras-group', poolServiceExtrasName, serviceConfigurations['pool-service'].extras, 'Equipment Services');
        populateExtrasCheckboxes('pool-service', 'pool-seasonal-extras-group', poolServiceExtrasName, serviceConfigurations['pool-service'].extras, 'Seasonal Services');
    }
    
    // After populating, trigger an initial price update for any pre-selected services or defaults
    selectedServices.forEach(serviceKey => {
        updateServicePrice(serviceKey);
    });
    updateServiceSummary(); // Also update the overall summary
}

function populateMainServiceRadios(serviceKey, containerId, radioGroupName, mainTypes) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID ${containerId} not found for ${serviceKey} main services.`);
        return false; // Indicate failure
    }
    if (!mainTypes || mainTypes.length === 0) {
        container.innerHTML = `<p>No service options currently available for ${getServiceName(serviceKey)}.</p>`;
        // Do not consider this a fatal error for this function, but the check in generateServiceTabs is more critical
        return true; // Container found, but no types to populate
    }
    container.innerHTML = ''; // Clear static/previous options

    mainTypes.forEach((mainType, index) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = radioGroupName;
        input.value = mainType.value; // Slug from config
        input.dataset.price = mainType.base_price; // Price for this specific option
        input.dataset.serviceId = mainType.id;   // Actual Service ID from DB
        input.onchange = () => updateServicePrice(serviceKey);
        
        if (index === 0) { // Default check the first option
            input.checked = true;
        }

        label.appendChild(input);
        // Display name and price. Adjust if price indicates a multiplier.
        let displayText = ` ${mainType.name}`;
        if (typeof mainType.base_price === 'number') {
            // If base_price is the final price for this option
             displayText += ` (+$${mainType.base_price.toFixed(2)})`;
            // If it's a multiplier, the text might need to be different, e.g. " (+50%)"
            // This part depends on how get_service_configurations.php structures price vs multiplier
        }
        label.appendChild(document.createTextNode(displayText));
        container.appendChild(label);
    });
    return true; // Indicate success
}

function populateExtrasCheckboxes(serviceKey, containerId, checkboxName, allExtrasForServiceCategory, filterByCategoryName) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID ${containerId} not found for ${serviceKey} extras.`);
        return false; // Indicate failure
    }

    // Define task name keywords for each UI display group. This is brittle.
    // A better solution is a dedicated 'ui_group_key' in the database per task.
    const groupToKeywordMap = {
        housekeeping: {
            'Kitchen Extras': ['fridge', 'oven', 'cabinets', 'dishwasher'],
            'General Services': ['windows', 'blinds', 'baseboards', 'walls'],
            'Laundry & Organization': ['laundry', 'fold clothes', 'closet organization', 'make beds']
        },
        'lawn-care': {
            'Lawn Treatment': ['fertilization', 'aeration', 'weed control'],
            'Seasonal Services': ['leaf removal', 'snow removal', 'spring cleanup'],
            'Landscaping': ['hedge trimming', 'mulching', 'garden maintenance']
        },
        'pool-service': {
            'Water Treatment': ['chemical balancing', 'algae treatment', 'shock treatment'],
            'Equipment Services': ['filter cleaning', 'equipment check', 'pump service'],
            'Seasonal Services': ['opening', 'closing', 'winterization'] // Note: 'Seasonal Services' is a duplicate name, ensure serviceKey makes it unique
        }
    };

    const keywords = groupToKeywordMap[serviceKey] ? groupToKeywordMap[serviceKey][filterByCategoryName] : [];
    
    let relevantExtras = [];
    if (keywords && keywords.length > 0 && allExtrasForServiceCategory) {
        relevantExtras = allExtrasForServiceCategory.filter(extra => {
            const taskNameLower = extra.task_name.toLowerCase();
            // Check if this extra belongs to the current UI group based on keywords
            // This also assumes that an extra task belongs to only ONE UI group.
            return keywords.some(keyword => taskNameLower.includes(keyword.toLowerCase()));
        });
    } else if (allExtrasForServiceCategory) {
        // If no keywords for this group or serviceKey, or if filterByCategoryName is not specific enough,
        // we might end up here. Decide if all extras should be shown or none.
        // For now, if keywords are not found, show no extras for that specific subgroup.
        // console.warn(`No keywords defined for ${serviceKey} - ${filterByCategoryName}, or allExtrasForServiceCategory is missing.`);
    }


    if (!relevantExtras || relevantExtras.length === 0) {
        // console.warn(`No extras found for ${serviceKey} under ${filterByCategoryName} in configurations.`);
        container.innerHTML = "<p>No additional options currently available for this category.</p>";
        return true; // Indicate success even if no extras found
    }
    container.innerHTML = ''; // Clear static/previous options

    relevantExtras.forEach(extra => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = checkboxName;
        input.value = extra.value_attr; // Slug from config
        input.dataset.price = extra.price;
        input.dataset.taskId = extra.id; // Task ID from service_task_templates
        input.onchange = () => updateServicePrice(serviceKey);

        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${extra.task_name} (+$${extra.price.toFixed(2)})`));
        container.appendChild(label);
    });
    return true; // Indicate success
}

async function checkEmailExists(email) {
    if (window.emailCheckInProgress) return null; // Prevent concurrent checks
    window.emailCheckInProgress = true;
    try {
        const response = await fetch(`assets/php/check_user_email.php?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            console.error('Network response was not ok for email check');
            window.emailCheckInProgress = false;
            return null; // Indicate error or inability to check
        }
        const data = await response.json();
        window.emailCheckInProgress = false;
        return data; // Returns { emailExists: true/false, message: '...' }
    } catch (error) {
        console.error('Error checking email:', error);
        window.emailCheckInProgress = false;
        return null; // Indicate error
    }
}

function displayEmailError(fieldId, message) {
    const emailField = document.getElementById(fieldId);
    let errorDiv = document.getElementById(fieldId + '-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = fieldId + '-error';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.9em';
        errorDiv.style.marginTop = '5px';
        emailField.parentNode.insertBefore(errorDiv, emailField.nextSibling);
    }
    errorDiv.innerHTML = message; // Use innerHTML to allow links
}

function clearEmailError(fieldId) {
    const errorDiv = document.getElementById(fieldId + '-error');
    if (errorDiv) {
        errorDiv.innerHTML = '';
    }
}

// Function to show error messages
function showError(inputElement, message, isGeneral = false) {
    let errorElement = inputElement.nextElementSibling;
    if (isGeneral || !errorElement || !errorElement.classList.contains('error-message')) {
        const newErrorElement = document.createElement('div');
        newErrorElement.className = 'error-message';
        newErrorElement.style.color = 'red';
        newErrorElement.style.fontSize = '0.9em';
        newErrorElement.style.marginTop = '5px';
        inputElement.parentNode.insertBefore(newErrorElement, inputElement.nextSibling);
        errorElement = newErrorElement;
    }
    errorElement.textContent = message;
    inputElement.classList.add('input-error'); // Optional: add class to highlight input
}

// Function to clear error messages
function clearError(inputElement) {
    let errorElement = inputElement.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
        inputElement.classList.remove('input-error'); // Optional: remove highlight class
    }
}

// Modify updateLead to NOT run if emailValidationErrorActive is true
async function updateLead() {
    if (window.emailValidationErrorActive || window.emailCheckInProgress) {
        // console.log('UpdateLead: Skipped due to active email validation error or check in progress.');
        return; // Don't proceed if there's an active email error from validateStep or check in progress
    }

    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    // ... existing code ...
}