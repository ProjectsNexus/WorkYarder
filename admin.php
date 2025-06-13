<?php
include 'assets/php/access_control.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="WorkYarder Admin Dashboard - Manage your business">
    <title>Admin Dashboard - WorkYarder</title>
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="stylesheet" href="assets/css/admin.css">
    <link rel="stylesheet" href="assets/css/owner.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="assets/img/WorkIconic.png" rel="icon">
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- FullCalendar Dependencies -->
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
    <!-- Include Chart.js for the marketing analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="admin-dashboard">
    <div class="dashboard-container">
        <!-- Sidebar Backdrop -->
        <div class="sidebar-backdrop"></div>
        
        <!-- Sidebar Navigation -->
        <nav class="sidebar">
            <div class="sidebar-header">
                <img src="assets/img/WorkYarder-logo.png" alt="WorkYarder Logo" class="dashboard-logo">
            </div>
            <div class="sidebar-links">
                <a href="#" class="active" onclick="showSection('dashboard')">
                    <i class="fas fa-th-large"></i>
                    <span>Dashboard</span>
                </a>
                <a href="#" onclick="showSection('appointments')">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Appointments</span>
                </a>
                <a href="#" onclick="showSection('crm')">
                    <i class="fas fa-users"></i>
                    <span>CRM</span>
                </a>
                <a href="#" onclick="showSection('marketing')">
                    <i class="fas fa-bullhorn"></i>
                    <span>Marketing</span>
                </a>
                <a href="#" onclick="showSection('team')">
                    <i class="fas fa-users-cog"></i>
                    <span>Team Management</span>
                </a>
                <a href="#" onclick="showSection('support')">
                    <i class="fas fa-headset"></i>
                    <span>Support & Contact</span>
                </a>
                <a href="#" onclick="showSection('settings')">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
                <a href="assets/php/logout.php" class="logout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </a>
            </div>
        </nav>

        <!-- Main Content Area -->
        <main class="main-content">
            <!-- Top Bar -->
            <div class="top-bar">
                <button class="menu-toggle" onclick="toggleSidebar()">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="user-info">
                    <span class="welcome-message">Admin Dashboard - <?php echo isset($userData['first_name']) ? htmlspecialchars($userData['first_name'] . ' ' . $userData['last_name']) : 'Administrator'; ?></span>
                </div>
            </div>

            <!-- Dashboard Section -->
            <div id="dashboard-section" class="dashboard-section active">
                <h1>Business Overview</h1>
                <div class="dashboard-grid">
                    <!-- Today's Services -->
                    <div class="dashboard-card">
                        <h2>Today's Services</h2>
                        <div class="service-list">
                            <div class="service-item">
                                <div>
                                    <h4>Service Type</h4>
                                    <p>Customer Name - Time</p>
                                </div>
                                <span class="status-badge status-booked">Booked</span>
                            </div>
                            <!-- More service items will be dynamically added -->
                        </div>
                    </div>

                    <!-- Profits Section -->
                    <div class="profits-section">
                        <!-- Profits Chart -->
                        <div class="dashboard-card stats-card">
                            <h2>Profits Chart</h2>
                            <div class="profit-chart">
                                <!-- Profit chart will be added here -->
                        </div>
                    </div>

                    <!-- Profits Overview -->
                    <div class="dashboard-card stats-card">
                        <h2>Profits Overview</h2>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <i class="fas fa-calendar-check"></i>
                                <h3>Today's Appointments</h3>
                                <p class="stat-number">0</p>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-dollar-sign"></i>
                                <h3>Today's Revenue</h3>
                                <p class="stat-number">$0.00</p>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-user-plus"></i>
                                <h3>New Customers</h3>
                                <p class="stat-number">0</p>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-star"></i>
                                <h3>Monthly Average Rating</h3>
                                <p class="stat-number">N/A</p>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-chart-line"></i>
                                <h3>Monthly Revenue</h3>
                                <p class="stat-number">$0.00</p>
                            </div>
                        </div>
                        <div class="profit-chart">
                            <!-- Profit chart will be added here -->
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Appointments Section -->
            <div id="appointments-section" class="dashboard-section">
                <h1>Appointment Management</h1>
                <div class="schedule-controls">
                    <div class="schedule-filters">
                        <button class="filter-btn active" onclick="filterAppointments('all')">All Services</button>
                        <button class="filter-btn" onclick="filterAppointments('housekeeping')">Housekeeping</button>
                        <button class="filter-btn" onclick="filterAppointments('lawn')">Lawn Care</button>
                        <button class="filter-btn" onclick="filterAppointments('pool')">Pool Service</button>
                    </div>
                    <div class="schedule-actions">
                        <button class="btn-primary" data-modal="quick-service">
                            <i class="fas fa-plus"></i> Add Appointment
                        </button>
                    </div>
                    </div>

                <div class="schedule-container">
                    <!-- Appointment Requests - 30% width -->
                    <div class="schedule-sidebar">
                        <h2>Pending Appointments</h2>
                        <div class="service-requests-list">
                            <div class="service-request-item" data-appointment-id="1">
                                <div class="service-request-details">
                                    <h4>Deep House Cleaning</h4>
                                    <p>123 Main St, Dallas, TX</p>
                                    <span class="service-type-badge type-housekeeping">Housekeeping</span>
                        </div>
                                <div class="request-actions">
                                    <button class="btn-primary" data-modal="appointment-details" data-appointment-id="1">Confirm</button>
                                    <button class="btn-secondary" data-modal="appointment-details" data-appointment-id="1">Details</button>
                        </div>
                    </div>
                            <div class="service-request-item" data-appointment-id="2">
                                <div class="service-request-details">
                                    <h4>Weekly Pool Maintenance</h4>
                                    <p>456 Oak Ave, Dallas, TX</p>
                                    <span class="service-type-badge type-pool">Pool Service</span>
                                </div>
                                <div class="request-actions">
                                    <button class="btn-primary" data-modal="appointment-details" data-appointment-id="2">Confirm</button>
                                    <button class="btn-secondary" data-modal="appointment-details" data-appointment-id="2">Details</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Calendar - 70% width -->
                    <div class="schedule-main">
                        <div id="appointments-calendar"></div>
                    </div>
                </div>
            </div>

            <!-- CRM Section -->
            <div id="crm-section" class="dashboard-section">
                <h1>Customer Relationship Management</h1>
                
                <div class="dashboard-overview-cards">
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="overview-data">
                            <h3>521</h3>
                            <p>Total Customers</p>
                        </div>
                        <div class="overview-chart">
                            <div class="mini-chart" id="customers-chart"></div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="overview-data">
                            <h3>48</h3>
                            <p>New This Month</p>
                        </div>
                        <div class="overview-chart">
                            <div class="mini-chart" id="new-customers-chart"></div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-sync"></i>
                        </div>
                        <div class="overview-data">
                            <h3>73%</h3>
                            <p>Retention Rate</p>
                        </div>
                        <div class="overview-chart">
                            <div class="mini-chart" id="retention-chart"></div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="overview-data">
                            <h3>$187</h3>
                            <p>Avg. Customer Value</p>
                        </div>
                        <div class="overview-chart">
                            <div class="mini-chart" id="customer-value-chart"></div>
                        </div>
                    </div>

                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="overview-data">
                            <h3>2.4</h3>
                            <p>Avg. Services per Month</p>
                        </div>
                        <div class="overview-chart">
                            <div class="mini-chart" id="service-frequency-chart"></div>
                        </div>
                    </div>

                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="overview-data">
                            <h3>4.8/5</h3>
                            <p>Customer Satisfaction</p>
                        </div>
                        <div class="overview-chart">
                            <div class="mini-chart" id="satisfaction-chart"></div>
                        </div>
                    </div>
                </div>
                
                <div class="crm-grid">
                    <!-- Customer Data -->
                    <div class="dashboard-card customer-database-card">
                        <div class="card-header">
                            <h2>Customer Database</h2>
                            <div class="card-actions">
                                <button class="btn-icon" title="Export Data"><i class="fas fa-download"></i></button>
                                <button class="btn-icon" title="Settings"><i class="fas fa-cog"></i></button>
                            </div>
                        </div>
                        
                        <div class="search-filter-bar">
                            <div class="search-bar">
                                <input type="text" placeholder="Search customers...">
                                <button><i class="fas fa-search"></i></button>
                            </div>
                            <div class="filter-options">
                                <select class="filter-select">
                                    <option value="">All Services</option>
                                    <option value="housekeeping">Housekeeping</option>
                                    <option value="lawn-care">Lawn Care</option>
                                    <option value="pool-service">Pool Service</option>
                                </select>
                                <select class="filter-select">
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <button class="btn-filter"><i class="fas fa-sliders-h"></i> More Filters</button>
                            </div>
                        </div>
                        
                        <div class="customer-list-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th><input type="checkbox"></th>
                                        <th>Customer <i class="fas fa-sort"></i></th>
                                        <th>Location <i class="fas fa-sort"></i></th>
                                        <th>Services <i class="fas fa-sort"></i></th>
                                        <th>Last Service <i class="fas fa-sort"></i></th>
                                        <th>LTV <i class="fas fa-sort"></i></th>
                                        <th>Status <i class="fas fa-sort"></i></th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input type="checkbox"></td>
                                        <td>
                                            <div class="customer-info">
                                                <div class="customer-avatar">JD</div>
                                                <div>
                                                    <div class="customer-name">John Doe</div>
                                                    <div class="customer-email">john.doe@example.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>Dallas, TX</td>
                                        <td>
                                            <div class="service-badges">
                                                <span class="service-badge housekeeping">Housekeeping</span>
                                                <span class="service-badge lawn-care">Lawn Care</span>
                                            </div>
                                        </td>
                                        <td>May 12, 2023</td>
                                        <td>$1,240</td>
                                        <td><span class="status-badge status-active">Active</span></td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn-icon" title="View Details"><i class="fas fa-eye"></i></button>
                                                <button class="btn-icon" title="Edit Customer"><i class="fas fa-edit"></i></button>
                                                <button class="btn-icon" title="More Options"><i class="fas fa-ellipsis-v"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input type="checkbox"></td>
                                        <td>
                                            <div class="customer-info">
                                                <div class="customer-avatar">JM</div>
                                                <div>
                                                    <div class="customer-name">Jane Miller</div>
                                                    <div class="customer-email">jane.m@example.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>Austin, TX</td>
                                        <td>
                                            <div class="service-badges">
                                                <span class="service-badge pool-service">Pool Service</span>
                                            </div>
                                        </td>
                                        <td>May 18, 2023</td>
                                        <td>$850</td>
                                        <td><span class="status-badge status-active">Active</span></td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn-icon" title="View Details"><i class="fas fa-eye"></i></button>
                                                <button class="btn-icon" title="Edit Customer"><i class="fas fa-edit"></i></button>
                                                <button class="btn-icon" title="More Options"><i class="fas fa-ellipsis-v"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input type="checkbox"></td>
                                        <td>
                                            <div class="customer-info">
                                                <div class="customer-avatar">RW</div>
                                                <div>
                                                    <div class="customer-name">Robert Williams</div>
                                                    <div class="customer-email">robert.w@example.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>Houston, TX</td>
                                        <td>
                                            <div class="service-badges">
                                                <span class="service-badge lawn-care">Lawn Care</span>
                                                <span class="service-badge pool-service">Pool Service</span>
                                            </div>
                                        </td>
                                        <td>May 15, 2023</td>
                                        <td>$1,875</td>
                                        <td><span class="status-badge status-pending">Pending</span></td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn-icon" title="View Details"><i class="fas fa-eye"></i></button>
                                                <button class="btn-icon" title="Edit Customer"><i class="fas fa-edit"></i></button>
                                                <button class="btn-icon" title="More Options"><i class="fas fa-ellipsis-v"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="pagination-controls">
                            <div class="pagination-info">Showing 1 to 3 of 521 entries</div>
                            <div class="pagination-buttons">
                                <button disabled><i class="fas fa-chevron-left"></i></button>
                                <button class="active">1</button>
                                <button>2</button>
                                <button>3</button>
                                <button>...</button>
                                <button>174</button>
                                <button><i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Insights -->
                    <div class="dashboard-card insights-card">
                        <div class="card-header">
                            <h2>Customer Insights</h2>
                            <div class="card-actions">
                                <button class="btn-icon" title="Export Report"><i class="fas fa-file-export"></i></button>
                            </div>
                        </div>
                        
                        <div class="insights-content">
                            <div class="insights-data-grid">
                                <div class="insights-data-card">
                                    <div class="insights-data-title">Top Service</div>
                                    <div class="insights-data-value">Loading...</div>
                                    <div class="insights-data-meta">Loading...</div>
                                </div>
                                </div>
                            
                            <div class="insights-charts">
                                <div class="insights-chart-container">
                                    <h3>Customer Growth</h3>
                                    <div class="insights-chart">
                                        <canvas id="customer-growth-chart"></canvas>
                                    </div>
                            </div>
                            
                            <div class="service-distribution">
                                <h3>Service Distribution</h3>
                                    <div class="insights-chart">
                                        <canvas id="service-distribution-chart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Marketing Section -->
            <div id="marketing-section" class="dashboard-section">
                <h1>Marketing Tools</h1>
                
                <div class="dashboard-overview-cards">
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div class="overview-data">
                            <h3>$4,250</h3>
                            <p>Monthly Budget</p>
                        </div>
                        <div class="overview-chart">
                            <canvas class="mini-chart" id="marketing-budget-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="overview-data">
                            <h3>14.2%</h3>
                            <p>Conversion Rate</p>
                        </div>
                        <div class="overview-chart">
                            <canvas class="mini-chart" id="conversion-rate-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div class="overview-data">
                            <h3>8</h3>
                            <p>Active Promos</p>
                        </div>
                        <div class="overview-chart">
                            <canvas class="mini-chart" id="active-promos-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="overview-data">
                            <h3>$28</h3>
                            <p>Avg. Acquisition</p>
                        </div>
                        <div class="overview-chart">
                            <canvas class="mini-chart" id="customer-acquisition-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="marketing-dashboard-grid">
                    <!-- Marketing & Communications Section -->
                    <div class="dashboard-card marketing-communications-card">
                        <div class="card-header">
                            <h2>Marketing & Communications</h2>
                            <div class="card-actions">
                                <button class="btn-primary btn-sm" data-modal="new-campaign"><i class="fas fa-plus"></i> New Campaign</button>
                            </div>
                        </div>
                        
                        <div class="marketing-tabs">
                            <button class="marketing-tab active" data-tab="campaigns">Campaigns</button>
                            <button class="marketing-tab" data-tab="promo-codes">Promo Codes</button>
                            <button class="marketing-tab" data-tab="email">Email</button>
                            <button class="marketing-tab" data-tab="referrals">Referral Program</button>
                        </div>
                        
                        <!-- Campaigns Content -->
                        <div class="marketing-content active" id="campaigns-content">
                            <div class="campaign-list">
                                <div class="campaign-item">
                                    <div class="campaign-status active"></div>
                                    <div class="campaign-details">
                                        <h4>Summer Service Bundle</h4>
                                        <div class="campaign-meta">
                                            <span><i class="far fa-calendar-alt"></i> May 15 - Aug 31, 2023</span>
                                            <span><i class="fas fa-tag"></i> 15% Off Bundle</span>
                                        </div>
                                    </div>
                                    <div class="campaign-progress">
                                        <div class="progress-stat">
                                            <div class="stat-label">Budget Used</div>
                                            <div class="stat-value">$1,250 / $2,000</div>
                                            <div class="progress-bar">
                                                <div class="progress" style="width: 62.5%"></div>
                                            </div>
                                        </div>
                                        <div class="progress-stat">
                                            <div class="stat-label">Conversions</div>
                                            <div class="stat-value">48 / 100 Goal</div>
                                            <div class="progress-bar">
                                                <div class="progress" style="width: 48%"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="campaign-actions">
                                        <button class="btn-icon" title="Edit Campaign"><i class="fas fa-edit"></i></button>
                                        <button class="btn-icon" title="Pause Campaign"><i class="fas fa-pause"></i></button>
                                        <button class="btn-icon" title="View Stats"><i class="fas fa-chart-bar"></i></button>
                                    </div>
                                </div>
                                
                                <div class="campaign-item">
                                    <div class="campaign-status active"></div>
                                    <div class="campaign-details">
                                        <h4>New Customer Special</h4>
                                        <div class="campaign-meta">
                                            <span><i class="far fa-calendar-alt"></i> Ongoing</span>
                                            <span><i class="fas fa-tag"></i> $50 Off First Service</span>
                                        </div>
                                    </div>
                                    <div class="campaign-progress">
                                        <div class="progress-stat">
                                            <div class="stat-label">Budget Used</div>
                                            <div class="stat-value">$750 / $1,000</div>
                                            <div class="progress-bar">
                                                <div class="progress" style="width: 75%"></div>
                                            </div>
                                        </div>
                                        <div class="progress-stat">
                                            <div class="stat-label">Conversions</div>
                                            <div class="stat-value">32 / 40 Goal</div>
                                            <div class="progress-bar">
                                                <div class="progress" style="width: 80%"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="campaign-actions">
                                        <button class="btn-icon" title="Edit Campaign"><i class="fas fa-edit"></i></button>
                                        <button class="btn-icon" title="Pause Campaign"><i class="fas fa-pause"></i></button>
                                        <button class="btn-icon" title="View Stats"><i class="fas fa-chart-bar"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Promo Codes Content -->
                        <div class="marketing-content" id="promo-codes-content">
                            <div class="promo-code-controls">
                                <div class="promo-form">
                                    <div class="input-group">
                                        <input type="text" placeholder="Code" class="form-control">
                                        <input type="number" placeholder="Discount %" class="form-control">
                                        <input type="number" placeholder="Uses" class="form-control">
                                        <input type="date" placeholder="Expiry Date" class="form-control">
                                    </div>
                                    <button class="btn-primary">Create Code</button>
                                </div>
                            </div>
                            
                            <div class="promo-code-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Discount</th>
                                            <th>Uses</th>
                                            <th>Expiry</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>SUMMER2023</strong></td>
                                            <td>15%</td>
                                            <td>24/100</td>
                                            <td>Aug 31, 2023</td>
                                            <td><span class="status-badge status-active">Active</span></td>
                                            <td>
                                                <div class="action-buttons">
                                                    <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
                                                    <button class="btn-icon" title="Disable"><i class="fas fa-toggle-on"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                                </div>
                        </div>
                        
                        <!-- Email Content -->
                        <div class="marketing-content" id="email-content">
                            <div class="recent-campaigns">
                                <h3>Recent Email Campaigns</h3>
                                <div class="campaign-item">
                                    <div class="campaign-info">
                                        <div class="campaign-title">Summer Special Offers</div>
                                        <div class="campaign-date">Sent: May 10, 2023</div>
                                    </div>
                                    <div class="campaign-stats">
                                        <div class="stat">
                                            <span class="stat-value">68%</span>
                                            <span class="stat-label">Open Rate</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-value">24%</span>
                                            <span class="stat-label">Click Rate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="campaign-templates">
                                <h3>Email Templates</h3>
                                <div class="templates-grid">
                                    <div class="template-card">
                                        <div class="template-preview">
                                            <i class="far fa-envelope"></i>
                                        </div>
                                        <div class="template-info">
                                            <div class="template-name">Welcome Series</div>
                                            <button class="btn-sm">Use</button>
                                        </div>
                                    </div>
                                    <div class="template-card">
                                        <div class="template-preview">
                                            <i class="far fa-envelope"></i>
                                        </div>
                                        <div class="template-info">
                                            <div class="template-name">Service Reminder</div>
                                            <button class="btn-sm">Use</button>
                                        </div>
                                    </div>
                                    <div class="template-card">
                                        <div class="template-preview">
                                            <i class="far fa-envelope"></i>
                                        </div>
                                        <div class="template-info">
                                            <div class="template-name">Special Offer</div>
                                            <button class="btn-sm">Use</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Referral Program Content -->
                        <div class="marketing-content" id="referrals-content">
                            <div class="referral-program">
                                <div class="referral-header">
                                    <select class="referral-type-select" onchange="switchReferralView(this.value)">
                                        <option value="managers">Manager Referrals</option>
                                        <option value="customers">Customer Referrals</option>
                                    </select>
                                </div>

                                <!-- Manager Referrals View -->
                                <div class="referral-view" id="managers-view">
                                    <div class="referral-stats">
                                        <div class="stat-card">
                                            <div class="stat-value">48</div>
                                            <div class="stat-label">Active Manager Referrals</div>
                                        </div>
                                        <div class="stat-card">
                                            <div class="stat-value">24</div>
                                            <div class="stat-label">Conversions</div>
                                        </div>
                                        <div class="stat-card">
                                            <div class="stat-value">$2,400</div>
                                            <div class="stat-label">Referral Revenue</div>
                                        </div>
                                    </div>
                                    
                                    <div class="referral-settings">
                                        <h3>Manager Referral Settings</h3>
                                        <div class="settings-form">
                                            <div class="form-group">
                                                <label>Manager Reward</label>
                                                <input type="text" value="$100 bonus" class="form-control">
                                            </div>
                                            <div class="form-group">
                                                <label>New Manager Incentive</label>
                                                <input type="text" value="$500 signing bonus" class="form-control">
                                            </div>
                                            <button class="btn-primary">Update Settings</button>
                                        </div>
                                    </div>

                                    <div class="referral-list">
                                        <h3>Recent Manager Referrals</h3>
                                        <table class="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Referring Manager</th>
                                                    <th>Referred Manager</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                        </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>John Smith</td>
                                                    <td>Sarah Johnson</td>
                                                    <td><span class="status-badge status-active">Active</span></td>
                                                    <td>May 15, 2023</td>
                                                    <td>
                                                        <button class="btn-icon" title="View Details"><i class="fas fa-eye"></i></button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                                <!-- Customer Referrals View -->
                                <div class="referral-view" id="customers-view" style="display: none;">
                                <div class="referral-stats">
                                    <div class="stat-card">
                                        <div class="stat-value">142</div>
                                            <div class="stat-label">Active Customer Referrals</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">68</div>
                                        <div class="stat-label">Conversions</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">$3,400</div>
                                        <div class="stat-label">Referral Revenue</div>
                                    </div>
                                </div>
                                
                                <div class="referral-settings">
                                        <h3>Customer Referral Settings</h3>
                                    <div class="settings-form">
                                        <div class="form-group">
                                            <label>Referrer Reward</label>
                                            <input type="text" value="$50 credit" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>New Customer Discount</label>
                                            <input type="text" value="20% off first service" class="form-control">
                                        </div>
                                        <button class="btn-primary">Update Settings</button>
                        </div>
                    </div>
                    
                                    <div class="referral-list">
                                        <h3>Recent Customer Referrals</h3>
                                        <table class="data-table">
                                        <thead>
                                            <tr>
                                                    <th>Referring Customer</th>
                                                    <th>Referred Customer</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                    <td>Emily Davis</td>
                                                    <td>Michael Brown</td>
                                                    <td><span class="status-badge status-pending">Pending</span></td>
                                                    <td>May 18, 2023</td>
                                                    <td>
                                                        <button class="btn-icon" title="View Details"><i class="fas fa-eye"></i></button>
                                                    </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Local SEO & Reputation -->
                    <div class="dashboard-card reputation-card">
                        <div class="card-header">
                            <h2>Local SEO & Reputation</h2>
                            <div class="card-actions">
                                <button class="btn-primary btn-sm"><i class="fas fa-reply"></i> Respond to Reviews</button>
                            </div>
                        </div>
                        
                        <div class="reputation-tabs">
                            <button class="reputation-tab active" data-tab="reviews">Reviews</button>
                            <button class="reputation-tab" data-tab="listings">Business Listings</button>
                            <button class="reputation-tab" data-tab="keywords">Local Keywords</button>
                        </div>
                        
                        <div class="reputation-content active" id="reviews-content" style="display: block;">
                            <div class="reviews-summary">
                                <div class="overall-rating">
                                    <div class="rating-number">4.8</div>
                                    <div class="rating-stars">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star-half-alt"></i>
                                    </div>
                                    <div class="rating-count">234 reviews</div>
                                </div>
                                
                                <div class="rating-breakdown">
                                    <div class="rating-bar">
                                        <div class="rating-label">5 star</div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width: 76%"></div>
                                        </div>
                                        <div class="rating-count">178</div>
                                    </div>
                                    <div class="rating-bar">
                                        <div class="rating-label">4 star</div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width: 18%"></div>
                                        </div>
                                        <div class="rating-count">42</div>
                                    </div>
                                    <div class="rating-bar">
                                        <div class="rating-label">3 star</div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width: 4%"></div>
                                        </div>
                                        <div class="rating-count">9</div>
                                    </div>
                                    <div class="rating-bar">
                                        <div class="rating-label">2 star</div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width: 1%"></div>
                                        </div>
                                        <div class="rating-count">3</div>
                                    </div>
                                    <div class="rating-bar">
                                        <div class="rating-label">1 star</div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width: 1%"></div>
                                        </div>
                                        <div class="rating-count">2</div>
                                    </div>
                                </div>
                                
                                <div class="platform-breakdown">
                                    <div class="platform-rating">
                                        <div class="platform-logo">
                                            <i class="fab fa-google"></i>
                                        </div>
                                        <div class="platform-stats">
                                            <div class="platform-score">4.9</div>
                                            <div class="platform-count">142 reviews</div>
                                        </div>
                                    </div>
                                    <div class="platform-rating">
                                        <div class="platform-logo">
                                            <i class="fab fa-yelp"></i>
                                        </div>
                                        <div class="platform-stats">
                                            <div class="platform-score">4.7</div>
                                            <div class="platform-count">68 reviews</div>
                                        </div>
                                    </div>
                                    <div class="platform-rating">
                                        <div class="platform-logo">
                                            <i class="fab fa-facebook"></i>
                                        </div>
                                        <div class="platform-stats">
                                            <div class="platform-score">4.8</div>
                                            <div class="platform-count">24 reviews</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="recent-reviews">
                                <h3>Recent Reviews</h3>
                                <div class="review-item">
                                    <div class="review-header">
                                        <div class="reviewer-info">
                                            <div class="reviewer-avatar">AM</div>
                                            <div>
                                                <div class="reviewer-name">Amy M.</div>
                                                <div class="review-date">2 days ago via <i class="fab fa-google"></i></div>
                                            </div>
                                        </div>
                                        <div class="review-rating">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                        </div>
                                    </div>
                                    <div class="review-content">
                                        "The housekeeping service was amazing! They cleaned areas I didn't even know needed cleaning. Will definitely use again for my vacation home."
                                    </div>
                                    <div class="review-actions">
                                        <button class="btn-sm"><i class="fas fa-reply"></i> Reply</button>
                                    </div>
                                </div>
                                
                                <div class="review-item">
                                    <div class="review-header">
                                        <div class="reviewer-info">
                                            <div class="reviewer-avatar">TJ</div>
                                            <div>
                                                <div class="reviewer-name">Tom J.</div>
                                                <div class="review-date">5 days ago via <i class="fab fa-yelp"></i></div>
                                            </div>
                                        </div>
                                        <div class="review-rating">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="far fa-star"></i>
                                        </div>
                                    </div>
                                    <div class="review-content">
                                        "Good lawn service. They were on time and did a thorough job. Took care of my lawn while I was on vacation for a month."
                                    </div>
                                    <div class="review-response">
                                        <div class="response-header">Response from management:</div>
                                        <div class="response-content">
                                            "Thank you for your feedback, Tom! We're glad you were satisfied with our lawn care service. We strive to provide reliable service for all our customers, especially when they're away."
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="reputation-content" id="listings-content" style="display: none;">
                            <div class="listings-content">
                                <p class="empty-state">No Record found</p>
                                <!-- Business listings content here -->
                            </div>
                        </div>
                        
                        <div class="reputation-content" id="keywords-content" style="display: none;">
                            <div class="keywords-content">
                                <p class="empty-state">No Record found</p>
                                <!-- Local keywords content here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Team Section -->
            <div id="team-section" class="dashboard-section">
                <div class="section-header">
                    <h1>Team Management</h1>
                </div>

                <!-- Team Overview -->
                <div class="dashboard-overview-cards">
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="overview-data">
                            <h3>0</h3>
                            <p>Active Team</p>
                        </div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="overview-data">
                            <h3>0</h3>
                            <p>Pending Applications</p>
                        </div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="overview-data">
                            <h3>0</h3>
                            <p>Average Rating</p>
                        </div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="overview-data">
                            <h3>0</h3>
                            <p>Completion Rate</p>
                        </div>
                    </div>
                </div>

                <div class="team-dashboard-grid">
                    <!-- Active Team Members -->
                    <div class="dashboard-card team-members-card">
                        <div class="card-header">
                            <h2>Active Team Members</h2>
                            <div class="card-actions">
                                <button class="btn-primary btn-sm" data-modal="add-member">
                                    <i class="fas fa-plus"></i> Add Member
                                </button>
                            </div>
                        </div>
                        
                        <div class="team-filters">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="housekeeping">Housekeeping</button>
                            <button class="filter-btn" data-filter="lawn_care">Lawn Care</button>
                            <button class="filter-btn" data-filter="pool_care">Pool Service</button>
                            <button class="filter-btn" data-filter="manager">Manager</button>
                        </div>
                        
                        <div class="team-members-list" id="team-members-list">
                            <div class="team-member-card">
                                <div class="member-info">
                                    <div class="member-avatar">JS</div>
                                    <div class="member-details">
                                        <h3>John Smith</h3>
                                        <p>Housekeeping Specialist</p>
                                        <div class="member-rating">
                                            <i class="fas fa-star"></i>
                                            <span>4.9 (128 reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="member-stats">
                                    <div class="stat">
                                        <span class="stat-value">156</span>
                                        <span class="stat-label">Services</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value">98%</span>
                                        <span class="stat-label">On-time</span>
                                    </div>
                                </div>
                                <div class="member-actions">
                                    <button class="btn-icon" title="View Profile"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon" title="Edit Member"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon" title="More Options"><i class="fas fa-ellipsis-v"></i></button>
                                </div>
                            </div>
                            <!-- More team member cards will be dynamically added -->
                        </div>
                    </div>

                    <!-- Job Applications -->
                    <div class="dashboard-card applications-card">
                        <div class="card-header">
                            <h2>Job Applications</h2>
                            <div class="card-actions">
                                <div class="filter-controls"> <!-- Or some other container -->
                                    <select class="filter-select" id="role-type-filter" style="margin-right: 10px;"> <!-- Added margin for spacing -->
                                        <option value="all">All Role Types</option>
                                        <option value="professional">Professional Roles</option>
                                        <option value="manager">Manager Roles</option>
                                    </select>
                                    <select class="filter-select" id="position-filter"> <!-- This is your existing filter -->
                                        <option value="all">All Specializations</option> <!-- Changed from All Positions for clarity -->
                                        <option value="housekeeping">Housekeeping</option>
                                        <option value="lawn_care">Lawn Care</option> <!-- Assuming snake_case for consistency -->
                                        <option value="pool_care">Pool Service</option> <!-- Assuming snake_case for consistency -->
                                    </select>
                                    <!-- ... maybe other filters ... -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="applications-list" id="applications-list">
                            <div class="application-item">
                                <div class="applicant-info">
                                    <h3>Sarah Johnson</h3>
                                    <p>Pool Service Specialist</p>
                                    <div class="application-meta">
                                        <span><i class="far fa-clock"></i> Applied: 2 days ago</span>
                                        <span><i class="fas fa-briefcase"></i> 5+ years experience</span>
                                    </div>
                                </div>
                                <div class="application-status">
                                    <span class="status-badge status-pending">Pending Review</span>
                                </div>
                                <div class="application-actions">
                                    <button class="btn-primary btn-sm">Review</button>
                                    <button class="btn-outline btn-sm">Archive</button>
                                </div>
                            </div>
                            <!-- More application items will be dynamically added -->
                        </div>
                    </div>

                    <!-- Team Schedule -->
                    <div class="dashboard-card schedule-card">
                        <div class="card-header">
                            <h2>Team Schedule</h2>
                            <div class="card-actions">
                                <button class="btn-primary btn-sm" data-modal="assign-task">
                                    <i class="fas fa-plus"></i> Assign Task
                                </button>
                            </div>
                        </div>
                        
                        <div class="schedule-content">
                            <div class="schedule-overview">
                                <div class="schedule-filters">
                                    <select class="schedule-select" id="team-schedule-date-filter">
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                    </select>
                                    <div class="filter-buttons" id="team-schedule-manager-type-filter">
                                        <button class="filter-btn active" data-filter="all">All</button>
                                        <button class="filter-btn" data-filter="service-manager">Service Managers</button>
                                        <button class="filter-btn" data-filter="customer-manager">Customer Managers</button>
                                    </div>
                                </div>
                        
                                <div class="team-schedule-list" id="team-schedule-list">
                                    <!-- Schedule items will be populated by JS -->
                                    <div class="empty-state">Loading schedule...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Support & Contact Section -->
            <div id="support-section" class="dashboard-section">
                <h1>Support & Contact Management</h1>
                
                <div class="dashboard-overview-cards">
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-ticket-alt"></i>
                        </div>
                        <div class="overview-data">
                            <h3 id="open-tickets-count">0</h3>
                            <p>Open Tickets</p>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="overview-data">
                            <h3 id="unread-submissions-count">0</h3>
                            <p>Unread Submissions</p>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="overview-data">
                            <h3 id="avg-response-time">0h</h3>
                            <p>Avg. Response Time</p>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="overview-data">
                            <h3 id="resolution-rate">0%</h3>
                            <p>Resolution Rate</p>
                        </div>
                    </div>
                </div>

                <div class="support-grid">
                    <!-- Support Tickets -->
                    <div class="dashboard-card support-tickets-card">
                        <div class="card-header">
                            <h2>Support Tickets</h2>
                            <div class="card-actions">
                                <select class="filter-select" id="ticket-status-filter">
                                    <option value="all">All Tickets</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="ticket-list" id="support-tickets">
                            <!-- Tickets will be populated dynamically -->
                        </div>
                    </div>

                    <!-- Contact Submissions -->
                    <div class="dashboard-card contact-submissions-card">
                        <div class="card-header">
                            <h2>Contact Submissions</h2>
                            <div class="card-actions">
                                <button class="btn-icon" onclick="markAllSubmissionsRead()" title="Mark All as Read">
                                    <i class="fas fa-check-double"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="submissions-list" id="contact-submissions">
                            <!-- Submissions will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings Section -->
            <div id="settings-section" class="dashboard-section">
                <h1>Service Management</h1>
                <div class="dashboard-grid">
                    <!-- Services List -->
                    <div class="dashboard-card services-card">
                        <div class="card-header">
                            <h2>Services</h2>
                            <div class="card-actions">
                                <button class="btn-primary" data-modal="add-service">
                                    <i class="fas fa-plus"></i> Add Service
                                </button>
                            </div>
                        </div>
                        <div class="services-list">
                            <!-- Housekeeping Service -->
                            <div class="service-item">
                                <div class="service-info">
                                    <div class="service-icon">
                                        <i class="fas fa-broom"></i>
                                    </div>
                                    <div class="service-details">
                                        <h3>Housekeeping</h3>
                                        <p>Regular home cleaning service</p>
                                        <div class="service-meta">
                                            <span><i class="fas fa-clock"></i> 2-3 hours</span>
                                            <span><i class="fas fa-dollar-sign"></i> From $120</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="service-actions">
                                    <button class="btn-icon" title="Edit Service"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon" title="View Tasks"><i class="fas fa-tasks"></i></button>
                                    <button class="btn-icon" title="Service Settings"><i class="fas fa-cog"></i></button>
                            </div>
                        
                            <!-- Pool Service -->
                            <div class="service-item">
                                <div class="service-info">
                                    <div class="service-icon">
                                        <i class="fas fa-swimming-pool"></i>
                                    </div>
                                    <div class="service-details">
                                        <h3>Pool Service</h3>
                                        <p>Pool maintenance and cleaning</p>
                                        <div class="service-meta">
                                            <span><i class="fas fa-clock"></i> 1-2 hours</span>
                                            <span><i class="fas fa-dollar-sign"></i> From $80</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="service-actions">
                                    <button class="btn-icon" title="Edit Service"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon" title="View Tasks"><i class="fas fa-tasks"></i></button>
                                    <button class="btn-icon" title="Service Settings"><i class="fas fa-cog"></i></button>
                                </div>
                            </div>

                            <!-- Lawn Care Service -->
                            <div class="service-item">
                                <div class="service-info">
                                    <div class="service-icon">
                                        <i class="fas fa-leaf"></i>
                                    </div>
                                    <div class="service-details">
                                        <h3>Lawn Care</h3>
                                        <p>Lawn maintenance and landscaping</p>
                                        <div class="service-meta">
                                            <span><i class="fas fa-clock"></i> 1-3 hours</span>
                                            <span><i class="fas fa-dollar-sign"></i> From $60</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="service-actions">
                                    <button class="btn-icon" title="Edit Service"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon" title="View Tasks"><i class="fas fa-tasks"></i></button>
                                    <button class="btn-icon" title="Service Settings"><i class="fas fa-cog"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Task Templates -->
                    <div class="dashboard-card task-templates-card">
                        <div class="card-header">
                            <h2>Task Templates</h2>
                            <div class="card-actions">
                                <button class="btn-primary" data-modal="add-template">
                                    <i class="fas fa-plus"></i> Add Template
                                </button>
                            </div>
                        </div>
                        <div class="task-templates-list">
                            <!-- Housekeeping Tasks -->
                            <div class="template-category">
                                <h3>Housekeeping Tasks</h3>
                                <div class="template-items">
                                    <div class="template-item">
                                        <div class="template-content">
                                            <h4>Standard Cleaning</h4>
                                            <ul class="task-checklist">
                                                <li>Vacuum all floors</li>
                                                <li>Dust all surfaces</li>
                                                <li>Clean bathrooms</li>
                                                <li>Clean kitchen</li>
                                            </ul>
                                        </div>
                                        <div class="template-actions">
                                            <button class="btn-icon" title="Edit Template"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon" title="Delete Template"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>

                                    <div class="template-item">
                                        <div class="template-content">
                                            <h4>Deep Cleaning</h4>
                                            <ul class="task-checklist">
                                                <li>All standard cleaning tasks</li>
                                                <li>Clean inside cabinets</li>
                                                <li>Clean windows</li>
                                                <li>Clean baseboards</li>
                                            </ul>
                                        </div>
                                        <div class="template-actions">
                                            <button class="btn-icon" title="Edit Template"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon" title="Delete Template"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Pool Service Tasks -->
                            <div class="template-category">
                                <h3>Pool Service Tasks</h3>
                                <div class="template-items">
                                    <div class="template-item">
                                        <div class="template-content">
                                            <h4>Weekly Maintenance</h4>
                                            <ul class="task-checklist">
                                                <li>Test water chemistry</li>
                                                <li>Clean pool filter</li>
                                                <li>Skim surface</li>
                                                <li>Brush walls and floor</li>
                                            </ul>
                                        </div>
                                        <div class="template-actions">
                                            <button class="btn-icon" title="Edit Template"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon" title="Delete Template"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Lawn Care Tasks -->
                            <div class="template-category">
                                <h3>Lawn Care Tasks</h3>
                                <div class="template-items">
                                    <div class="template-item">
                                        <div class="template-content">
                                            <h4>Basic Lawn Maintenance</h4>
                                            <ul class="task-checklist">
                                                <li>Mow lawn</li>
                                                <li>Edge walkways</li>
                                                <li>Trim bushes</li>
                                                <li>Clean up debris</li>
                                            </ul>
                                        </div>
                                        <div class="template-actions">
                                            <button class="btn-icon" title="Edit Template"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon" title="Delete Template"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="assets/js/admin4u.js"></script>

    <!-- Quick Service Modal -->
    <div id="quick-service-modal" class="modal service-modal"> <!-- Added service-modal class -->
        <div class="modal-content"> <!-- This div will effectively be the .service-modal content area -->
            <!-- HEADER -->
            <div class="service-modal-header">
                <h3>Quick Service Booking</h3>
                <button class="close service-modal-close" onclick="closeModal('quick-service-modal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- BODY -->
            <div class="service-modal-body">
                <form id="quick-service-form">
                    <!-- Customer Information Section -->
                    <div class="form-section">
                        <h4>Customer Information</h4>
                        <div class="form-group">
                            <label for="qs-customer-select">Customer:</label>
                            <select id="qs-customer-select" required onchange="handleCustomerSelectionForQuickService(this.value)">
                                <option value="">Select Customer</option>
                                <option value="new">+ Add New Customer</option>
                                <!-- Customers will be populated by JS -->
                            </select>
                        </div>
                        <div id="qs-new-customer-fields" style="display: none;">
                            <div class="form-group">
                                <label for="qs-new-customer-name">Full Name:</label>
                                <input type="text" id="qs-new-customer-name" placeholder="Enter customer's full name">
                            </div>
                            <div class="form-group">
                                <label for="qs-new-customer-phone">Phone:</label>
                                <input type="tel" id="qs-new-customer-phone" placeholder="Enter phone number">
                            </div>
                            <div class="form-group">
                                <label for="qs-new-customer-email">Email:</label>
                                <input type="email" id="qs-new-customer-email" placeholder="Enter email address">
                            </div>
                            <div class="form-group">
                                <label for="qs-new-customer-address">Address:</label>
                                <input type="text" id="qs-new-customer-address" placeholder="Enter service address">
                            </div>
                        </div>
                        <div id="qs-customer-address-select" class="form-group" style="display: none;">
                            <label for="qs-address-select">Service Address:</label>
                            <select id="qs-address-select" required>
                                <option value="">Select Address</option>
                                <!-- Addresses will be populated by JS -->
                            </select>
                        </div>
                    </div>

                    <!-- Service Details Section -->
                    <div class="form-section">
                        <h4>Service Details</h4>
                        <div class="form-group">
                            <label>Service Type:</label>
                            <div class="service-type-buttons">
                                <button type="button" class="service-btn" data-service="housekeeping" onclick="toggleServiceSelectionForQuickService(this, 'qs-housekeeping-options')">
                                    <i class="fas fa-home"></i> Housekeeping
                                </button>
                                <button type="button" class="service-btn" data-service="lawn-care" onclick="toggleServiceSelectionForQuickService(this, 'qs-lawn-care-options')">
                                    <i class="fas fa-leaf"></i> Lawn Care
                                </button>
                                <button type="button" class="service-btn" data-service="pool-care" onclick="toggleServiceSelectionForQuickService(this, 'qs-pool-care-options')">
                                    <i class="fas fa-swimming-pool"></i> Pool Service
                                </button>
                            </div>
                        </div>

                        <!-- Service Options Container -->
                        <div id="qs-service-options">
                            <!-- Housekeeping Options -->
                            <div class="service-options" id="qs-housekeeping-options" style="display: none;">
                                <div class="form-group">
                                    <label>Package:</label>
                                    <select class="service-package" onchange="updateQuickServiceSummary()">
                                        <option value="1" data-price="125">Standard Clean ($125)</option>
                                        <option value="2" data-price="200">Deep Clean ($200)</option>
                                        <option value="3" data-price="300">Move In/Out ($300)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Additional Services:</label>
                                    <div class="additional-services">
                                        <div class="service-category">
                                            <h4>Kitchen Extras</h4>
                                            <div class="checkbox-group">
                                                <label><input type="checkbox" name="qs-housekeeping-extras[]" value="inside-fridge" data-price="15" onchange="updateQuickServiceSummary()"> Inside Fridge (+$15)</label>
                                                <label><input type="checkbox" name="qs-housekeeping-extras[]" value="inside-oven" data-price="20" onchange="updateQuickServiceSummary()"> Inside Oven (+$20)</label>
                                                <label><input type="checkbox" name="qs-housekeeping-extras[]" value="inside-cabinets" data-price="25" onchange="updateQuickServiceSummary()"> Inside Cabinets (+$25)</label>
                                                <label><input type="checkbox" name="qs-housekeeping-extras[]" value="dishwasher" data-price="10" onchange="updateQuickServiceSummary()"> Load/Unload Dishwasher (+$10)</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Lawn Care Options -->
                            <div class="service-options" id="qs-lawn-care-options" style="display: none;">
                                <div class="form-group">
                                    <label>Service:</label>
                                    <select class="service-package" onchange="updateQuickServiceSummary()">
                                        <option value="4" data-price="45">Mowing ($45)</option>
                                        <option value="5" data-price="75">Full Service ($75)</option>
                                        <option value="6" data-price="100">Yard Cleanup ($100)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Additional Services:</label>
                                    <div class="additional-services">
                                        <div class="service-category">
                                            <h4>Lawn Treatment</h4>
                                            <div class="checkbox-group">
                                                <label><input type="checkbox" name="qs-lawn-extras[]" value="fertilization" data-price="35" onchange="updateQuickServiceSummary()"> Fertilization (+$35)</label>
                                                <label><input type="checkbox" name="qs-lawn-extras[]" value="aeration" data-price="45" onchange="updateQuickServiceSummary()"> Aeration (+$45)</label>
                                                <label><input type="checkbox" name="qs-lawn-extras[]" value="weed-control" data-price="25" onchange="updateQuickServiceSummary()"> Weed Control (+$25)</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Pool Service Options -->
                            <div class="service-options" id="qs-pool-care-options" style="display: none;">
                                <div class="form-group">
                                    <label>Service:</label>
                                    <select class="service-package" onchange="updateQuickServiceSummary()">
                                        <option value="7" data-price="80">Regular Maintenance ($80)</option>
                                        <option value="8" data-price="150">Deep Cleaning ($150)</option>
                                        <option value="9" data-price="200">Repair Service ($200)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Additional Services:</label>
                                    <div class="additional-services">
                                        <div class="service-category">
                                            <h4>Water Treatment</h4>
                                            <div class="checkbox-group">
                                                <label><input type="checkbox" name="qs-pool-extras[]" value="cchemical-balancing" data-price="40" onchange="updateQuickServiceSummary()"> Chemical Balancing (+$40)</label>
                                                <label><input type="checkbox" name="qs-pool-extras[]" value="algae-treatment" data-price="50" onchange="updateQuickServiceSummary()"> Algae Treatment (+$50)</label>
                                                <label><input type="checkbox" name="qs-pool-extras[]" value="shock-treatment" data-price="35" onchange="updateQuickServiceSummary()"> Shock Treatment (+$35)</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> <!-- End qs-service-options -->
                    </div> <!-- End Service Details Section -->

                    <!-- Scheduling Section -->
                    <div class="form-section">
                        <h4>Scheduling</h4>
                        <div class="form-group">
                            <label for="qs-service-date">Service Date:</label>
                            <input type="date" id="qs-service-date" required>
                        </div>
                        <div class="form-group">
                            <label for="qs-service-time-select">Preferred Time:</label>
                            <select id="qs-service-time-select" required>
                                <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                                <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                                <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="qs-service-notes">Notes:</label>
                            <textarea id="qs-service-notes" rows="3" placeholder="Any special instructions or requirements..."></textarea>
                        </div>
                    </div>

                    <!-- Service Summary Section -->
                    <div class="form-section">
                        <h4>Service Summary</h4>
                        <div id="qs-selected-services-summary">
                            <!-- Summary items will be populated by JS -->
                        </div>
                        <div class="total-price">
                            Total: <span id="qs-total-price">$0.00</span>
                        </div>
                    </div>
                </form>
            </div>

            <!-- FOOTER -->
            <div class="service-modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('quick-service-modal')">Cancel</button>
                <button type="button" class="btn-primary" onclick="submitQuickService()">Schedule Service</button>
            </div>
        </div>
    </div>

    <!-- Add Member Modal -->
    <div id="add-member-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add Team Member</h2>
            <div class="">
                <form id="add-member-form">
                    <div class="form-group">
                        <label for="member-name">Full Name:</label>
                        <input type="text" id="member-name" required>
                    </div>
                    <div class="form-group">
                        <label for="member-email">Email:</label>
                        <input type="email" id="member-email" required>
                    </div>
                    <div class="form-group">
                        <label for="member-phone">Phone:</label>
                        <input type="tel" id="member-phone" required>
                    </div>
                    <div class="form-group">
                        <label for="member-role">Role:</label>
                        <select id="member-role" required>
                            <option value="">Select Role</option>
                            <option value="professional">Professional</option>
                            <option value="service-manager">Service Manager</option>
                            <option value="customer-manager">Customer Manager</option>
                        </select>
                    </div>
                    <div class="form-group" id="specialization-group" style="display: none;">
                        <label for="member-specialization">Specialization:</label>
                        <select id="member-specialization">
                            <option value="housekeeping">Housekeeping</option>
                            <option value="lawn_care">Lawn Care</option>
                            <option value="pool_care">Pool Care</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal('add-member-modal')">Cancel</button>
                <button class="btn-primary" onclick="submitNewMember()">Add Member</button>
            </div>
        </div>
    </div>

    <div id="custom-context-menu" style="display:none; position:absolute; z-index:1000;">
        <ul></ul>
    </div>
    <!-- Member Actions Modal -->
    <div id="member-actions-modal" class="modal">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h2>Member Actions</h2>
            <div class="modal-body">
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewMemberSchedule()">
                        <i class="fas fa-calendar"></i>
                        <span>View Schedule</span>
                    </button>
                    <button class="action-btn" onclick="editMemberDetails()">
                        <i class="fas fa-edit"></i>
                        <span>Edit Details</span>
                    </button>
                    <button class="action-btn" onclick="assignTasks()">
                        <i class="fas fa-tasks"></i>
                        <span>Assign Tasks</span>
                    </button>
                    <button class="action-btn" onclick="viewPerformance()">
                        <i class="fas fa-chart-line"></i>
                        <span>View Performance</span>
                    </button>
                    <button class="action-btn warning" onclick="deactivateMember()">
                        <i class="fas fa-user-slash"></i>
                        <span>Deactivate</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Application Actions Modal -->
    <div id="application-actions-modal" class="modal">
        <div class="modal-content">
            <!-- JavaScript will populate this entire area -->
        </div>
    </div>

    <!-- Support Ticket Actions Modal -->
    <div id="ticket-actions-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Support Ticket Details</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ticket-details">
                    <div class="loading-state">Loading ticket details...</div>
                </div>
                <div class="ticket-response-form">
                    <div class="form-group">
                        <label for="ticket-status">Update Status</label>
                        <select id="ticket-status" name="status">
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ticket-response">Response</label>
                        <textarea id="ticket-response" name="response" rows="4" placeholder="Enter your response..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary save-response-btn">Save Response</button>
                <button type="button" class="btn-secondary modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- Submission Actions Modal -->
    <div id="submission-actions-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Contact Submission Details</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="submission-details">
                    <div class="loading-state">Loading submission details...</div>
                </div>
                <div class="submission-response-form">
                    <div class="form-group">
                        <label for="submission-status">Status</label>
                        <select id="submission-status" name="status">
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="submission-notes">Internal Notes</label>
                        <textarea id="submission-notes" name="notes" rows="3" placeholder="Add internal notes..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="submission-response">Email Response</label>
                        <textarea id="submission-response" name="response" rows="4" placeholder="Enter email response..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary send-response-btn">Send Response</button>
                <button type="button" class="btn-secondary mark-read-btn">Mark as Read</button>
                <button type="button" class="btn-secondary modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- Service Actions Modal -->
    <div id="service-actions-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Service Details</h2>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="service-details">
                    <div class="loading-state">Loading service details...</div>
                </div>
                <form id="edit-service-form" class="edit-service-form" style="display: none;">
                    <div class="form-group">
                        <label for="service-name">Service Name</label>
                        <input type="text" id="service-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="service-category">Category</label>
                        <select id="service-category" name="category" required>
                            <option value="housekeeping">Housekeeping</option>
                            <option value="lawn_care">Lawn Care</option>
                            <option value="pool_care">Pool Care</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="service-description">Description</label>
                        <textarea id="service-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="service-price">Base Price</label>
                        <div class="input-with-prefix">
                            <span class="prefix">$</span>
                            <input type="number" id="service-price" name="base_price" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="service-status">Status</label>
                        <select id="service-status" name="status">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary edit-mode-btn " onclick="SaveServiceChange()">Update Service</button>
                <button type="button" class="btn-primary save-service-btn">Save Changes</button>
                <button type="button" class="btn-secondary modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- Service Actions Modal -->
    <div id="service-delete-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Are you sure to Delete.</h2>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="">
                    <p>The Delete Content never be Restore.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary modal-close">Close</button>
                <button type="button" class="btn-danger delete-template-btn">Delete</button>
            </div>
        </div>
    </div>

    <!-- Template Actions Modal -->
    <div id="template-actions-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Task Template Details</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="template-details">
                    <div class="loading-state">Loading template details...</div>
                </div>
                <form id="edit-template-form" class="edit-template-form" style="display: none;">
                    <div class="form-group">
                        <label for="template-name">Template Name</label>
                        <input type="text" id="template-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="template-category">Category</label>
                        <select id="template-category" name="category" required>
                            <option value="housekeeping">Housekeeping</option>
                            <option value="lawn_care">Lawn Care</option>
                            <option value="pool_care">Pool Care</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="template-description">Description</label>
                        <textarea id="template-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="task-list">
                        <h4>Tasks</h4>
                        <div id="template-tasks" class="template-tasks">
                            <!-- Tasks will be added here dynamically -->
                        </div>
                        <button type="button" class="btn-secondary add-task-btn">
                            <i class="fas fa-plus"></i> Add Task
                    </button>
                </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary edit-mode-btn">Edit Template</button>
                <button type="button" class="btn-primary save-template-btn" style="display: none;">Save Changes</button>
                <button type="button" class="btn-danger delete-template-btn">Delete Template</button>
                <button type="button" class="btn-secondary modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- Add Service Modal -->
    <div id="add-service-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add New Service</h2>
            <div class="">
                <div class="form-group">
                    <label for="service-name">Service Name:</label>
                    <input type="text" id="service-name" name="service-name" required>
                </div>

                <div class="form-group">
                    <label for="service-category">Category:</label>
                    <select id="service-category" name="service-category" required>
                        <option value="" disabled selected>Select a category</option>
                        <option value="housekeeping">Housekeeping</option>
                        <option value="lawn_care">Lawn Care</option>
                        <option value="pool_care">Pool Care</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="service-description">Description:</label>
                    <textarea id="service-description" name="service-description" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label for="service-price">Base Price:</label>
                    <div class="input-group">
                        <span class="input-prefix">$</span>
                        <input type="number" id="service-price" name="service-price" min="0" step="0.01" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="service-duration">Duration (minutes):</label>
                    <input type="number" id="service-duration" name="service-duration" min="30" step="30" required>
                </div>
               <!--  <form id="add-service-form">
                    <div class="form-group">
                        <label for="service-name">Service Name:</label>
                        <input type="text" id="service-name" value="" required>
                    </div>
                    <div class="form-group">
                        <label for="service-category">Category:</label>
                        <select id="service-category" required>
                            <option value="housekeeping">Housekeeping</option>
                            <option value="lawn_care">Lawn Care</option>
                            <option value="pool_care">Pool Care</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="service-description">Description:</label>
                        <textarea id="service-description" rows="3" value='' required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="service-price">Base Price:</label>
                        <div class="input-group">
                            <span class="input-prefix">$</span>
                            <input type="number" id="service-price" min="0" step="0.01" value="0" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="service-duration">Duration (minutes):</label>
                        <input type="number" id="service-duration" value="0" min="30" step="30" required>
                    </div>
                </form> -->
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal('add-service-modal')">Cancel</button>
                <button class="btn-primary" onclick="submitNewService()">Add Service</button>
            </div>
        </div>
    </div>

    <!-- Add Template Modal -->
    <div id="add-template-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add Task Template</h2>
            <div class="modal-body">
                <form id="add-template-form">
                    <div class="form-group">
                        <label for="template-name">Template Name:</label>
                        <input type="text" id="template-name" required>
                    </div>
                    <div class="form-group">
                        <label for="template-category">Category:</label>
                        <select id="template-category" required>
                            <option value="housekeeping">Housekeeping</option>
                            <option value="lawn_care">Lawn Care</option>
                            <option value="pool_care">Pool Care</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="template-description">Description:</label>
                        <textarea id="template-description" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="estimated-time">Estimated Time (minutes):</label>
                        <input type="number" id="estimated-time" min="15" step="15" required>
                    </div>
                    <div class="form-group">
                        <label>Required Tasks:</label>
                        <div id="task-list">
                            <div class="task-item">
                                <input type="text" placeholder="Enter task description" required>
                                <button type="button" class="btn-icon" onclick="removeTask(this)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn-secondary" onclick="addTaskField()">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal('add-template-modal')">Cancel</button>
                <button class="btn-primary" onclick="submitNewTemplate()">Add Template</button>
            </div>
        </div>
    </div>

    <!-- Placeholder for New Campaign Modal -->
    <div id="new-campaign-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Create New Campaign</h2>
            <div class="">
                <form id="edit-campaign-form">
                        <input type="hidden" name="id" value="">
                        
                        <div class="form-group">
                            <label for="name">Campaign Name</label>
                            <input type="text" id="name" name="name" value="" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" rows="3"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="start_date">Start Date</label>
                                <input type="date" id="start_date" name="start_date" value="" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="end_date">End Date</label>
                                <input type="date" id="end_date" name="end_date" value="">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="offer">Offer</label>
                            <input type="text" id="offer" name="offer" value="" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status" required>
                                <option value="planned">Planned</option>
                                <option value="active">Active</option>
                                <option value="paused" >Paused</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="budget_total">Budget Total</label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">$</span>
                                <input type="number" id="budget_total" name="budget_total" value="" min="0" step="0.01" required>
                            </div>
                        </div>
                    </form> 
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn-primary">Create Campaign</button>
            </div>
        </div>
    </div>

    <!-- Customer Details Modal -->
    <div id="customer-details-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-header">
            <h2>Customer Details</h2>
            </div>
            <div class="modal-body">
                <div class="customer-profile">
                    <div class="customer-avatar large"></div>
                    <div class="customer-info">
                        <h3 class="customer-name"></h3>
                        <p class="customer-email"></p>
                        <p class="customer-phone"></p>
                        <span class="status-badge"></span>
                    </div>
                    <div class="customer-metrics">
                        <div class="metric">
                            <span class="metric-value orders-count">0</span>
                            <span class="metric-label">Orders</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value total-spent">$0.00</span>
                            <span class="metric-label">Total Spent</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value avg-order">$0.00</span>
                            <span class="metric-label">Avg Order</span>
                        </div>
                    </div>
                </div>

                <div class="customer-tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="orders">Orders</button>
                        <button class="tab-btn" data-tab="addresses">Addresses</button>
                        <button class="tab-btn" data-tab="subscriptions">Subscriptions</button>
                    </div>
                    
                    <div class="tab-content active" id="orders-tab">
                        <h3>Order History</h3>
                        <div class="orders-list">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Orders will be populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="addresses-tab">
                        <h3>Addresses</h3>
                        <div class="address-list">
                            <!-- Addresses will be populated dynamically -->
                        </div>
                    </div>
                    
                    <div class="tab-content" id="subscriptions-tab">
                        <h3>Subscriptions</h3>
                        <div class="subscriptions-list">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Frequency</th>
                                        <th>Next Service</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Subscriptions will be populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary edit-customer-btn">Edit Customer</button>
                <button class="btn-secondary modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- Edit Customer Modal -->
    <div id="edit-customer-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-header">
            <h2>Edit Customer</h2>
            </div>
            <div class="modal-body">
                <form id="edit-customer-form">
                    <input type="hidden" name="customer_id" id="edit-customer-id">
                    
                    <div class="form-group">
                        <label for="edit-first-name">First Name</label>
                        <input type="text" id="edit-first-name" name="first_name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-last-name">Last Name</label>
                        <input type="text" id="edit-last-name" name="last_name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" id="edit-email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-phone">Phone</label>
                        <input type="tel" id="edit-phone" name="phone">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-status">Status</label>
                        <select id="edit-status" name="status" required>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    
                    <div class="addresses-section">
                        <h3>Addresses</h3>
                        <div id="addresses-container">
                            <!-- Address fields will be populated dynamically -->
                        </div>
                        <button type="button" class="btn-secondary add-address-btn">Add Address</button>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-primary save-customer-btn">Save Changes</button>
                <button class="btn-secondary modal-close">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Address Template (hidden, used for adding new addresses) -->
    <template id="address-template">
        <div class="address-form-group">
            <input type="hidden" name="address_id[]" value="">
            <div class="form-group">
                <label>Street Address</label>
                <input type="text" name="street[]" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" name="city[]" required>
                </div>
                <div class="form-group">
                    <label>State</label>
                    <input type="text" name="state[]" required>
                </div>
                <div class="form-group">
                    <label>ZIP Code</label>
                    <input type="text" name="zipcode[]" required>
                </div>
            </div>
            <button type="button" class="btn-icon remove-address-btn" title="Remove Address">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </template>

    <!-- Placeholder for Customer Options Modal -->
    <div id="customer-options-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Customer Options</h2>
            <div class="modal-body">
                <!-- Add Customer Options buttons/actions here -->
                <p>Customer options go here...</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
    
    <!-- Placeholder for Edit Promo Modal -->
    <div id="edit-promo-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Edit Promo Code</h2>
            <div class="modal-body">
                <p>Edit promo code form goes here...</p> 
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn-primary">Save Changes</button>
            </div>
        </div>
    </div>

    <!-- Placeholder for Toggle Promo Status Confirmation -->
    <div id="toggle-promo-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Confirm Status Change</h2>
            <div class="modal-body">
                <p>Are you sure you want to change the status of this promo code?</p> 
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn-primary">Confirm</button> 
            </div>
        </div>
    </div>

    <!-- Appointment Details Modal -->
    <div id="appointment-details-modal" class="modal">
        <div class="modal-content">
            <!-- JavaScript will populate this entire area -->
        </div>
    </div>

    <!-- Member Profile Modal -->
    <div id="member-profile-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Team Member Profile</h2>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="member-profile-content">
                    <!-- Dynamic content will be loaded here -->
                    <div class="profile-loading">Loading profile...</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary edit-member-btn" >Edit Profile</button>
                <button class="btn-secondary modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- Edit Member Modal -->
    <div id="edit-member-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Team Member</h2>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-member-form">
                    <input type="hidden" class="input" id="edit-member-id" name="member_id">
                    
                    <div class="form-group">
                        <label for="edit-first-name">First Name</label>
                        <input type="text" class="input" id="edit-first-name" name="first_name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-last-name">Last Name</label>
                        <input type="text" class="input" id="edit-last-name" name="last_name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" class="input" id="edit-email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-phone">Phone</label>
                        <input type="tel" class="input" id="edit-phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-specialization">Specialization</label>
                        <select id="edit-specialization" name="specialization" required>
                            <option value="housekeeping">Housekeeping</option>
                            <option value="lawn_care">Lawn Care</option>
                            <option value="pool_care">Pool Care</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-experience">Experience</label>
                        <input type="text" class="input" id="edit-experience" name="experience" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-status">Status</label>
                        <select id="edit-status" name="status" required>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On Leave</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary save-member-btn">Save Changes</button>
                <button type="button" class="btn-secondary modal-close">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Member Options Modal -->
    <div id="member-options-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Member Options</h2>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="options-grid">
                    <button class="option-btn view-schedule-btn">
                        <i class="fas fa-calendar-alt"></i>
                        <span>View Schedule</span>
                    </button>
                    <button class="option-btn assign-task-btn">
                        <i class="fas fa-tasks"></i>
                        <span>Assign Task</span>
                    </button>
                    <button class="option-btn performance-report-btn">
                        <i class="fas fa-chart-line"></i>
                        <span>Performance Report</span>
                    </button>
                    <button class="option-btn edit-schedule-btn">
                        <i class="fas fa-clock"></i>
                        <span>Edit Schedule</span>
                    </button>
                    <button class="option-btn manage-availability-btn">
                        <i class="fas fa-calendar-check"></i>
                        <span>Manage Availability</span>
                    </button>
                    <button class="option-btn suspend-account-btn">
                        <i class="fas fa-user-slash"></i>
                        <span>Suspend Account</span>
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- Assign Task Modal -->
    <div id="assign-task-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Assign Task</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="assign-task-form">
                    <input type="hidden" id="task-member-id" name="member_id">
                    
                    <div class="form-group">
                        <label for="task-template">Task Template</label>
                        <select id="task-template" name="template_id" required>
                            <option value="">Select a template</option>
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="task-due-date">Due Date</label>
                        <input type="datetime-local" id="task-due-date" name="due_date" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="task-priority">Priority</label>
                        <select id="task-priority" name="priority" required>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="task-notes">Additional Notes</label>
                        <textarea id="task-notes" name="notes" rows="3" placeholder="Add any special instructions or notes..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary save-task-btn">Assign Task</button>
                <button type="button" class="btn-secondary modal-close">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Ticking Detail -->
        <div id="ticket-details-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>View Ticket</h2>
                <button class="close">&times;</button>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary save-task-btn">Assign Task</button>
                <button type="button" class="btn-secondary modal-close">Cancel</button>
            </div>
        </div>
    </div>

</body>
</html>