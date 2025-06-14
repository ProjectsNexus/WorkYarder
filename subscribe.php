<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Your Service | WorkYarder</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/subscribe.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="assets/img/WorkIconic.png" rel="icon">
    <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
    <!-- Add this modal HTML right after the body tag opens -->
    <div id="address-confirm-modal" class="modal">
        <div class="modal-content">
            <h2>Confirm Service Address</h2>
            <p>Please confirm your service address is correct:</p>
            <div id="modal-address" class="address-display"></div>
            <div class="modal-buttons">
                <button class="btn btn-prev" onclick="editAddress()">Edit Address</button>
                <button class="btn btn-confirm" onclick="confirmAddress()">Confirm Address</button>
            </div>
        </div>
    </div>
    <div class="logo">
        <img src="assets/img/WorkYarder-logo.png" alt="WorkYarder Logo">
    </div>
    <div class="form-container">
        <div class="form-card">
            <div class="form-steps">
                <div class="step active" id="step1">
                    1
                    <span class="step-label">Your Info</span>
                </div>
                <div class="step" id="step2">
                    2
                    <span class="step-label">Services</span>
                </div>
                <div class="step" id="step3">
                    3
                    <span class="step-label">Schedule</span>
                </div>
                <div class="step" id="step4">
                    4
                    <span class="step-label">Payment</span>
                </div>
            </div>
            
            <form id="multi-step-form" action="assets/php/book_service.php" method="POST">
                <!-- Add hidden session_id field -->
                <input type="hidden" id="session_id" name="session_id">
                
                <!-- Step 1: User Information -->
                <div class="form-page active" id="page1">
                    <h2>Your Information</h2>
                    <p>Please provide your contact details and select the services you need.</p>
                    
                    <div class="form-group">
                        <label for="full-name">Full Name:</label>
                        <input type="text" id="full-name" name="full-name" required placeholder="Enter your full name">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address:</label>
                        <input type="email" id="email" name="email" required placeholder="Enter your email address">
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number:</label>
                        <input type="tel" id="phone" name="phone" required placeholder="Enter your phone number">
                    </div>
                    
                    <div class="form-group">
                        <label>Select Services (Choose one or more):</label>
                        <div class="service-options">
                            <div class="service-option" onclick="toggleServiceSelection(this, 'housekeeping')">
                                <i class="fa solid fa-broom"></i>
                                <h3>Housekeeping</h3>
                                <p>Professional cleaning services for your home</p>
                                <input type="checkbox" name="selected-services[]" value="housekeeping" style="display: none;">
                            </div>
                            
                            <div class="service-option" onclick="toggleServiceSelection(this, 'lawn-care')">
                                <i class="fas fa-leaf"></i>
                                <h3>Lawn Care</h3>
                                <p>Complete lawn maintenance and landscaping</p>
                                <input type="checkbox" name="selected-services[]" value="lawn-care" style="display: none;">
                            </div>
                            
                            <div class="service-option" onclick="toggleServiceSelection(this, 'pool-service')">
                                <i class="fas fa-swimming-pool"></i>
                                <h3>Pool Service</h3>
                                <p>Pool cleaning and maintenance services</p>
                                <input type="checkbox" name="selected-services[]" value="pool-service" style="display: none;">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" class="btn btn-prev" onclick="window.location.href='index.html'">Back to Home</button>
                        <button type="button" class="btn btn-next" onclick="nextStep(1)">Continue</button>
                    </div>
                </div>
                
                <!-- Step 2: Service Details -->
                <div class="form-page" id="page2">
                    <h2>Service Details</h2>
                    <p>Please provide details for your selected services.</p>
                    
                    <!-- Service Tabs -->
                    <div class="service-tabs" id="service-tabs">
                        <!-- Tabs will be dynamically generated based on selected services -->
                    </div>
                    
                    <!-- Service Forms Container -->
                    <div class="service-forms-container">
                        <!-- Housekeeping Options -->
                        <div id="housekeeping-options" class="service-form" style="display: none;">
                            <h3>Housekeeping Details</h3>
                            
                            <div class="form-group">
                                <label>Rooms to Clean:</label>
                                <div class="checkbox-group rooms-grid">
                                    <label><input type="checkbox" name="rooms[]" value="kitchen" data-price="40" checked onchange="updateServicePrice('housekeeping')"> Kitchen ($40)</label>
                                    <label><input type="checkbox" name="rooms[]" value="living_room" data-price="35" checked onchange="updateServicePrice('housekeeping')"> Living Room ($35)</label>
                                    <label><input type="checkbox" name="rooms[]" value="dining_room" data-price="30" checked onchange="updateServicePrice('housekeeping')"> Dining Room ($30)</label>
                                    <label><input type="checkbox" name="rooms[]" value="hallway" data-price="20" checked onchange="updateServicePrice('housekeeping')"> Hallway ($20)</label>
                                    <label><input type="checkbox" name="rooms[]" value="bedroom" data-price="35" onchange="toggleRoomOptions('bedroom'); updateServicePrice('housekeeping')"> Bedrooms (from $35)</label>
                                    <label><input type="checkbox" name="rooms[]" value="bathroom" data-price="30" onchange="toggleRoomOptions('bathroom'); updateServicePrice('housekeeping')"> Bathrooms (from $30)</label>
                                    <label><input type="checkbox" name="rooms[]" value="laundry_room" data-price="25" onchange="updateServicePrice('housekeeping')"> Laundry Room ($25)</label>
                                    <label><input type="checkbox" name="rooms[]" value="office" data-price="30" onchange="updateServicePrice('housekeeping')"> Home Office ($30)</label>
                                </div>
                            </div>

                            <!-- Conditional Dropdowns -->
                            <div id="bedroom-options" class="form-group conditional-options" style="display: none;">
                                <label for="bedrooms">Number of Bedrooms:</label>
                                <select id="bedrooms" name="bedrooms" onchange="updateServicePrice('housekeeping')">
                                    <option value="1" data-price="35">1 Bedroom ($35)</option>
                                    <option value="2" data-price="65">2 Bedrooms ($65)</option>
                                    <option value="3" data-price="90">3 Bedrooms ($90)</option>
                                    <option value="4" data-price="110">4 Bedrooms ($110)</option>
                                    <option value="5" data-price="130">5+ Bedrooms ($130)</option>
                                </select>
                            </div>
                            
                            <div id="bathroom-options" class="form-group conditional-options" style="display: none;">
                                <label for="bathrooms">Number of Bathrooms:</label>
                                <select id="bathrooms" name="bathrooms" onchange="updateServicePrice('housekeeping')">
                                    <option value="1" data-price="30">1 Bathroom ($30)</option>
                                    <option value="2" data-price="55">2 Bathrooms ($55)</option>
                                    <option value="3" data-price="75">3 Bathrooms ($75)</option>
                                    <option value="4" data-price="90">4 Bathrooms ($90)</option>
                                    <option value="5" data-price="110">5+ Bathrooms ($110)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="home-type">Home Layout:</label>
                                <select id="home-type" name="home-type" onchange="updateServicePrice('housekeeping')">
                                    <option value="single" data-price="0">Single Level</option>
                                    <option value="two-story" data-price="25">Two Story (+$25)</option>
                                    <option value="three-story" data-price="45">Three Story (+$45)</option>
                                    <option value="split-level" data-price="35">Split Level (+$35)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="cleaning-type">Type of Cleaning:</label>
                                <div class="radio-group" id="housekeeping-cleaning-type-group">
                                    <label><input type="radio" name="cleaning-type" value="standard" data-price-multiplier="1" onchange="updateServicePrice('housekeeping')" checked> Standard Cleaning</label>
                                    <label><input type="radio" name="cleaning-type" value="deep" data-price-multiplier="1.5" onchange="updateServicePrice('housekeeping')"> Deep Cleaning (+50%)</label>
                                    <label><input type="radio" name="cleaning-type" value="move-in-out" data-price-multiplier="2" onchange="updateServicePrice('housekeeping')"> Move-In/Move-Out (+100%)</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Additional Services:</label>
                                <div class="additional-services">
                                    <div class="service-category">
                                        <h4>Kitchen Extras</h4>
                                        <div class="checkbox-group" id="housekeeping-kitchen-extras-group">
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="inside-fridge" data-price="15" onchange="updateServicePrice('housekeeping')"> Inside Fridge (+$15)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="inside-oven" data-price="20" onchange="updateServicePrice('housekeeping')"> Inside Oven (+$20)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="inside-cabinets" data-price="25" onchange="updateServicePrice('housekeeping')"> Inside Cabinets (+$25)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="dishwasher" data-price="10" onchange="updateServicePrice('housekeeping')"> Load/Unload Dishwasher (+$10)</label>
                                        </div>
                                    </div>

                                    <div class="service-category">
                                        <h4>General Services</h4>
                                <div class="checkbox-group" id="housekeeping-general-extras-group">
                                    <label><input type="checkbox" name="housekeeping-extras[]" value="windows" data-price="25" onchange="updateServicePrice('housekeeping')"> Window Cleaning (+$25)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="blinds" data-price="20" onchange="updateServicePrice('housekeeping')"> Blind Cleaning (+$20)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="baseboards" data-price="15" onchange="updateServicePrice('housekeeping')"> Baseboard Cleaning (+$15)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="walls" data-price="30" onchange="updateServicePrice('housekeeping')"> Wall Cleaning (+$30)</label>
                                        </div>
                                    </div>

                                    <div class="service-category">
                                        <h4>Laundry & Organization</h4>
                                        <div class="checkbox-group" id="housekeeping-laundry-extras-group">
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="laundry" data-price="30" onchange="updateServicePrice('housekeeping')"> Laundry Service (+$30)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="fold-clothes" data-price="15" onchange="updateServicePrice('housekeeping')"> Fold & Put Away Clothes (+$15)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="organize-closet" data-price="25" onchange="updateServicePrice('housekeeping')"> Closet Organization (+$25)</label>
                                            <label><input type="checkbox" name="housekeeping-extras[]" value="make-beds" data-price="10" onchange="updateServicePrice('housekeeping')"> Make Beds (+$10)</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Lawn Care Options -->
                        <div id="lawn-care-options" class="service-form" style="display: none;">
                            <h3>Lawn Care Details</h3>
                            
                            <div class="form-group">
                                <label for="lawn-size">Lawn Size:</label>
                                <select id="lawn-size" name="lawn-size" onchange="updateServicePrice('lawn-care')">
                                    <option value="small" data-price="50">Small (Under 1,000 sq ft) - $50</option>
                                    <option value="medium" data-price="75">Medium (1,000-5,000 sq ft) - $75</option>
                                    <option value="large" data-price="100">Large (5,000-10,000 sq ft) - $100</option>
                                    <option value="xlarge" data-price="150">Extra Large (10,000+ sq ft) - $150</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="lawn-service-type">Service Type:</label>
                                <div class="radio-group" id="lawn-care-service-type-group">
                                    <label><input type="radio" name="lawn-service-type" value="mowing" data-price="0" onchange="updateServicePrice('lawn-care')" checked> Lawn Mowing</label>
                                    <label><input type="radio" name="lawn-service-type" value="full" data-price="30" onchange="updateServicePrice('lawn-care')"> Full Service (Mow, Edge, Trim) (+$30)</label>
                                    <label><input type="radio" name="lawn-service-type" value="cleanup" data-price="50" onchange="updateServicePrice('lawn-care')"> Yard Cleanup (+$50)</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Additional Services:</label>
                                <div class="additional-services">
                                    <div class="service-category">
                                        <h4>Lawn Treatment</h4>
                                <div class="checkbox-group" id="lawn-care-treatment-extras-group">
                                    <label><input type="checkbox" name="lawn-extras[]" value="fertilization" data-price="35" onchange="updateServicePrice('lawn-care')"> Fertilization (+$35)</label>
                                    <label><input type="checkbox" name="lawn-extras[]" value="aeration" data-price="45" onchange="updateServicePrice('lawn-care')"> Aeration (+$45)</label>
                                    <label><input type="checkbox" name="lawn-extras[]" value="weed-control" data-price="25" onchange="updateServicePrice('lawn-care')"> Weed Control (+$25)</label>
                                        </div>
                                    </div>

                                    <div class="service-category">
                                        <h4>Seasonal Services</h4>
                                        <div class="checkbox-group" id="lawn-care-seasonal-extras-group">
                                    <label><input type="checkbox" name="lawn-extras[]" value="leaf-removal" data-price="30" onchange="updateServicePrice('lawn-care')"> Leaf Removal (+$30)</label>
                                            <label><input type="checkbox" name="lawn-extras[]" value="snow-removal" data-price="40" onchange="updateServicePrice('lawn-care')"> Snow Removal (+$40)</label>
                                            <label><input type="checkbox" name="lawn-extras[]" value="spring-cleanup" data-price="60" onchange="updateServicePrice('lawn-care')"> Spring Cleanup (+$60)</label>
                                        </div>
                                    </div>

                                    <div class="service-category">
                                        <h4>Landscaping</h4>
                                        <div class="checkbox-group" id="lawn-care-landscaping-extras-group">
                                            <label><input type="checkbox" name="lawn-extras[]" value="hedge-trimming" data-price="25" onchange="updateServicePrice('lawn-care')"> Hedge Trimming (+$25)</label>
                                            <label><input type="checkbox" name="lawn-extras[]" value="mulching" data-price="35" onchange="updateServicePrice('lawn-care')"> Mulching (+$35)</label>
                                            <label><input type="checkbox" name="lawn-extras[]" value="garden-maintenance" data-price="45" onchange="updateServicePrice('lawn-care')"> Garden Maintenance (+$45)</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pool Service Options -->
                        <div id="pool-service-options" class="service-form" style="display: none;">
                            <h3>Pool Service Details</h3>
                            
                            <div class="form-group">
                                <label for="pool-size">Pool Size:</label>
                                <select id="pool-size" name="pool-size" onchange="updateServicePrice('pool-service')">
                                    <option value="small" data-price="60">Small (Up to 10,000 gallons) - $60</option>
                                    <option value="medium" data-price="100">Medium (10,000-20,000 gallons) - $100</option>
                                    <option value="large" data-price="140">Large (20,000+ gallons) - $140</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="pool-type">Pool Type:</label>
                                <select id="pool-type" name="pool-type" onchange="updateServicePrice('pool-service')">
                                    <option value="in-ground" data-price="20">In-Ground (+$20)</option>
                                    <option value="above-ground" data-price="0">Above-Ground</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Service Type:</label>
                                <div class="radio-group" id="pool-service-service-type-group">
                                    <label><input type="radio" name="pool-service-type" value="cleaning" data-price="0" onchange="updateServicePrice('pool-service')" checked> Regular Cleaning</label>
                                    <label><input type="radio" name="pool-service-type" value="maintenance" data-price="40" onchange="updateServicePrice('pool-service')"> Maintenance (+$40)</label>
                                    <label><input type="radio" name="pool-service-type" value="repair" data-price="80" onchange="updateServicePrice('pool-service')"> Repair (+$80)</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Additional Services:</label>
                                <div class="additional-services">
                                    <div class="service-category">
                                        <h4>Water Treatment</h4>
                                <div class="checkbox-group" id="pool-water-treatment-extras-group">
                                    <label><input type="checkbox" name="pool-extras[]" value="chemical-balancing" data-price="40" onchange="updateServicePrice('pool-service')"> Chemical Balancing (+$40)</label>
                                    <label><input type="checkbox" name="pool-extras[]" value="algae-treatment" data-price="50" onchange="updateServicePrice('pool-service')"> Algae Treatment (+$50)</label>
                                            <label><input type="checkbox" name="pool-extras[]" value="shock-treatment" data-price="35" onchange="updateServicePrice('pool-service')"> Shock Treatment (+$35)</label>
                                        </div>
                                    </div>

                                    <div class="service-category">
                                        <h4>Equipment Services</h4>
                                        <div class="checkbox-group" id="pool-equipment-extras-group">
                                            <label><input type="checkbox" name="pool-extras[]" value="filter-cleaning" data-price="35" onchange="updateServicePrice('pool-service')"> Filter Cleaning (+$35)</label>
                                    <label><input type="checkbox" name="pool-extras[]" value="equipment-check" data-price="25" onchange="updateServicePrice('pool-service')"> Equipment Check (+$25)</label>
                                            <label><input type="checkbox" name="pool-extras[]" value="pump-service" data-price="45" onchange="updateServicePrice('pool-service')"> Pump Service (+$45)</label>
                                        </div>
                                    </div>

                                    <div class="service-category">
                                        <h4>Seasonal Services</h4>
                                        <div class="checkbox-group" id="pool-seasonal-extras-group">
                                            <label><input type="checkbox" name="pool-extras[]" value="opening" data-price="75" onchange="updateServicePrice('pool-service')"> Pool Opening (+$75)</label>
                                            <label><input type="checkbox" name="pool-extras[]" value="closing" data-price="75" onchange="updateServicePrice('pool-service')"> Pool Closing (+$75)</label>
                                            <label><input type="checkbox" name="pool-extras[]" value="winterization" data-price="100" onchange="updateServicePrice('pool-service')"> Winterization (+$100)</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Service Summary and Total -->
                    <div class="service-summary">
                        <h3>Service Summary</h3>
                        <div id="service-summary-items">
                            <!-- Service items will be dynamically added here -->
                        </div>
                        <div class="total-section">
                            <div class="total-row">
                                <span>Total:</span>
                                <span id="total-price">$0.00</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" class="btn btn-prev" onclick="prevStep(2)">Previous</button>
                        <button type="button" class="btn btn-next" onclick="nextStep(2)">Continue</button>
                    </div>
                </div>
                
                <!-- Step 3: Schedule Appointment -->
                <div class="form-page" id="page3">
                    <h2>Schedule Your Appointments</h2>
                    <p>Please select a date and time for each service.</p>
                    
                    <!-- Service Selection Boxes -->
                    <div class="service-selection-boxes">
                        <!-- These will be dynamically generated based on selected services -->
                    </div>
                    
                    <div class="scheduling-container">
                        <h3>Schedule for <span id="scheduling-service-name">Service</span></h3>
                        
                        <div class="calendar-container">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <button type="button" class="btn btn-prev" style="padding: 5px 10px;" onclick="prevMonth()">&lt; Prev</button>
                                <h3 id="current-month">September 2023</h3>
                                <button type="button" class="btn btn-next-calendar" style="padding: 5px 10px;" onclick="nextMonth()">Next &gt;</button>
                            </div>
                            
                            <div class="calendar-header">
                                <span>Sun</span>
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                            </div>
                            
                            <div class="calendar" id="calendar-days">
                                <!-- Calendar days will be generated by JavaScript -->
                            </div>
                            
                            <div class="time-slots" id="time-slots" style="margin-top: 30px; display: none;">
                                <h3>Select a Time</h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;" id="timeSlotsContainer">
                                    <!-- <div class="time-slot" onclick="selectTimeSlot(this)">7:00 AM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">8:00 AM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">9:00 AM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">10:00 AM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">11:00 AM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">12:00 PM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">1:00 PM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">2:00 PM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">3:00 PM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">4:00 PM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">5:00 PM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">6:00 PM</div>
                                    <div class="time-slot" onclick="selectTimeSlot(this)">7:00 PM</div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Schedule Summary -->
                    <div class="service-summary">
                        <h3>Appointment Summary</h3>
                        <div id="schedule-summary-items">
                            <!-- Schedule items will be dynamically added here -->
                        </div>
                    </div>
                    
                    <input type="hidden" id="selected-dates" name="selected-dates">
                    <input type="hidden" id="selected-times" name="selected-times">
                    
                    <div class="form-buttons">
                        <button type="button" class="btn btn-prev" onclick="prevStep(3)">Previous</button>
                        <button type="button" class="btn btn-next" onclick="nextStep(3)">Continue</button>
                    </div>
                </div>
                
                <!-- Step 4: Payment Options -->
                <div class="form-page" id="page4">
                    <h2>Complete Your Booking</h2>
                    
                    <div style="margin-bottom: 30px;">
                        <h3>Order Summary</h3>
                        <div class="summary-item">
                            <span class="summary-label">Service:</span>
                            <span class="summary-value" id="summary-service">Housekeeping</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Service Address:</span>
                            <span class="summary-value" id="summary-address"></span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Date & Time:</span>
                            <span class="summary-value" id="summary-datetime">September 15, 2023 at 10:00 AM</span>
                        </div>
                        <div class="total">
                            Total: $<span id="service-price">149.99</span>
                        </div>
                    </div>
                    
                    <h3>Choose Payment Option</h3>
                    
                    <div class="payment-options">
                        <div class="payment-option" onclick="selectPaymentOption(this, 'one-time')">
                            <h4>One-Time Payment</h4>
                            <p>Pay for this service only</p>
                            <input type="radio" name="payment-option" value="one-time" style="display: none;">
                        </div>
                        
                        <div class="payment-option" onclick="selectPaymentOption(this, 'subscription')">
                            <h4>Subscribe & Save 15%</h4>
                            <p>Regular service with automatic billing</p>
                            <input type="radio" name="payment-option" value="subscription" style="display: none;">
                        </div>
                    </div>
                    
                    <div id="payment-form" style="margin-top: 30px;">
                        <!-- One-Time Payment Option -->
                        <div id="one-time-payment" style="display: none;">
                            <p>You will be redirected to our secure payment processor to complete your booking.</p>
                            <div id="card-element" style="margin: 20px 0;"></div>
                            <div id="card-errors" role="alert" style="color: #dc3545; margin-bottom: 20px;"></div>
                        </div>
                        
                        <!-- Subscription Account Creation -->
                        <div id="subscription-signup" style="display: none;">
                            <h3>Create Your Account</h3>
                            <p>Sign up to manage your subscription and save 15% on recurring services.</p>
                            
                            <div class="form-group">
                                <label for="username">Username:</label>
                                <input type="text" id="username" name="username" required autocomplete="username">
                            </div>
                            
                            <div class="form-group">
                                <label for="signup-email">Email:</label>
                                <input type="email" id="signup-email" name="signup-email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Password:</label>
                                <input type="password" id="password" name="password" required autocomplete="new-password">
                            </div>
                            
                            <div class="form-group">
                                <label for="confirm-password">Confirm Password:</label>
                                <input type="password" id="confirm-password" name="confirm-password" required autocomplete="new-password">
                            </div>

                            <div class="form-group">
                                <label for="subscription-frequency">Service Frequency:</label>
                                <select id="subscription-frequency" name="subscription-frequency" required>
                                    <option value="">Select Frequency</option>
                                    <option value="weekly">Weekly (Save 15%)</option>
                                    <option value="biweekly">Bi-Weekly (Save 10%)</option>
                                    <option value="monthly">Monthly (Save 5%)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" class="btn btn-prev" onclick="prevStep(4)">Previous</button>
                        <button type="button" class="btn btn-next" onclick="handleBookingSubmission()">
                            Continue to Payment
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <script src="assets/js/subscribe6b.js" defer></script>
</body>
</html>