    //onsole.log('ADMIN.JS SCRIPT EXECUTION STARTED - TOP OF FILE');
    let teamDataStore = {}; // Declare teamDataStore globally
    let crmDataStore = {}; // Declare crmDataStore globally

    // Filter Functions (defined before DOMContentLoaded to ensure availability)

    function filterTeamMembers(filterValue) {
        //onsole.log(`[filterTeamMembers] Called with filterValue: ${filterValue}`);
        const allMembers = teamDataStore.team_members || [];
        // //onsole.log("[filterTeamMembers] All members from teamDataStore:", JSON.parse(JSON.stringify(allMembers)));
        let filteredMembers = [];

        if (filterValue === 'all') {
            filteredMembers = allMembers;
        } else if (filterValue === 'manager') {
            filteredMembers = allMembers.filter(member => member.role && (member.role.toLowerCase().includes('manager')));
        } else { // Assuming filterValue like 'housekeeping', 'lawn_care', 'pool_care' are specializations
            filteredMembers = allMembers.filter(member => {
                if (!member.specialization) {
                    // //onsole.log(`[filterTeamMembers] Member ID ${member.id} has no specialization.`);
                    return false;
                }
                const memberSpec = member.specialization.toLowerCase().replace(/\s+/g, '_');
                const filterValLower = filterValue.toLowerCase();
                // //onsole.log(`[filterTeamMembers] Comparing Member ID ${member.id} Spec: '${memberSpec}' with Filter: '${filterValLower}'`);
                return memberSpec === filterValLower;
            });
        }
        // //onsole.log("[filterTeamMembers] Filtered members:", JSON.parse(JSON.stringify(filteredMembers)));
        updateTeamMembers(filteredMembers);
    }

    // Updated to handle two filters: role type and position/specialization
    function applyJobApplicationFiltersByPosition(roleTypeFilterValue, positionFilterValue) {
        //onsole.log(`[applyJobApplicationFiltersByPosition] Called with roleType: '${roleTypeFilterValue}', position: '${positionFilterValue}'`);
        const allApplications = teamDataStore.job_applications || [];
        // if (allApplications.length > 0) {
        //     // //onsole.log("[applyJobApplicationFiltersByPosition] First application object structure:", JSON.parse(JSON.stringify(allApplications[0])));
        // } else {
        //     // //onsole.log("[applyJobApplicationFiltersByPosition] No job applications in teamDataStore.");
        // }
        let filteredApplications = allApplications;

        const lcRoleTypeFilter = roleTypeFilterValue ? roleTypeFilterValue.toLowerCase() : 'all';
        const lcPositionFilterValue = positionFilterValue ? positionFilterValue.toLowerCase() : 'all';

        //onsole.log(`[Debug] lcRoleTypeFilter: ${lcRoleTypeFilter}, lcPositionFilterValue: ${lcPositionFilterValue}`);

        // Filter by Role Type (e.g., 'professional', 'manager')
        if (lcRoleTypeFilter !== 'all') {
            const originalApplicationsBeforeFilter = [...allApplications]; 
            filteredApplications = originalApplicationsBeforeFilter.filter(app => {
                let appValueToCompare = '';
                if (lcRoleTypeFilter === 'manager') {
                    // For "Manager Roles" filter, check against position_applied_for, which is expected to be 'Manager'
                    appValueToCompare = (app.position_applied_for || '').toLowerCase();
                } else {
                    // For other roles like "Professional", use role_type primarily, falling back to position_applied_for
                    appValueToCompare = (app.role_type || app.position_applied_for || '').toLowerCase();
                }
                const match = appValueToCompare === lcRoleTypeFilter;

                // Keep the detailed logging for manager to verify this change
                if (lcRoleTypeFilter === 'manager') {
                    //onsole.log(`[Manager Role Check V2] App ID: ${app.id}, app.role_type: '${app.role_type}', app.position_applied_for: '${app.position_applied_for}', using appValueToCompare: '${appValueToCompare}', expected role: '${lcRoleTypeFilter}', Match: ${match}`);
                }
                return match;
            });
            //onsole.log(`[applyJobApplicationFiltersByPosition] After roleType filter ('${lcRoleTypeFilter}'): IDs: ${filteredApplications.map(a => a.id).join(', ') || 'None'}. Count: ${filteredApplications.length}`);
        }

        // Filter by Specialization/Industry (positionFilterValue)
        if (lcPositionFilterValue !== 'all') {
            if (lcRoleTypeFilter === 'professional') {
                filteredApplications = filteredApplications.filter(app => {
                    const appSpecialization = (app.specialization || '').toLowerCase();
                    const match = appSpecialization === lcPositionFilterValue;
                    // //onsole.log(`[Debug Spec Filter] App ID: ${app.id}, App Spec: '${appSpecialization}', Filter Spec: '${lcPositionFilterValue}', Match: ${match}`);
                    return match;
                });
            } else if (lcRoleTypeFilter === 'manager') {
                filteredApplications = filteredApplications.filter(app => {
                    const appIndustry = (app.industry_sector || '').toLowerCase();
                    const match = appIndustry === lcPositionFilterValue;
                    // //onsole.log(`[Debug Industry Filter] App ID: ${app.id}, App Industry: '${appIndustry}', Filter Industry: '${lcPositionFilterValue}', Match: ${match}`);
                    return match;
                });
            }
            //onsole.log(`[applyJobApplicationFiltersByPosition] After specialization/industry filter ('${lcPositionFilterValue}'):`, filteredApplications.map(a => a.id));
        }
        
        if (filteredApplications.length === 0 && (lcRoleTypeFilter !== 'all' || lcPositionFilterValue !== 'all')) {
            const container = document.querySelector('#team-section .applications-list');
            if (container) {
                container.innerHTML = '<div class="no-data">No applications match your current filter criteria.</div>';
            }
            updateJobApplications([]); // Call with empty array to ensure consistency if other parts rely on it
        } else {
            updateJobApplications(filteredApplications);
        }
    }

    // Updated to handle two filters: date and manager type for team_schedule
    function applyTeamScheduleFilters(dateFilterValue, managerTypeFilterValue) {
        //console.log(`[applyTeamScheduleFilters] CALLED. Date Filter: '${dateFilterValue}', Manager Type Filter: '${managerTypeFilterValue}'`);
        const allScheduleItems = teamDataStore.team_schedule || [];
        if (allScheduleItems.length === 0) {
            //onsole.log("[applyTeamScheduleFilters] No schedule items in teamDataStore to filter.");
            renderTeamSchedule([]); // Render empty if no data from store
            return;
        }
        // //onsole.log("[applyTeamScheduleFilters] All schedule items from teamDataStore:", JSON.parse(JSON.stringify(allScheduleItems)));
        let filteredSchedule = [...allScheduleItems]; // Start with a copy

        // 1. Filter by Manager Type
        if (managerTypeFilterValue && managerTypeFilterValue !== 'all') {
            const lcManagerTypeFilter = managerTypeFilterValue.toLowerCase();
            //onsole.log(`[applyTeamScheduleFilters] Applying Manager Type Filter: '${lcManagerTypeFilter}'`);
            filteredSchedule = filteredSchedule.filter(item => {
                const itemUserRole = item.user_role ? item.user_role.toLowerCase() : 'undefined_role';
                const match = itemUserRole === lcManagerTypeFilter;
                //onsole.log(`[ManagerTypeFilter DEBUG] Item ID: ${item.id}, Item User Role: '${itemUserRole}', Filter: '${lcManagerTypeFilter}', Match: ${match}`);
                return match;
            });
            //onsole.log(`[applyTeamScheduleFilters] Count after Manager Type Filter: ${filteredSchedule.length}`);
        } else {
            //onsole.log("[applyTeamScheduleFilters] Manager Type Filter is 'all' or undefined, skipping.");
        }

        // 2. Filter by Date (Today, This Week, This Month)
        if (dateFilterValue && dateFilterValue !== 'all') { // Added 'all' check for date too, if you ever add it
            //onsole.log(`[applyTeamScheduleFilters] Applying Date Filter: '${dateFilterValue}'`);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today

            filteredSchedule = filteredSchedule.filter(item => {
                const itemDateStr = item.schedule_date || (item.start_time ? item.start_time.split('T')[0] : null);
                if (!itemDateStr) {
                    console.warn(`[DateFilter DEBUG] Item ID: ${item.id} has no valid date property (schedule_date or start_time).`);
                    return false;
                }
                
                let itemDate;
                try {
                    const itemDateParts = itemDateStr.split('-');
                    itemDate = new Date(parseInt(itemDateParts[0]), parseInt(itemDateParts[1]) - 1, parseInt(itemDateParts[2]));
                    itemDate.setHours(0,0,0,0); // Normalize to start of day

                    let match = false;
                    if (dateFilterValue === 'today') {
                        match = itemDate.getTime() === today.getTime();
                    } else if (dateFilterValue === 'week') {
                        const startOfWeek = new Date(today);
                        // Adjust to Monday of the current week. getDay() is 0 for Sun, 1 for Mon, ..., 6 for Sat.
                        // If today is Sunday (0), go back 6 days to Monday. Otherwise, go back (today.getDay() - 1) days.
                        startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
                        startOfWeek.setHours(0,0,0,0);
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
                        endOfWeek.setHours(23,59,59,999);
                        match = itemDate >= startOfWeek && itemDate <= endOfWeek;
                         //onsole.log(`[DateFilter DEBUG Week] Item ID: ${item.id}, Item Date: ${itemDate.toDateString()}, StartOfWeek: ${startOfWeek.toDateString()}, EndOfWeek: ${endOfWeek.toDateString()}, Match: ${match}`);
                    } else if (dateFilterValue === 'month') {
                        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
                        endOfMonth.setHours(23,59,59,999);
                        match = itemDate >= startOfMonth && itemDate <= endOfMonth;
                        // //onsole.log(`[DateFilter DEBUG Month] Item ID: ${item.id}, Item Date: ${itemDate.toDateString()}, StartOfMonth: ${startOfMonth.toDateString()}, EndOfMonth: ${endOfMonth.toDateString()}, Match: ${match}`);
                    }
                    // //onsole.log(`[DateFilter DEBUG] Item ID: ${item.id}, Item Date: ${itemDate.toDateString()}, Filter: '${dateFilterValue}', Match: ${match}`);
                    return match;
                } catch (e) {
                    console.error(`[DateFilter DEBUG] Error parsing date for item ID: ${item.id}, DateStr: '${itemDateStr}'. Error:`, e);
                    return false;
                }
            });
            //onsole.log(`[applyTeamScheduleFilters] Count after Date Filter: ${filteredSchedule.length}`);
        } else {
            //onsole.log("[applyTeamScheduleFilters] Date Filter is 'all' or undefined, skipping.");
        }
        renderTeamSchedule(filteredSchedule);
    }

    //tab shwiting in SEO and 
    document.querySelectorAll('.reputation-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove 'active' from all tabs
            document.querySelectorAll('.reputation-tab').forEach(t => t.classList.remove('active'));

            // Hide all content
            document.querySelectorAll('.reputation-content').forEach(content => content.style.display = 'none');

            // Add 'active' to clicked tab
            this.classList.add('active');

            // Show related content
            const tabId = this.getAttribute('data-tab');
            const contentId = tabId + '-content';
            const target = document.getElementById(contentId);
            if (target) {
                target.style.display = 'block';
            }
        });
    });
    // Admin Dashboard Functionality
    document.addEventListener('DOMContentLoaded', function() {
        // //onsole.log('DOMCONTENTLOADED EVENT FIRED');
        //onsole.log('Document ready - Initializing admin dashboard...');
        initializeModals();
        initCalendar();
        
        loadDashboardData();
        loadAppointments();
        loadCRMData();
        loadMarketingData();
        loadTeamSection(); 
        
        initTeamPerformanceCharts();

        // Initialize filter buttons for TEAM MEMBERS list (.team-filters)
        document.querySelectorAll('#team-section .team-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#team-section .team-filters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterTeamMembers(btn.dataset.filter); // Filters #team-members-list
            });
        });

        // Initialize filter for JOB APPLICATIONS list (#position-filter select)
        // This was previously calling applyJobApplicationFiltersByPosition with only one argument.
        // It's now handled by the consolidated triggerJobApplicationFilter below.
        // const positionFilterSelect = document.getElementById('position-filter');
        // if (positionFilterSelect) {
        //     positionFilterSelect.addEventListener('change', function() {
        //         // applyJobApplicationFiltersByPosition(this.value); // Incorrect call
        //         triggerJobApplicationFilter(); // Correct: call the central trigger
        //     });
        // }
        
        // Initialize filters for TEAM SCHEDULE list (.schedule-filters - time select and role buttons)
        // const scheduleTimeFilterSelect = document.querySelector('#team-section .schedule-filters .schedule-select'); // OLD - REMOVE
        // const scheduleRoleFilterButtons = document.querySelectorAll('#team-section .schedule-filters .filter-buttons .filter-btn'); // OLD - REMOVE

        // if (scheduleTimeFilterSelect) { // OLD - REMOVE
        //     scheduleTimeFilterSelect.addEventListener('change', applyTeamScheduleFilters); 
        // } // OLD - REMOVE
        // scheduleRoleFilterButtons.forEach(btn => { // OLD - REMOVE
        //     btn.addEventListener('click', () => {
        //         scheduleRoleFilterButtons.forEach(b => b.classList.remove('active'));
        //         btn.classList.add('active');
        //         applyTeamScheduleFilters(); 
        //     });
        // }); // OLD - REMOVE

        loadTodayServices();
        
        // Refresh services every 5 minutes
        setInterval(loadTodayServices, 300000);
        
        // Set up team filters
        document.getElementById('team-role-filter')?.addEventListener('change', function() {
            const membersDataset = document.querySelector('#team-members-list')?.dataset.members;
            if (membersDataset) {
                try {
                    const members = JSON.parse(membersDataset);
                    updateTeamMembers(members);
                } catch (e) {
                    console.error('Error parsing team members data from dataset:', e);
                }
            }
        });
        
        // REMOVED Redundant event listener for 'position-filter'
        // document.getElementById('position-filter')?.addEventListener('change', function() {
        //     const applicationsDataset = document.querySelector('#job-applications-list')?.dataset.applications;
        //     if (applicationsDataset) {
        //         try {
        //             const applications = JSON.parse(applicationsDataset);
        //             updateJobApplications(applications);
        //         } catch (e) {
        //             console.error('Error parsing job applications data from dataset:', e);
        //         }
        //     }
        // });

        // Centralized event listeners for Job Application filters
        const roleTypeFilterElement = document.getElementById('role-type-filter'); // Renamed to avoid conflict
        const positionFilterElement = document.getElementById('position-filter'); // Renamed to avoid conflict

        function triggerJobApplicationFilter() {
            const selectedRoleType = roleTypeFilterElement ? roleTypeFilterElement.value : 'all';
            
            // Update position filter options whenever the role type changes
            updatePositionFilterOptions(selectedRoleType);
            
            const selectedPosition = positionFilterElement ? positionFilterElement.value : 'all';

            //onsole.log(`[triggerJobApplicationFilter] RoleType: ${selectedRoleType}, Position: ${selectedPosition}`);
            applyJobApplicationFiltersByPosition(selectedRoleType, selectedPosition);
        }

        if (roleTypeFilterElement) {
            roleTypeFilterElement.addEventListener('change', triggerJobApplicationFilter);
            // Initialize position filter options based on the initial role type value
            updatePositionFilterOptions(roleTypeFilterElement.value);
        } else {
            console.warn("Role type filter element (#role-type-filter) not found.");
            // Still initialize position filter with default if role type filter is missing for some reason
            updatePositionFilterOptions('all'); 
        }

        if (positionFilterElement) {
            positionFilterElement.addEventListener('change', triggerJobApplicationFilter);
        } else {
            console.warn("Position filter element (#position-filter) not found.");
        }

        // Event listeners for Team Schedule filters
        const teamScheduleDateFilter = document.getElementById('team-schedule-date-filter');
        const teamScheduleManagerTypeButtonContainer = document.getElementById('team-schedule-manager-type-filter');

        function triggerTeamScheduleFilter() {
            const selectedDate = teamScheduleDateFilter ? teamScheduleDateFilter.value : 'today';
            const activeButton = teamScheduleManagerTypeButtonContainer ? teamScheduleManagerTypeButtonContainer.querySelector('.filter-btn.active') : null;
            const selectedManagerType = activeButton ? activeButton.dataset.filter : 'all';
            applyTeamScheduleFilters(selectedDate, selectedManagerType);
        }

        if (teamScheduleDateFilter) {
            teamScheduleDateFilter.addEventListener('change', triggerTeamScheduleFilter);
        }

        if (teamScheduleManagerTypeButtonContainer) {
            const managerTypeButtons = teamScheduleManagerTypeButtonContainer.querySelectorAll('.filter-btn');
            managerTypeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    managerTypeButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    triggerTeamScheduleFilter();
                });
            });
        }
    });

    // Modal Initialization and Handlers (Using Event Delegation)
    function initializeModals() {
        //onsole.log('initializeModals function called');
        //onsole.log('Initializing modal event delegation...');
        const mainContent = document.querySelector('main.main-content');

        if (!mainContent) {
            console.error('Main content area not found for modal delegation.');
            return;
        }

        // Initialize all modals first
        document.querySelectorAll('.modal').forEach(modal => {
            // Add close button event listeners
            modal.querySelectorAll('.close, .close-btn, .btn-secondary, .modal-close').forEach(btn => {
                if (!btn.dataset.listenerAttached) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        hideModal(modal.id);
                    });
                    btn.dataset.listenerAttached = 'true';
                }
            });
            
            // Add click outside to close
            if (!modal.dataset.outsideClickAttached) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        hideModal(modal.id);
                    }
                });
                modal.dataset.outsideClickAttached = 'true';
            }
        });

        // Single listener for all modal triggers within main content
        mainContent.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal]'); // Find trigger or ancestor

            if (trigger) {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                //onsole.log(`Modal trigger clicked for: ${modalId}`);

                // Get any additional data attributes from the trigger
                const campaignId = trigger.getAttribute('data-campaign-id');
                const customerId = trigger.getAttribute('data-customer-id');
                const promoId = trigger.getAttribute('data-promo-id');
                const memberId = trigger.getAttribute('data-member-id');
                const applicationId = trigger.getAttribute('data-application-id');
                const serviceId = trigger.getAttribute('data-service-id');
                const templateId = trigger.getAttribute('data-template-id');
                const ticketId = trigger.getAttribute('data-ticket-id');

                const targetModalId = `${modalId}-modal`;
                const modalElement = document.getElementById(targetModalId);

                if (!modalElement) {
                    console.warn(`Modal element with ID ${targetModalId} not found.`);
                    showNotification('Error: Modal not found', 'error');
                    return;
                }

                // Store relevant IDs in the modal element itself for later retrieval
                if (campaignId) modalElement.dataset.campaignId = campaignId;
                if (customerId) modalElement.dataset.customerId = customerId;
                if (promoId) modalElement.dataset.promoId = promoId;
                if (memberId) modalElement.dataset.memberId = memberId;
                if (applicationId) modalElement.dataset.applicationId = applicationId;
                if (serviceId) modalElement.dataset.serviceId = serviceId;
                if (templateId) modalElement.dataset.templateId = templateId;
                if (ticketId) modalElement.dataset.ticketId = ticketId;

                // Clear any previous content in loading-dependent areas
                const detailsContainer = modalElement.querySelector('.modal-body, .details-container');
                if (detailsContainer) {
                    detailsContainer.innerHTML = '<div class="loading-state">Loading...</div>';
                }

                // Show modal first for better UX
                showModal(targetModalId);

                // Then load the content
                try {
                switch (modalId) {
                    case 'member-actions':
                        viewMemberDetails(memberId);
                        break;
                    case 'application-actions':
                        viewApplicationDetails(applicationId);
                        break;
                    case 'assign-task':
                            showAssignTaskForm(memberId);
                        break;
                    case 'service-actions':
                        viewServiceDetails(serviceId);
                        break;
                     case 'template-actions':
                        viewTemplateDetails(templateId);
                        break;
                        case 'ticket-actions':
                            viewTicketDetails(ticketId);
                        break;
                    case 'edit-campaign':
                        editCampaign(campaignId);
                        break;
                    case 'pause-campaign':
                        toggleCampaignStatus(campaignId);
                        break;
                    case 'campaign-stats':
                        viewCampaignStats(campaignId);
                        break;
                    case 'customer-details':
                        viewCustomerDetails(customerId);
                        break;
                    case 'edit-customer':
                        editCustomer(customerId);
                        break;
                     case 'edit-promo':
                        editPromoCode(promoId);
                        break;
                    case 'toggle-promo':
                        togglePromoStatus(promoId);
                        break;
                    case 'appointment-details':
                        const appointmentId = trigger.getAttribute('data-appointment-id');
                        if (appointmentId) {
                            const isAssignMode = trigger.classList.contains('btn-primary');
                            openAppointmentDetailsModal(appointmentId, isAssignMode);
                        } else {
                            console.warn('Appointment ID missing for appointment-details modal trigger');
                             showNotification('Error: Appointment ID is missing.', 'error');
                        }
                        break;
                    default:
                        // For simple modals like 'add-member', 'new-campaign', etc.
                            const loadingState = modalElement.querySelector('.loading-state');
                            if (loadingState) {
                                loadingState.remove();
                            }
                        break;
                }
                } catch (error) {
                    console.error('Error handling modal action:', error);
                    showNotification('Error loading modal content', 'error');
                    hideModal(targetModalId);
                    }
            }
        });

        // Global ESC key handler
        if (!document.body.dataset.escKeyHandlerAttached) {
            document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    //onsole.log(`Closing modal from Escape key: ${openModal.id}`);
                    hideModal(openModal.id);
                }
            }
        });
            document.body.dataset.escKeyHandlerAttached = 'true';
        }

        //onsole.log('Modal event delegation initialized.');
    }

    // Show Modal Function
    function showModal(modalId) {
        //onsole.log(`showModal: Attempting to show modal with ID: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            //onsole.log(`showModal: Found modal element for ${modalId}:`, modal);
            
            // Hide any other open modals first
            document.querySelectorAll('.modal.show').forEach(openModal => {
                if (openModal.id !== modalId) {
                    hideModal(openModal.id);
                }
            });
            
            // Reset modal content if needed
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
            
            // Show the modal
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
            
            // Use requestAnimationFrame for smooth animation
            requestAnimationFrame(() => {
                modal.classList.add('show');
                //onsole.log(`showModal: Added .show class to ${modalId}`);
                
                // Focus first input or button
                const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button:not(.close):not(.modal-close)');
                if (firstInput) {
                    firstInput.focus();
                }
            });
        } else {
            console.warn(`Modal with id ${modalId} not found`);
            showNotification('Error: Modal not found', 'error');
        }
    }

    // Hide Modal Function
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            // Wait for the transition to complete before hiding
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }, 300); // Match this with your CSS transition duration
        }
    }

    // Section Navigation
    function showSection(sectionId) {
        //onsole.log(`Showing section: ${sectionId}`);
        
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const selectedSection = document.getElementById(`${sectionId}-section`);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }
        
        // Update active link in sidebar
        document.querySelectorAll('.sidebar-links a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar-links a[onclick*="showSection('${sectionId}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load/Initialize section-specific functionality
        switch (sectionId) {
            case 'dashboard':
            loadDashboardData();
                break;
            case 'appointments':
                //onsole.log('showSection: Appointments selected. Initializing calendar structure.');
                initCalendar();
                loadAppointments();
                break;
            case 'crm':
                //onsole.log('showSection: CRM selected. Loading CRM data...');
                loadCRMData().then(() => {
                    // Wait for next frame to ensure DOM is ready
                    requestAnimationFrame(() => {
                        if (crmDataStore.insights) {
                            //onsole.log('Initializing CRM charts with insights data');
                            initCustomerInsightsCharts(crmDataStore.insights);
                        }
                    });
                }).catch(error => {
                    console.error('Error loading CRM data:', error);
                });
                break;
            case 'marketing':
                loadMarketingData().then(() => {
                    requestAnimationFrame(() => {
                        initMarketingCharts(); // Initialize charts after marketing data is loaded and DOM is ready
                    });
                }).catch(error => {
                     console.error('Error loading marketing data for chart initialization:', error);
                });
                break;
            case 'team':
                loadTeamSection();
                break;
            case 'support':
            loadSupportSection();
                break;
            case 'settings': // Added case for settings
                loadServicesList();
                loadTaskTemplatesList();
                break;
        }
    }

    // Calendar Initialization
    function initCalendar() {
        //onsole.log('initCalendar: Function called.');
        const calendarEl = document.getElementById('appointments-calendar'); // Corrected ID
        if (!calendarEl) {
            console.error('initCalendar: #appointments-calendar element NOT FOUND.');
            return;
        }
        //onsole.log('initCalendar: #appointments-calendar element FOUND.', calendarEl);

        // Set initial height
        // calendarEl.style.height = '650px'; // Style from CSS if possible
        // calendarEl.style.width = '100%';

        if (calendarEl._fullCalendar) {
            //onsole.log('initCalendar: Destroying existing FullCalendar instance on #appointments-calendar.');
            calendarEl._fullCalendar.destroy();
            delete calendarEl._fullCalendar; // Clean up reference
        }

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 'auto', // Adjust as needed, or use CSS
            expandRows: true,
            eventDisplay: 'block', // Force events to display as blocks
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [], 
            eventClick: function(info) {
                //onsole.log('Calendar eventClick fired on #appointments-calendar. Event object:', info.event);
                const eventId = info.event.id; // Get ID directly from the event object
                if (eventId) {
                    //onsole.log(`Calendar eventClick: Extracted event ID: ${eventId}. Calling openAppointmentDetailsModal.`);
                    openAppointmentDetailsModal(eventId, false); // Passing false for isAssignMode
                } else {
                    console.error('Calendar eventClick: Could not find an ID on the clicked event.', info.event);
                    showNotification('Could not load details: Event ID missing.', 'error');
                }
            },
            eventDidMount: function(info) {
                //onsole.log('FullCalendar eventDidMount: Event rendered to DOM. Event ID:', info.event.id, 'Title:', info.event.title, 'Element:', info.el);
                const status = info.event.extendedProps.status;
                if (status === 'booked') info.el.style.backgroundColor = '#1976d2';
                else if (status === 'completed') info.el.style.backgroundColor = '#2e7d32';
                else if (status === 'pending') info.el.style.backgroundColor = '#f57c00';
            },
            dayMaxEvents: true,
            handleWindowResize: true,
            windowResizeDelay: 200,
            contentHeight: 'auto',
            aspectRatio: 1.8, 
            slotMinTime: '07:00:00',
            slotMaxTime: '20:00:00',
            slotDuration: '00:30:00',
            eventTimeFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
            datesSet: function(dateInfo) { // New Callback
                //onsole.log('FullCalendar datesSet: View type:', dateInfo.view.type);
                //onsole.log('FullCalendar datesSet: Displayed start:', dateInfo.startStr);
                //onsole.log('FullCalendar datesSet: Displayed end:', dateInfo.endStr);
                const currentEvents = this.getEvents(); // 'this' is the calendar instance
                if (currentEvents.length > 0) {
                    //console.log('FullCalendar datesSet: Events in calendar data store (count: ' + currentEvents.length + '):', 
                    //     currentEvents.map(e => ({ id: e.id, title: e.title, start: e.startStr, end: e.endStr, allDay: e.allDay }))
                    // );
                } else {
                    //onsole.log('FullCalendar datesSet: NO events found in calendar data store after datesSet.');
                }
            },
        });
        
        calendarEl._fullCalendar = calendar; // Store the instance SYNCHRONOUSLY
        //onsole.log('initCalendar: FullCalendar object created and instance assigned to #appointments-calendar. Scheduling render...');

        setTimeout(() => {
            // Ensure the instance still exists and matches before rendering (paranoid check)
            if (calendarEl._fullCalendar === calendar) {
                calendar.render();
                //onsole.log('initCalendar: #appointments-calendar rendered.');
                window.dispatchEvent(new Event('resize')); // Helps with layout adjustments
            } else {
                console.warn('initCalendar: Calendar instance changed or was destroyed before scheduled render.');
            }
        }, 50); // Slightly increased delay just in case
    }

    // New consolidated function to update dashboard summary statistics
    function updateDashboardSummaryStats(summaryData) {
        // Update .stats-grid (formerly from updateProfitsOverview)
        const appointmentsElement = document.querySelector('.stats-grid .stat-item:nth-child(1) .stat-number');
        if (appointmentsElement && summaryData.todays_appointments !== undefined) {
            appointmentsElement.textContent = summaryData.todays_appointments;
        }

        const todayRevenueElement = document.querySelector('.stats-grid .stat-item:nth-child(2) .stat-number');
        if (todayRevenueElement && summaryData.todays_revenue !== undefined) {
            todayRevenueElement.textContent = `$${parseFloat(summaryData.todays_revenue).toFixed(2)}`;
        }

        const newCustomersStatsGridElement = document.querySelector('.stats-grid .stat-item:nth-child(3) .stat-number');
        if (newCustomersStatsGridElement && summaryData.new_customers !== undefined) {
            newCustomersStatsGridElement.textContent = summaryData.new_customers;
        }

        const monthlyRatingElement = document.querySelector('.stats-grid .stat-item:nth-child(4) .stat-number');
        if (monthlyRatingElement && summaryData.monthly_rating !== undefined) {
            monthlyRatingElement.textContent = summaryData.monthly_rating || 'N/A';
        }

        const monthlyRevenueElement = document.querySelector('.stats-grid .stat-item:nth-child(5) .stat-number');
        if (monthlyRevenueElement && summaryData.monthly_revenue !== undefined) {
            monthlyRevenueElement.textContent = `$${parseFloat(summaryData.monthly_revenue).toFixed(2)}`;
        }

        // Update .quick-stats (formerly from old updateQuickStats)
        const quickAppointmentsElement = document.querySelector('.quick-stats .stat-item:nth-child(1) .stat-number');
        // Assuming PHP provides 'appointments_today_qs' for this section
        if (quickAppointmentsElement && summaryData.appointments_today_qs !== undefined) {
            quickAppointmentsElement.textContent = summaryData.appointments_today_qs;
        }
        
        const quickCustomersElement = document.querySelector('.quick-stats .stat-item:nth-child(2) .stat-number');
        // Assuming PHP provides 'new_customers_today_qs'
        if (quickCustomersElement && summaryData.new_customers_today_qs !== undefined) {
            quickCustomersElement.textContent = summaryData.new_customers_today_qs;
        }
        
        const quickRatingElement = document.querySelector('.quick-stats .stat-item:nth-child(3) .stat-number');
        // Assuming PHP provides 'average_rating_qs'
        if (quickRatingElement && summaryData.average_rating_qs !== undefined) {
            quickRatingElement.textContent = summaryData.average_rating_qs;
        }

        // Call renderProfitChart (formerly from loadProfitsOverview)
        if (summaryData.trend && Array.isArray(summaryData.trend)) {
            renderProfitChart(summaryData.trend);
        } else {
            console.warn('updateDashboardSummaryStats: trend data for profit chart is missing or not an array.');
            renderProfitChart([]); // Render with empty data to show 'no data' message or handle gracefully
        }
    }

    // Dashboard Data Loading - Modified to use consolidated endpoint
    function loadDashboardData() {
        //onsole.log('Loading consolidated dashboard data...');
        
        // Fetch consolidated summary stats (profits overview, quick stats, trend for chart)
        fetch('assets/php/admin_dashboard.php?action=get_dashboard_summary&t=' + new Date().getTime())
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(summaryResponse => {
                if (summaryResponse && summaryResponse.success && summaryResponse.data) {
                    updateDashboardSummaryStats(summaryResponse.data);
                } else {
                    console.error('Error or invalid data structure from dashboard summary API:', summaryResponse);
                    updateDashboardSummaryStats({}); // Pass empty object to handle gracefully
                }
            })
            .catch(error => {
                console.error('Error loading dashboard summary data:', error);
                updateDashboardSummaryStats({}); // Pass empty object to handle gracefully
            });

        // Load today's services (this part remains separate as it's about a list, not stats)
        fetch('assets/php/admin_dashboard.php?type=services&t=' + new Date().getTime())
            .then(response => response.json())
            .then(data => {
                if (data && data.success && data.data) {
                    renderTodayServices(data.data);
            } else {
                    console.error('Error or invalid data structure from services API:', data);
                    renderTodayServices([]); // Show empty state on error or malformed data
                }
            })
            .catch(error => {
                console.error('Error loading service data:', error);
                renderTodayServices([]); // Show empty state on fetch error
            });
    }

    // CRM Management
    function loadCRMData() {
        //onsole.log('Loading CRM data...');
        return fetch('assets/php/get_crm_data.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                //onsole.log('CRM data received:', data);
                
                if (data.success) {
                    // Store the fetched data
                    crmDataStore = data;
                    
                    // Update overview section
                    updateCrmOverview(data.overview); // Corrected function name
                    
                    // Update customer table
                    updateCustomerTable(data.customers);
                    
                    // Update insights section
                    if (data.insights) {
                        //onsole.log('Updating insights with data:', data.insights);
                    updateCustomerInsights(data.insights);
                        
                        // Wait for next frame to ensure DOM is ready
                        requestAnimationFrame(() => {
                            initCustomerInsightsCharts(data.insights);
                        });
                } else {
                    console.warn('CRM data does not contain insights.');
                        updateCustomerInsights(null);
                    }
                } else {
                    throw new Error(data.error || 'Failed to load CRM data');
                }
            })
            .catch(error => {
                console.error('Error loading CRM data:', error);
                crmDataStore = {};
                updateCrmOverview({});
                updateCustomerTable([]);
                updateCustomerInsights(null);
            });
    }

    function updateCrmOverview(data) {
        if (!data) {
            console.warn('No CRM data provided');
            return;
        }

        try {
            // Update overview cards
            const elements = {
                totalCustomers: document.querySelector('#customers-chart')?.parentElement?.previousElementSibling?.querySelector('h3'),
                newCustomers: document.querySelector('#new-customers-chart')?.parentElement?.previousElementSibling?.querySelector('h3'),
                retention: document.querySelector('#retention-chart')?.parentElement?.previousElementSibling?.querySelector('h3'),
                customerValue: document.querySelector('#customer-value-chart')?.parentElement?.previousElementSibling?.querySelector('h3')
            };

            if (elements.totalCustomers) elements.totalCustomers.textContent = data.total_customers || '0';
            if (elements.newCustomers) elements.newCustomers.textContent = data.new_customers || '0';
            if (elements.retention) elements.retention.textContent = (data.retention_rate || '0') + '%';
            if (elements.customerValue) elements.customerValue.textContent = '$' + (data.avg_customer_value || '0');

            // Update charts if data is available
            if (data.trends) {
                updateCrmCharts(data.trends);
            }
        } catch (error) {
            console.error('Error updating CRM overview:', error);
        }
    }

    function updateMarketingOverviewCharts(data) {
        // Budget chart
        updateMiniChart('#marketing-budget-chart', 
            data?.budget?.trend?.map(item => item.month) || [], 
            data?.budget?.trend?.map(item => item.value) || []
        );
        
        // Conversion rate chart
        updateMiniChart('#conversion-rate-chart', 
            data?.conversion_rate?.trend?.map(item => item.month) || [], 
            data?.conversion_rate?.trend?.map(item => item.value) || []
        );
        
        // Active promos chart
        updateMiniChart('#active-promos-chart', 
            data?.active_promos?.trend?.map(item => item.month) || [], 
            data?.active_promos?.trend?.map(item => item.value) || []
        );
        
        // Customer acquisition chart
        updateMiniChart('#customer-acquisition-chart', 
            data?.customer_acquisition?.trend?.map(item => item.month) || [], 
            data?.customer_acquisition?.trend?.map(item => item.value) || []
        );
    }

    function updateMiniChart(selector, labels, data) {
        const canvasElement = document.querySelector(selector);
        if (!canvasElement) {
            console.error(`updateMiniChart: Canvas element with selector '${selector}' not found.`);
            return;
        }
        
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
            console.error(`updateMiniChart: Failed to get 2D context for selector '${selector}'.`);
            return;
        }
        
        // Check if chart already exists
        if (ctx._chart) {
            // Update existing chart
            ctx._chart.data.labels = labels;
            ctx._chart.data.datasets[0].data = data;
            ctx._chart.update();
        } else {
            // Create new chart
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Trend',
                        data: data,
                        borderColor: '#4F8E35',
                        backgroundColor: 'rgba(79, 142, 53, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    },
                    elements: {
                        line: { borderWidth: 1.5 }
                    }
                }
            });
            
            // Store reference to chart
            ctx._chart = chart;
        }
    }

    function renderCampaigns(campaigns) {
        const campaignList = document.querySelector('.campaign-list');
        if (!campaignList) return;
        
        // Clear existing campaigns
        campaignList.innerHTML = '';
        
        if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
            campaignList.innerHTML = '<div class="empty-state">No campaigns found.</div>';
            return;
        }
        
        // Add campaigns
        campaigns.forEach(campaign => {
            const html = `
                <div class="campaign-item">
                    <div class="campaign-status ${campaign.status}"></div>
                    <div class="campaign-details">
                        <h4>${campaign.name}</h4>
                        <div class="campaign-meta">
                            <span><i class="far fa-calendar-alt"></i> ${campaign.start_date}${campaign.end_date ? ' - ' + campaign.end_date : ''}</span>
                            <span><i class="fas fa-tag"></i> ${campaign.offer}</span>
                        </div>
                    </div>
                    ${campaign.status === 'active' ? `
                    <div class="campaign-progress">
                        <div class="progress-stat">
                            <div class="stat-label">Budget Used</div>
                            <div class="stat-value">$${campaign.budget.used} / $${campaign.budget.total}</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${campaign.budget.percent}%"></div>
                            </div>
                        </div>
                        <div class="progress-stat">
                            <div class="stat-label">Conversions</div>
                            <div class="stat-value">${campaign.conversions.count} / ${campaign.conversions.goal} Goal</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${campaign.conversions.percent}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="campaign-actions">
                        <button class="btn-icon" title="Edit Campaign" data-modal="edit-campaign" data-campaign-id="${campaign.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon" title="Pause Campaign" data-modal="pause-campaign" data-campaign-id="${campaign.id}"><i class="fas fa-pause"></i></button>
                        <button class="btn-icon" title="View Stats" data-modal="campaign-stats" data-campaign-id="${campaign.id}"><i class="fas fa-chart-bar"></i></button>
                    </div>
                    ` : `
                    <div class="campaign-status-badge">${campaign.status === 'planned' ? 'Scheduled' : 'Completed'}</div>
                    <div class="campaign-actions">
                        <button class="btn-icon" title="Edit Campaign" data-modal="edit-campaign" data-campaign-id="${campaign.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon" title="${campaign.status === 'planned' ? 'Cancel Campaign' : 'Archive'}" data-modal="cancel-campaign" data-campaign-id="${campaign.id}">
                            <i class="fas fa-${campaign.status === 'planned' ? 'times' : 'archive'}"></i>
                        </button>
                    </div>
                    `}
                </div>
            `;
            
            campaignList.insertAdjacentHTML('beforeend', html);
        });
    }

    function renderPromoCodes(promoCodes) {
        const promoTable = document.querySelector('.promo-code-table table tbody');
        if (!promoTable) {
            console.error('Promo code table body not found');
            return;
        }
        
        promoTable.innerHTML = ''; // Clear existing promo codes
        
        if (!promoCodes || !Array.isArray(promoCodes) || promoCodes.length === 0) {
            promoTable.innerHTML = '<tr><td colspan="6" class="empty-state">No promo codes found.</td></tr>';
            return;
        }
        
        // Add promo codes
        promoCodes.forEach(promo => {
            const html = `
                <tr>
                    <td><strong>${promo.code}</strong></td>
                    <td>${promo.discount_type === 'percentage' ? promo.discount_value + '%' : '$' + promo.discount_value}</td>
                    <td>${promo.uses}/${promo.max_uses}</td>
                    <td>${promo.expiry}</td>
                    <td><span class="status-badge status-${promo.status}">${promo.status === 'active' ? 'Active' : 'Expired'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" title="Edit" data-modal="#edit-promo" data-promo-id="${promo.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" title="${promo.status === 'active' ? 'Disable' : 'Renew'}" data-modal="toggle-promo" data-promo-id="${promo.id}">
                                <i class="fas fa-${promo.status === 'active' ? 'toggle-on' : 'redo'}"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            promoTable.insertAdjacentHTML('beforeend', html);
        });
    }

    function loadAcquisitionChart() {
        fetch('assets/php/admin_marketing.php?action=acquisition-data')
            .then(response => response.json())
            .then(data => {
                renderAcquisitionData(data);
            })
            .catch(error => {
                console.error('Error loading acquisition data:', error);
            });
    }

    // Update team members display
    function updateTeamMembers(teamMembers) {
        const membersList = document.getElementById('team-members-list');
        if (!membersList) return;

        membersList.innerHTML = teamMembers.map(member => {
            // Log the member object and specifically member.onTimeRate
            //onsole.log('Processing member:', member);
            //onsole.log(`Member ID: ${member.id}, Raw on_time_rate from PHP:`, member.on_time_rate);

            const ratingVal = parseFloat(member.rating);
            const displayRating = !isNaN(ratingVal) ? ratingVal.toFixed(1) : '0.0';

            const onTimeRateVal = parseFloat(member.on_time_rate);
            const displayOnTimeRate = !isNaN(onTimeRateVal) ? onTimeRateVal.toFixed(0) : '0';

            return `
            <div class="team-member-card">
                <div class="member-info">
                    <div class="member-avatar">${getInitials(member.name)}</div>
                    <div class="member-details">
                        <h3>${member.name}</h3>
                        <p>${member.role}</p>
                        <div class="member-rating">
                            <i class="fas fa-star"></i>
                            <span>${displayRating} (${member.reviewCount || 0} reviews)</span>
                        </div>
                    </div>
                </div>
                <div class="member-stats">
                    <div class="stat">
                        <span class="stat-value">${member.completed_jobs || 0}</span>
                        <span class="stat-label">Services</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${displayOnTimeRate}%</span>
                        <span class="stat-label">On Time</span>
                    </div>
                </div>
                <div class="member-actions">
                    <button class="btn-icon" title="View Profile" onclick="viewTeamMember(${member.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit Member" onclick="editTeamMember(${member.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="More Options" onclick="showMemberOptions(${member.id})">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');

        // Initialize tooltips if using a tooltip library
        initializeTooltips();
    }

    function initTeamPerformanceCharts() {
        const ctx1 = document.getElementById('serviceCompletionChart');
        if (ctx1) {
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Service Completion Rate',
                        data: [88, 90, 92, 91, 93, 92],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        const ctx2 = document.getElementById('customerSatisfactionChart');
        if (ctx2) {
            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: ['5★', '4★', '3★', '2★', '1★'],
                    datasets: [{
                        label: 'Customer Ratings',
                        data: [450, 290, 80, 20, 10],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    function viewApplication(applicationId) {
        // Call the proper function to show application details
        viewApplicationDetails(applicationId);
    }

    function renderProfitChart(trendData) {
        //onsole.log('renderProfitChart function called');
        const chartContainer = document.querySelector('.profit-chart');
        if (!chartContainer) {
            console.error('Profit chart container not found');
            return;
        }
        
        chartContainer.innerHTML = '<canvas id="profit-chart"></canvas>';
        const ctx = document.getElementById('profit-chart');
        if (!ctx) {
            console.error('Profit chart canvas element not found');
            return;
        }

        if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
            console.warn('renderProfitChart: No valid trendData provided.');
            chartContainer.innerHTML = '<p class="empty-state">No profit data available to display.</p>';
            return;
        }
        
        // Format dates and values for the chart
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const revenueData = trendData.map(item => item.revenue);
        const profitData = trendData.map(item => item.profit);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenueData,
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Profit',
                        data: profitData,
                        borderColor: '#2e7d32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // Load Today's Services
    async function loadTodayServices() {
        // //console.log('Loading today\'s services...'); // Debug log
        try {
            const response = await fetch('assets/php/get_todays_services.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // //console.log('Services API response:', data); // Debug log
            
            if (data.error) {
                // console.error('Error from services API:', data.error);
                if (data.debug_message) {
                    console.error('Error message:', data.debug_message);
                }
                renderTodayServices([]); // Show empty state
                return;
            }
            
            if (!data.services || !Array.isArray(data.services)) {
                console.error('Invalid services data format:', data);
                renderTodayServices([]); // Show empty state
                return;
            }
            
            //onsole.log('Updating services list with data:', data.services);
            renderTodayServices(data.services);
            
        } catch (error) {
            console.error('Error fetching services:', error);
            renderTodayServices([]); // Show empty state
        }
    }

    // Render Today's Services
    function renderTodayServices(services) {
        // //console.log('Rendering services:', services); // Debug log
        const serviceList = document.querySelector('.service-list');
        if (!serviceList) {
            // console.error('Service list container not found');
            return;
        }

        // Clear current services
        serviceList.innerHTML = '';

        // Guard against empty services
        if (!services || !Array.isArray(services) || services.length === 0) {
            serviceList.innerHTML = '<div class="empty-state">No services scheduled for today</div>';
            return;
        }

        const html = services.map(service => {
            // Ensure we have required fields
            if (!service.service_time || !service.service_name) {
                // console.error('Invalid service data:', service);
                return '';
            }

            try {
                const time = new Date(`${service.service_date} ${service.service_time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

                const statusClass = (service.status || 'pending').toLowerCase().replace('_', '-');
                
                return `
                    <div class="service-item">
                        <div>
                            <h4>${service.service_name}</h4>
                            <p>${service.customer_name} - ${time}</p>
                            ${service.professional_name ? 
                                `<p class="professional-info">
                                    <i class="fas fa-user-tie"></i> ${service.professional_name}
                                </p>` : ''
                            }
                            <p class="address-info">
                                <i class="fas fa-map-marker-alt"></i> ${service.service_address || 'No address provided'}
                            </p>
                        </div>
                        <span class="status-badge status-${statusClass}">${service.status || 'Pending'}</span>
                    </div>
                `;
            } catch (error) {
                // console.error('Error creating service HTML:', error, service);
                return '';
            }
        }).filter(html => html !== '').join('');

        if (!html) {
            // //console.log('No valid services to display after filtering');
            serviceList.innerHTML = '<div class="empty-state">No services scheduled for today</div>';
            return;
        }

        // //console.log('Setting services HTML'); // Debug log
        serviceList.innerHTML = html;
    }

    function renderAppointments(appointments) {
        const appointmentListContainer = document.querySelector('.schedule-sidebar .service-requests-list');
        if (!appointmentListContainer) {
            console.error('Service requests list container not found in .schedule-sidebar.');
            return;
        }

        appointmentListContainer.innerHTML = ''; // Clear current appointments

        if (!appointments || appointments.length === 0) {
            appointmentListContainer.innerHTML = '<div class="empty-state">No pending appointments found</div>';
            return;
        }
        
        appointments.forEach(appointment => {
            // Use the structure observed in the console log for admin1aa.js:3360
            const serviceName = appointment.title || 'Service';
            const customerName = appointment.customer_name || 'N/A';
            const serviceAddress = (appointment.address && appointment.address.full) ? appointment.address.full : 'No address provided';
            const serviceType = appointment.service_type || 'default'; // Store the raw service_type
            const badgeTypeClass = String(serviceType).toLowerCase().replace(/[^a-z0-9-_]/g, '-');

            let displayDate = 'N/A';
            if (appointment.start) { // Use appointment.start for the date
                const dateObj = new Date(appointment.start);
                if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
                    displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
            }
            
            const html = `
                <div class="service-request-item" data-appointment-id="${appointment.id}" data-service-type="${String(serviceType).toLowerCase()}">
                    <div class="service-request-details">
                        <h4>${serviceName}</h4>
                        <p>Date: ${displayDate}</p>
                        <p>${serviceAddress}</p>
                        <p><small>Customer: ${customerName}</small></p>
                        <span class="service-type-badge type-${badgeTypeClass}">${formatServiceType(serviceType)}</span>
                    </div>
                    <div class="request-actions">
                        <button class="btn-primary" data-modal="appointment-details" data-appointment-id="${appointment.id}">Confirm</button>
                        <button class="btn-secondary" data-modal="appointment-details" data-appointment-id="${appointment.id}">Details</button>
                    </div>
                </div>
            `;
            appointmentListContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    function renderCustomerList(customers) {
        //onsole.log('renderCustomerList function called');
        const customerTableBody = document.querySelector('.customer-list-table tbody');
        if (!customerTableBody) return;
        
        customerTableBody.innerHTML = ''; // Clear current customers
        
        if (!customers || !Array.isArray(customers) || customers.length === 0) {
            const emptyRow = `
                <tr>
                    <td colspan="8" class="empty-state">No customers found</td>
                </tr>
            `;
            customerTableBody.innerHTML = emptyRow;
            return;
        }
        
        customers.forEach(customer => {
            const initials = (customer && customer.name && typeof customer.name === 'string' && customer.name.trim() !== '') 
                            ? customer.name.split(' ').map(n => n[0]).join('') 
                            : '??';
            
            const serviceBadges = (customer && customer.services && Array.isArray(customer.services) && customer.services.length > 0) 
                                ? customer.services.map(service => 
                                    `<span class="service-badge ${String(service).toLowerCase().replace(/\s+/g, '-')}">${formatServiceName(String(service))}</span>`
                                  ).join('') 
                                : '<span class="no-services">None</span>';
            
            const html = `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>
                        <div class="customer-info">
                            <div class="customer-avatar">${initials}</div>
                            <div>
                                <div class="customer-name">${customer.name}</div>
                                <div class="customer-email">${customer.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>${customer.location}</td>
                    <td>
                        <div class="service-badges">
                            ${serviceBadges}
                        </div>
                    </td>
                    <td>${customer.last_visit}</td>
                    <td>$${customer.ltv.toFixed(0)}</td>
                    <td><span class="status-badge status-${customer.status.toLowerCase()}">${customer.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" title="View Details" data-modal="customer-details" data-customer-id="${customer.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" title="Edit Customer" data-modal="edit-customer" data-customer-id="${customer.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" title="More Options" data-modal="customer-options" data-customer-id="${customer.id}">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            customerTableBody.insertAdjacentHTML('beforeend', html);
        });
    }

    function setupPagination(pagination) {
        const paginationInfo = document.querySelector('.pagination-info');
        const paginationButtons = document.querySelector('.pagination-buttons');
        
        if (!paginationInfo || !paginationButtons) return;
        
        // Update pagination info
        paginationInfo.textContent = `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} entries`;
        
        // Clear current pagination buttons
        paginationButtons.innerHTML = '';
        
        // Add previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = pagination.page === 1;
        prevButton.onclick = () => loadCustomerPage(pagination.page - 1);
        paginationButtons.appendChild(prevButton);
        
        // Determine which page buttons to show
        let startPage = Math.max(1, pagination.page - 2);
        let endPage = Math.min(pagination.pages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Add numbered page buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = i === pagination.page ? 'active' : '';
            pageButton.onclick = () => loadCustomerPage(i);
            paginationButtons.appendChild(pageButton);
        }
        
        // Add ellipsis if needed
        if (endPage < pagination.pages) {
            const ellipsis = document.createElement('button');
            ellipsis.textContent = '...';
            ellipsis.disabled = true;
            paginationButtons.appendChild(ellipsis);
            
            // Add last page button
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = pagination.pages;
            lastPageButton.onclick = () => loadCustomerPage(pagination.pages);
            paginationButtons.appendChild(lastPageButton);
        }
        
        // Add next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = pagination.page === pagination.pages;
        nextButton.onclick = () => loadCustomerPage(pagination.page + 1);
        paginationButtons.appendChild(nextButton);
    }

    function loadCustomerPage(page) {
        // Get current search and filter values
        const searchInput = document.querySelector('.search-bar input');
        const serviceFilter = document.querySelector('.filter-select:nth-child(1)');
        const statusFilter = document.querySelector('.filter-select:nth-child(2)');
        
        const params = new URLSearchParams();
        params.append('page', page);
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (serviceFilter && serviceFilter.value) {
            params.append('service', serviceFilter.value);
        }
        
        if (statusFilter && statusFilter.value) {
            params.append('status', statusFilter.value);
        }
        
        // Load customer data for the selected page
        fetch(`assets/php/admin_crm.php?action=list&${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                renderCustomerList(data.customers);
                setupPagination(data.pagination);
            })
            .catch(error => {
                console.error('Error loading customer page:', error);
            });
    }

    // Sidebar Toggle
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active'); // Changed 'collapsed' to 'active'
    }

    // Initialize charts for CRM section
    function initCrmCharts() {
        //onsole.log('TRACE: initCrmCharts (line 1782) called');
        // Assuming crmDataStore.insights is populated by loadCRMData
        const insights = crmDataStore && crmDataStore.insights ? crmDataStore.insights : {};

        try {
            // Customer growth chart
            const customerGrowthCtx = document.getElementById('customer-growth-chart');
            if (customerGrowthCtx && customerGrowthCtx.getContext) {
                 if (customerGrowthCtx._chartInstance) customerGrowthCtx._chartInstance.destroy();
                 customerGrowthCtx._chartInstance = new Chart(customerGrowthCtx, {
                    type: 'line',
                    data: {
                        labels: insights.customer_growth?.map(item => { /*...*/ }) || [],
                        datasets: [{
                            label: 'New Customers',
                            data: insights.customer_growth?.map(item => item.new_users) || [],
                            // ... other dataset properties
                        }]
                    },
                    options: { /* options */ }
                });
            }

            // Revenue by service chart
            const revenueByServiceCtx = document.getElementById('revenue-by-service-chart');
            if (revenueByServiceCtx && revenueByServiceCtx.getContext) {
                if (revenueByServiceCtx._chartInstance) revenueByServiceCtx._chartInstance.destroy();
                revenueByServiceCtx._chartInstance = new Chart(revenueByServiceCtx, {
                    type: 'doughnut',
                    data: {
                        labels: insights.service_distribution?.map(item => item.category) || [], // Example labels
                        datasets: [{
                            data: insights.service_distribution?.map(item => item.order_count) || [], // Example data
                             backgroundColor: insights.service_distribution?.map(item => getServiceColor(item.category)) || [],
                            // ... other dataset properties
                        }]
                    },
                    options: { /* options */ }
                });
            }
        } catch (error) {
            console.error('Error initializing CRM charts:', error);
        }
    }

    // Event handler functions (Revised for calendar event click)
    // function viewAppointmentDetails(calendarEventObject) { ... } // REMOVED

    // Central function to populate and show the static appointment details modal
    // This function will be used by both calendar event clicks and sidebar button clicks
    // function populateAndShowAppointmentDetailsModal(appointment) { ... } // REMOVED

    function viewCustomerDetails(customerId) {
        //onsole.log('Fetching details for customer:', customerId);
        // Fetch customer details
        fetch(`assets/php/admin_crm.php?action=customer-details&id=${customerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching customer details:', data.error);
                    return;
                }
                displayCustomerDetails(data);
            })
            .catch(error => {
                console.error('Error fetching customer details:', error);
            });
    }

    function displayCustomerDetails(customerData) {
        // Check if we have valid customer data
        if (!customerData || !customerData.customer) {
            console.error('Invalid customer data received:', customerData);
            return;
        }

        const modal = document.getElementById('customer-details-modal');
        if (!modal) {
            console.error('Customer details modal not found');
            return;
        }

        // Create initials safely
        const fullName = customerData.customer.full_name || '';
        const initials = fullName.split(' ')
            .filter(part => part.length > 0)
            .map(part => part[0])
            .join('') || '??';

        // Update modal content with null checks
        const customerAvatar = modal.querySelector('.customer-avatar');
        if (customerAvatar) customerAvatar.textContent = initials;

        const customerNameEl = modal.querySelector('.customer-name');
        if (customerNameEl) customerNameEl.textContent = customerData.customer.full_name || 'N/A';

        const customerEmailEl = modal.querySelector('.customer-email');
        if (customerEmailEl) customerEmailEl.textContent = customerData.customer.email || 'No email';

        const customerPhoneEl = modal.querySelector('.customer-phone');
        if (customerPhoneEl) customerPhoneEl.textContent = customerData.customer.phone || 'No phone';
        
        // Update metrics with null checks
        const ordersCountEl = modal.querySelector('.orders-count');
        if (ordersCountEl) ordersCountEl.textContent = customerData.metrics?.order_count || '0';

        const totalSpentEl = modal.querySelector('.total-spent');
        if (totalSpentEl) totalSpentEl.textContent = `$${(customerData.metrics?.total_spent || 0).toFixed(2)}`;

        const avgOrderEl = modal.querySelector('.avg-order');
        if (avgOrderEl) avgOrderEl.textContent = `$${(customerData.metrics?.avg_order_value || 0).toFixed(2)}`;

        // Update status badge with null checks
        const statusBadge = modal.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.className = `status-badge status-${(customerData.customer.status || 'unknown').toLowerCase()}`;
            statusBadge.textContent = customerData.customer.status || 'Unknown';
        }

        // Update orders table
        const ordersTableBody = modal.querySelector('#orders-tab tbody');
        if (ordersTableBody) {
            ordersTableBody.innerHTML = customerData.orders && customerData.orders.length > 0 
                ? customerData.orders.map(order => `
                                    <tr>
                                        <td>#${order.id}</td>
                                        <td>${order.date}</td>
                        <td>$${(order.amount || 0).toFixed(2)}</td>
                        <td><span class="status-badge status-${(order.status || 'unknown').toLowerCase()}">${order.status || 'Unknown'}</span></td>
                        <td>${order.item_count || 0}</td>
                                    </tr>
                `).join('')
                : '<tr><td colspan="5" class="empty-state">No orders found</td></tr>';
        }

        // Update addresses list
        const addressList = modal.querySelector('.address-list');
        if (addressList) {
            addressList.innerHTML = customerData.addresses && customerData.addresses.length > 0
                ? customerData.addresses.map(address => `
                                <div class="address-card">
                        <p>${address.street || 'No street address'}</p>
                        <p>${[address.city, address.state, address.zipcode].filter(Boolean).join(', ') || 'No location info'}</p>
                                </div>
                `).join('')
                : '<p class="empty-state">No addresses found</p>';
        }

        // Update subscriptions table
        const subscriptionsTableBody = modal.querySelector('#subscriptions-tab tbody');
        if (subscriptionsTableBody) {
            subscriptionsTableBody.innerHTML = customerData.subscriptions && customerData.subscriptions.length > 0
                ? customerData.subscriptions.map(sub => `
                    <tr>
                        <td>${formatSubscriptionFrequency(sub.frequency || 'unknown')}</td>
                        <td>${sub.next_service_date || 'N/A'}</td>
                        <td><span class="status-badge status-${(sub.status || 'unknown').toLowerCase()}">${sub.status || 'Unknown'}</span></td>
                                        <td>
                                            <button class="btn-sm" onclick="viewOrder(${sub.original_order_id})">View Order</button>
                                        </td>
                                    </tr>
                `).join('')
                : '<tr><td colspan="4" class="empty-state">No subscriptions found</td></tr>';
        }

        // Store customer ID for edit button
        const editCustomerBtn = modal.querySelector('.edit-customer-btn');
        if (editCustomerBtn) editCustomerBtn.setAttribute('data-customer-id', customerData.customer.id);

        // Show the modal
        showModal('customer-details-modal');
    }

    // Helper function to format subscription frequency
    function formatSubscriptionFrequency(frequency) {
        if (!frequency) return 'Unknown';
        return frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase().replace('_', ' ');
    }

    function editCustomer(customerId) {
        //onsole.log('Editing customer:', customerId);
        // Fetch customer details first
        fetch(`assets/php/admin_crm.php?action=customer-details&id=${customerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching customer details:', data.error);
                    return;
                }
                displayEditCustomerForm(data);
            })
            .catch(error => {
                console.error('Error fetching customer details:', error);
            });
    }

    function displayEditCustomerForm(customerData) {
        if (!customerData || !customerData.customer) {
            console.error('Invalid customer data received:', customerData);
            return;
        }

        const modal = document.getElementById('edit-customer-modal');
        if (!modal) {
            console.error('Edit customer modal not found');
            return;
        }

        // Set customer ID in hidden field
        modal.querySelector('#edit-customer-id').value = customerData.customer.id;

        // Populate form fields
        modal.querySelector('#edit-first-name').value = customerData.customer.first_name || '';
        modal.querySelector('#edit-last-name').value = customerData.customer.last_name || '';
        modal.querySelector('#edit-email').value = customerData.customer.email || '';
        modal.querySelector('#edit-phone').value = customerData.customer.phone || '';
        modal.querySelector('#edit-status').value = customerData.customer.status || 'active';

        // Handle addresses
        const addressesContainer = modal.querySelector('#addresses-container');
        addressesContainer.innerHTML = ''; // Clear existing addresses

        if (customerData.addresses && customerData.addresses.length > 0) {
            customerData.addresses.forEach(address => {
                const template = document.getElementById('address-template');
                const addressForm = template.content.cloneNode(true);
                
                // Set address ID
                addressForm.querySelector('input[name="address_id[]"]').value = address.id;
                
                // Set address fields
                addressForm.querySelector('input[name="street[]"]').value = address.street || '';
                addressForm.querySelector('input[name="city[]"]').value = address.city || '';
                addressForm.querySelector('input[name="state[]"]').value = address.state || '';
                addressForm.querySelector('input[name="zipcode[]"]').value = address.zipcode || '';

                addressesContainer.appendChild(addressForm);
            });
        }

        // Add event listener for the "Add Address" button if not already added
        const addAddressBtn = modal.querySelector('.add-address-btn');
        if (!addAddressBtn.dataset.listenerAdded) {
            addAddressBtn.addEventListener('click', () => {
                const template = document.getElementById('address-template');
                const newAddress = template.content.cloneNode(true);
                addressesContainer.appendChild(newAddress);
            });
            addAddressBtn.dataset.listenerAdded = 'true';
        }

        // Add event listener for removing addresses (using event delegation)
        if (!addressesContainer.dataset.listenerAdded) {
            addressesContainer.addEventListener('click', (e) => {
                if (e.target.closest('.remove-address-btn')) {
                    const addressGroup = e.target.closest('.address-form-group');
                    if (addressGroup) {
                        addressGroup.remove();
                    }
                }
            });
            addressesContainer.dataset.listenerAdded = 'true';
        }

        // Add form submit handler if not already added
        const form = modal.querySelector('#edit-customer-form');
        if (!form.dataset.listenerAdded) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                saveCustomerChanges(form);
            });
            form.dataset.listenerAdded = 'true';
        }

        // Show the modal
        showModal('edit-customer-modal');
    }

    function saveCustomerChanges(form) {
        const formData = new FormData(form);
        
        fetch('assets/php/admin_crm.php?action=update-customer', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                hideModal('edit-customer-modal');
                // Refresh the customer list
                updateCustomerTable();
            } else {
                console.error('Error saving customer changes:', data.error);
            }
        })
        .catch(error => {
            console.error('Error saving customer changes:', error);
        });
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Marketing campaign functions
    function editCampaign(campaignId) {
        // Fetch campaign details
        fetch(`assets/php/admin_marketing.php?action=campaign-details&id=${campaignId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching campaign details:', data.error);
                    return;
                }
                displayCampaignEditForm(data);
            })
            .catch(error => {
                console.error('Error fetching campaign details:', error);
            });
    }

    function displayCampaignEditForm(campaign) {
        // Create a modal with form for editing campaign
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Campaign</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-campaign-form">
                        <input type="hidden" name="id" value="${campaign.id}">
                        
                        <div class="form-group">
                            <label for="name">Campaign Name</label>
                            <input type="text" id="name" name="name" value="${campaign.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" rows="3">${campaign.description}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="start_date">Start Date</label>
                                <input type="date" id="start_date" name="start_date" value="${campaign.start_date}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="end_date">End Date</label>
                                <input type="date" id="end_date" name="end_date" value="${campaign.end_date || ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="offer">Offer</label>
                            <input type="text" id="offer" name="offer" value="${campaign.offer}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status" required>
                                <option value="planned" ${campaign.status === 'planned' ? 'selected' : ''}>Planned</option>
                                <option value="active" ${campaign.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="paused" ${campaign.status === 'paused' ? 'selected' : ''}>Paused</option>
                                <option value="completed" ${campaign.status === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="budget_total">Budget Total</label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">$</span>
                                <input type="number" id="budget_total" name="budget_total" value="${campaign.budget.total}" min="0" step="0.01" required>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="submitCampaignEdit()">Save Changes</button>
                    <button class="btn-secondary modal-close">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for closing modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function submitCampaignEdit() {
        const form = document.getElementById('edit-campaign-form');
        if (!form) return;
        
        // Get form data
        const formData = {
            id: parseInt(form.elements.id.value),
            name: form.elements.name.value,
            description: form.elements.description.value,
            start_date: form.elements.start_date.value,
            end_date: form.elements.end_date.value,
            offer: form.elements.offer.value,
            status: form.elements.status.value,
            budget_total: parseFloat(form.elements.budget_total.value)
        };
        
        // Submit form data
        fetch('assets/php/admin_marketing.php?action=update-campaign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error updating campaign:', data.error);
                showNotification(data.error, 'error');
                return;
            }
            
            // Close modal
            const modal = document.querySelector('.modal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            // Refresh campaigns
            fetch('assets/php/admin_marketing.php?action=campaigns')
                .then(response => response.json())
                .then(data => {
                    renderCampaigns(data.campaigns);
                })
                .catch(error => {
                    console.error('Error loading campaigns:', error);
                });
            
            // Show success notification
            showNotification('Campaign updated successfully');
        })
        .catch(error => {
            console.error('Error updating campaign:', error);
            showNotification('Failed to update campaign', 'error');
        });
    }

    function toggleCampaignStatus(campaignId) {
        // Fetch campaign details
        fetch(`assets/php/admin_marketing.php?action=campaign-details&id=${campaignId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching campaign details:', data.error);
                    return;
                }
                
                // Determine the new status
                let newStatus;
                switch(data.status) {
                    case 'active':
                        newStatus = 'paused';
                        break;
                    case 'paused':
                        newStatus = 'active';
                        break;
                    case 'planned':
                        newStatus = 'cancelled';
                        break;
                    case 'completed':
                        newStatus = 'archived';
                        break;
                    default:
                        newStatus = data.status;
                }
                
                // Update the campaign status
                const updateData = {
                    id: campaignId,
                    status: newStatus
                };
                
                fetch('assets/php/admin_marketing.php?action=update-campaign', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.error) {
                        console.error('Error updating campaign status:', result.error);
                        showNotification(result.error, 'error');
                        return;
                    }
                    
                    // Refresh campaigns
                    fetch('assets/php/admin_marketing.php?action=campaigns')
                        .then(response => response.json())
                        .then(data => {
                            renderCampaigns(data.campaigns);
                        })
                        .catch(error => {
                            console.error('Error loading campaigns:', error);
                        });
                    
                    // Show success notification
                    showNotification(`Campaign ${newStatus}`);
                })
                .catch(error => {
                    console.error('Error updating campaign status:', error);
                    showNotification('Failed to update campaign status', 'error');
                });
            })
            .catch(error => {
                console.error('Error fetching campaign details:', error);
            });
    }

    function viewCampaignStats(campaignId) {
        // Fetch campaign details
        fetch(`assets/php/admin_marketing.php?action=campaign-details&id=${campaignId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching campaign details:', data.error);
                    return;
                }
                displayCampaignStats(data);
            })
            .catch(error => {
                console.error('Error fetching campaign details:', error);
            });
    }

    function displayCampaignStats(campaign) {
        // Create a modal to display campaign stats
        const modal = document.createElement('div');
        modal.className = 'modal campaign-stats-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Campaign Performance</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="campaign-header">
                        <h3>${campaign.name}</h3>
                        <span class="dates">${formatDateRange(campaign.start_date, campaign.end_date)}</span>
                        <span class="status-badge status-${campaign.status}">${campaign.status}</span>
                    </div>
                    
                    <div class="stats-summary">
                        <div class="stat-card">
                            <div class="stat-value">${campaign.performance.impressions.toLocaleString()}</div>
                            <div class="stat-label">Impressions</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${campaign.performance.clicks.toLocaleString()}</div>
                            <div class="stat-label">Clicks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${campaign.performance.ctr}%</div>
                            <div class="stat-label">CTR</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${campaign.performance.conversions}</div>
                            <div class="stat-label">Conversions</div>
                        </div>
                    </div>
                    
                    <div class="stats-cards">
                        <div class="stats-card">
                            <h4>Budget</h4>
                            <div class="budget-stats">
                                <div class="budget-row">
                                    <span>Total Budget</span>
                                    <span>$${campaign.budget.total}</span>
                                </div>
                                <div class="budget-row">
                                    <span>Amount Spent</span>
                                    <span>$${campaign.budget.used}</span>
                                </div>
                                <div class="budget-row">
                                    <span>Remaining</span>
                                    <span>$${campaign.budget.remaining}</span>
                                </div>
                            </div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${(campaign.budget.used / campaign.budget.total) * 100}%"></div>
                            </div>
                        </div>
                        
                        <div class="stats-card">
                            <h4>ROI</h4>
                            <div class="roi-stats">
                                <div class="roi-number">
                                    <span class="value">${campaign.performance.roi}%</span>
                                    <span class="label">Return on Investment</span>
                                </div>
                                <div class="roi-details">
                                    <div class="detail-row">
                                        <span>Revenue Generated</span>
                                        <span>$${campaign.performance.revenue}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>Cost</span>
                                        <span>$${campaign.budget.used}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card full-width">
                        <h4>Daily Performance</h4>
                        <div class="chart-container">
                            <canvas id="daily-performance-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="editCampaign(${campaign.id})">Edit Campaign</button>
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize chart
        setTimeout(() => {
            const ctx = document.getElementById('daily-performance-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: campaign.daily_stats.map(day => {
                            const date = new Date(day.date);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }),
                        datasets: [
                            {
                                label: 'Impressions',
                                data: campaign.daily_stats.map(day => day.impressions),
                                borderColor: '#1976d2',
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                tension: 0.3,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Clicks',
                                data: campaign.daily_stats.map(day => day.clicks),
                                borderColor: '#f57c00',
                                backgroundColor: 'rgba(245, 124, 0, 0.1)',
                                tension: 0.3,
                                yAxisID: 'y1'
                            },
                            {
                                label: 'Conversions',
                                data: campaign.daily_stats.map(day => day.conversions),
                                borderColor: '#2e7d32',
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                tension: 0.3,
                                yAxisID: 'y2'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Impressions'
                                }
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Clicks'
                                },
                                grid: {
                                    drawOnChartArea: false
                                }
                            },
                            y2: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Conversions'
                                },
                                grid: {
                                    drawOnChartArea: false
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
        
        // Add event listeners for closing modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function createPromoCode() {
        // Display a form for creating a new promo code
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create Promo Code</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="create-promo-form">
                        <div class="form-group">
                            <label for="code">Promo Code</label>
                            <input type="text" id="code" name="code" placeholder="e.g., SUMMER2023" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="discount_type">Discount Type</label>
                                <select id="discount_type" name="discount_type" required>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="discount_value">Discount Value</label>
                                <div class="input-with-prefix">
                                    <span class="input-prefix discount-prefix">%</span>
                                    <input type="number" id="discount_value" name="discount_value" min="1" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="max_uses">Maximum Uses</label>
                                <input type="number" id="max_uses" name="max_uses" min="1" value="100" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="expiry">Expiry Date</label>
                                <input type="date" id="expiry" name="expiry" required>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="submitPromoCode()">Create Code</button>
                    <button class="btn-secondary modal-close">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set default expiry date to 3 months from now
        const expiry = document.getElementById('expiry');
        if (expiry) {
            const date = new Date();
            date.setMonth(date.getMonth() + 3);
            expiry.value = date.toISOString().split('T')[0];
        }
        
        // Update discount prefix based on discount type
        const discountType = document.getElementById('discount_type');
        const discountPrefix = document.querySelector('.discount-prefix');
        
        if (discountType && discountPrefix) {
            discountType.addEventListener('change', () => {
                discountPrefix.textContent = discountType.value === 'percentage' ? '%' : '$';
            });
        }
        
        // Add event listeners for closing modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function submitPromoCode() {
        const form = document.getElementById('create-promo-form');
        if (!form) return;
        
        // Get form data
        const formData = {
            code: form.elements.code.value,
            discount_type: form.elements.discount_type.value,
            discount_value: parseFloat(form.elements.discount_value.value),
            max_uses: parseInt(form.elements.max_uses.value),
            expiry: form.elements.expiry.value
        };
        
        // Submit form data
        fetch('assets/php/admin_marketing.php?action=create-promo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error creating promo code:', data.error);
                showNotification(data.error, 'error');
                return;
            }
            
            // Close modal
            const modal = document.querySelector('.modal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            // Refresh promo codes
            fetch('assets/php/admin_marketing.php?action=promo-codes')
                .then(response => response.json())
                .then(data => {
                    renderPromoCodes(data.promo_codes);
                })
                .catch(error => {
                    console.error('Error loading promo codes:', error);
                });
            
            // Show success notification
            showNotification('Promo code created successfully');
        })
        .catch(error => {
            console.error('Error creating promo code:', error);
            showNotification('Failed to create promo code', 'error');
        });
    }

    // Marketing & Communications Tab Switching
    document.addEventListener('DOMContentLoaded', function() {
        const marketingTabs = document.querySelectorAll('.marketing-tab');
        
        marketingTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                marketingTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all content sections
                document.querySelectorAll('.marketing-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show selected content
                const contentId = `${tab.dataset.tab}-content`;
                document.getElementById(contentId).classList.add('active');
            });
        });
    });

    // Referral Program View Switching
    function switchReferralView(viewType) {
        // Hide all views
        document.querySelectorAll('.referral-view').forEach(view => {
            view.style.display = 'none';
        });
        
        // Show selected view
        const selectedView = document.getElementById(`${viewType}-view`);
        if (selectedView) {
            selectedView.style.display = 'block';
        }
    }

    // Support & Contact Management Functions
    function loadSupportSection() {
        loadSupportOverview();
        loadSupportTickets();
        loadContactSubmissions();
    }

    function loadSupportOverview() {
        fetch('assets/php/admin_support.php?action=overview')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update overview cards
                    document.getElementById('open-tickets-count').textContent = data.open_tickets;
                    document.getElementById('unread-submissions-count').textContent = data.unread_submissions;
                    document.getElementById('avg-response-time').textContent = data.avg_response_time;
                    document.getElementById('resolution-rate').textContent = data.resolution_rate + '%';
                }
            })
            .catch(error => {
                console.error('Error loading support overview:', error);
            });
    }

    function loadSupportTickets(filter = 'all') {
        const ticketList = document.getElementById('support-tickets');
        if (!ticketList) {
            console.error('Support tickets container not found');
            return;
        }

        //onsole.log('Loading support tickets with filter:', filter);
        ticketList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';

        fetch(`assets/php/get_support_tickets.php${filter !== 'all' ? `?status=${filter}` : ''}`)
            .then(response => {
                //onsole.log('Support tickets response status:', response.status);
                return response.text().then(text => {
                    try {
                        //onsole.log('Raw response:', text);
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('JSON parse error:', e);
                        //onsole.log('Response that failed to parse:', text);
                        throw e;
                    }
                });
            })
            .then(data => {
                //onsole.log('Parsed support tickets data:', data);
                if (data.success && data.tickets) {
                    if (data.tickets.length === 0) {
                        //onsole.log('No tickets found in response');
                        ticketList.innerHTML = '<div class="empty-state">No tickets found</div>';
                        return;
                    }

                    //onsole.log('Rendering tickets:', data.tickets);
                    ticketList.innerHTML = data.tickets.map(ticket => `
                        <div class="ticket-item">
                            <div class="ticket-priority priority-${ticket.priority.toLowerCase()}">
                                <i class="fas ${getPriorityIcon(ticket.priority)}"></i>
                            </div>
                                <div class="ticket-info">
                                <div class="ticket-header">
                                    <h3 class="ticket-title">${ticket.subject}</h3>
                                    <span class="ticket-status status-${ticket.status.toLowerCase()}">${formatStatus(ticket.status)}</span>
                                </div>
                                <div class="ticket-meta">
                                    <span><i class="fas fa-user"></i> User #${ticket.user_id}</span>
                                    <span><i class="fas fa-clock"></i> ${formatTimeAgo(ticket.created_at)}</span>
                                    <span><i class="fas fa-comment"></i> ${ticket.description ? truncateText(ticket.description, 50) : 'No description'}</span>
                            </div>
                            </div>
                            <div class="ticket-actions">
                                <button class="btn-icon" title="View Details" onclick="viewTicketDetails(${ticket.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" title="Update Status" onclick="viewTicketDetails(${ticket.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');

                    console.log('Tickets rendered successfully');
                    initializeTooltips();
                } else {
                    console.warn('Invalid response format:', data);
                    ticketList.innerHTML = '<div class="empty-state">No tickets found</div>';
                }
            })
            .catch(error => {
                console.error('Error loading tickets:', error);
                ticketList.innerHTML = '<div class="empty-state">Error loading tickets. Please try again.</div>';
            });
    }

    //function for view detail
    function viewTicketDetails(ticketId) {
        const modal = document.getElementById('ticket-details-modal');
        const modalContent = modal.querySelector('.modal-content');

        modalContent.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

        modal.classList.add('show'); // Apply fade-in via CSS

        fetch(`assets/php/get_ticket_detail.php?id=${ticketId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.ticket) {
                    const ticket = data.ticket;

                    modalContent.innerHTML = `
                        <div class="detail-section">
                            <h3><i class="fas fa-info-circle"></i> Ticket Overview</h3>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span class="detail-value">${ticket.subject}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Description:</span>
                                <span class="detail-value">${ticket.description}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="status-badge status-${ticket.status.toLowerCase()}">${formatStatus(ticket.status)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Priority:</span>
                                <span class="priority-badge priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Created:</span>
                                <span class="detail-value">${formatDate(ticket.created_at)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Last Updated:</span>
                                <span class="detail-value">${formatDate(ticket.updated_at)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Resolved:</span>
                                <span class="detail-value">${ticket.resolved_at ? formatDate(ticket.resolved_at) : 'Not resolved yet'}</span>
                            </div>
                        </div>
                    `;
                } else {
                    modalContent.innerHTML = '<p>Failed to load ticket details.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching ticket details:', error);
                modalContent.innerHTML = '<p>Error loading ticket details.</p>';
            });
    }

    function closeTicketModal() {
        const modal = document.getElementById('ticket-details-modal');
        modal.classList.remove('show'); // Will fade out
    }

    // function viewTicketDetails(ticketId) {
    // // Show a loading state in the modal or details area
    // const modal = document.getElementById('ticket-details-modal');
    // const modalContent = modal.querySelector('.modal-content');

    // modalContent.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    // modal.style.display = 'block'; // Show the modal

    // // Fetch ticket details from the backend
    // fetch(`assets/php/get_ticket_detail.php?id=${ticketId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.success && data.ticket) {
    //             const ticket = data.ticket;

    //            modalContent.innerHTML = `
    //             <div class="ticket-details">
    //                 <h2>Ticket #${ticket.id} - ${ticket.subject}</h2>
    //                 <p><strong>Status:</strong> ${ticket.status}</p>
    //                 <p><strong>Priority:</strong> ${ticket.priority}</p>
    //                 <p><strong>User ID:</strong> ${ticket.user_id}</p>
    //                 <p><strong>Created:</strong> ${formatTimeAgo(ticket.created_at)}</p>
    //                 <p><strong>Description:</strong></p>
    //                 <p>${ticket.description || 'No description provided'}</p>
    //                 <button class="close" onclick="closeModal(ticket-details-modal)">Close</button>
    //             </div>
    //         `;

    //         } else {
    //             modalContent.innerHTML = '<p>Failed to load ticket details.</p>';
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error fetching ticket details:', error);
    //         modalContent.innerHTML = '<p>Error loading ticket details.</p>';
    //     });
    // }

    // function closeTicketModal() {
    //     const modal = document.getElementById('ticket-details-modal');
    //     modal.style.display = 'none';
    // }

    function loadContactSubmissions() {
        const submissionsList = document.getElementById('contact-submissions');
        if (!submissionsList) return;

        submissionsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';

        fetch('assets/php/admin_support.php?action=submissions')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.submissions) {
                    submissionsList.innerHTML = data.submissions.map(submission => `
                        <div class="submission-item">
                            <div class="submission-header">
                                <div class="submission-info">
                                    <h3 class="submission-title">${submission.subject}</h3>
                                    <div class="submission-meta">
                                        <span><i class="fas fa-user"></i> ${submission.name}</span>
                                        <span><i class="fas fa-envelope"></i> ${submission.email}</span>
                                        <span><i class="fas fa-clock"></i> ${formatTimeAgo(submission.submission_date)}</span>
                                    </div>
                                </div>
                                <span class="submission-status status-${submission.processed ? 'read' : 'unread'}">
                                    ${submission.processed ? 'Read' : 'Unread'}
                                    </span>
                                </div>
                            <div class="submission-content">
                                ${truncateText(submission.message, 150)}
                            </div>
                            <div class="submission-actions">
                                ${!submission.processed ? `
                                    <button class="btn-mark-read" onclick="markSubmissionRead(${submission.id})">
                                        <i class="fas fa-check"></i> Mark as Read
                                    </button>
                                ` : ''}
                                <button class="btn-view" onclick="viewSubmissionDetails(${submission.id})">
                                    <i class="fas fa-eye"></i> View Details
                                </button>
                            </div>
                        </div>
                    `).join('') || '<div class="empty-state">No submissions found</div>';
                } else {
                    submissionsList.innerHTML = '<div class="empty-state">Failed to load submissions</div>';
                }
            })
            .catch(error => {
                console.error('Error loading submissions:', error);
                submissionsList.innerHTML = '<div class="empty-state">Error loading submissions</div>';
            });
    }

    // Helper Functions
    function getPriorityIcon(priority) {
        const icons = {
            'high': 'fa-exclamation-circle',
            'medium': 'fa-exclamation',
            'low': 'fa-info-circle'
        };
        return icons[priority.toLowerCase()] || 'fa-info-circle';
    }

    function formatStatus(status) {
        //onsole.log('formatStatus function called');
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
    }

    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Keep existing event listeners and initialization code
    document.getElementById('ticket-status-filter')?.addEventListener('change', (e) => {
        loadSupportTickets(e.target.value);
    });

    // Initialize tooltips for the new buttons
    document.addEventListener('DOMContentLoaded', () => {
        initializeTooltips();
        loadSupportTickets();
        loadContactSubmissions();
    });

    function displayTicketDetailsModal(ticket) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Ticket Details</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="ticket-details">
                        <div class="detail-section">
                            <h3>Ticket Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span class="detail-value">${ticket.subject}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="status-badge status-${ticket.status.toLowerCase()}">${formatStatus(ticket.status)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Created:</span>
                                <span class="detail-value">${formatDate(ticket.created_at)}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Customer Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Name:</span>
                                <span class="detail-value">${ticket.customer_name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value">${ticket.customer_email}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Message History</h3>
                            <div class="message-history">
                                ${ticket.messages.map(message => `
                                    <div class="message-item ${message.is_admin ? 'admin' : 'customer'}">
                                        <div class="message-header">
                                            <span class="message-sender">${message.is_admin ? 'Support Team' : ticket.customer_name}</span>
                                            <span class="message-time">${formatDate(message.created_at)}</span>
                                        </div>
                                        <div class="message-content">${message.message}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="updateTicketStatus(${ticket.id})">Update Status</button>
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for closing modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function updateTicketStatus(ticketId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Update Ticket Status</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="update-ticket-form">
                        <div class="form-group">
                            <label for="ticket-status">Status</label>
                            <select id="ticket-status" name="status" required>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="ticket-response">Response (optional)</label>
                            <textarea id="ticket-response" name="response" rows="4"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="submitTicketUpdate(${ticketId})">Update</button>
                    <button class="btn-secondary modal-close">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for closing modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function submitTicketUpdate(ticketId) {
        const form = document.getElementById('update-ticket-form');
        if (!form) return;
        
        const formData = {
            ticket_id: ticketId,
            status: form.elements.status.value,
            response: form.elements.response.value
        };
        
        fetch('assets/php/admin_support.php?action=update-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                const modal = document.querySelector('.modal');
                if (modal) {
                    document.body.removeChild(modal);
                }
                
                // Refresh tickets
                loadSupportTickets(document.getElementById('ticket-status-filter').value);
                loadSupportOverview();
                
                showNotification('Ticket updated successfully');
            } else {
                showNotification(data.error || 'Failed to update ticket', 'error');
            }
        })
        .catch(error => {
            console.error('Error updating ticket:', error);
            showNotification('Error updating ticket', 'error');
        });
    }

    function viewSubmissionDetails(submissionId) {
        fetch(`assets/php/admin_support.php?action=submission-details&id=${submissionId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    displaySubmissionDetailsModal(data.submission);
                    console.log('modal loading started!')
                } else {
                    showNotification('Failed to load submission details', 'error');
                }
            })
            .catch(error => {
                console.error('Error loading submission details:', error);
                showNotification('Error loading submission details', 'error');
            });
    }

    function displaySubmissionDetailsModal(submission) {
        const modal = document.getElementById('submission-actions');
        const modalContent = document.querySelector('.modal-content');

        modalContent.innerHTML = '<p>loading ...</p>'

        modal.classList.add('show');

        console.log('Loading...')
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Contact Submission Details</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="submission-details">
                        <div class="detail-section">
                            <h3>Submission Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span class="detail-value">${submission.subject}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">${formatDate(submission.submission_date)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="status-badge status-${submission.processed ? 'processed' : 'unread'}">
                                    ${submission.processed ? 'Processed' : 'Unread'}
                                </span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Contact Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Name:</span>
                                <span class="detail-value">${submission.name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value">${submission.email}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Message</h3>
                            <div class="message-content">
                                ${submission.message}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    ${submission.processed ? '' : `
                        <button class="btn-primary" onclick="markSubmissionRead(${submission.id}, true)">
                            Mark as Processed
                        </button>
                    `}
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for closing modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function markSubmissionRead(submissionId, reload = false) {
        fetch('assets/php/admin_support.php?action=mark-submission-read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ submission_id: submissionId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (reload) {
                    // Close modal if open
                    const modal = document.querySelector('.modal');
                    if (modal) {
                        document.body.removeChild(modal);
                    }
                    
                    // Refresh submissions
                    loadContactSubmissions();
                    loadSupportOverview();
                } else {
                    // Just update the submission item in the list
                    const submissionItem = document.querySelector(`.submission-item[data-id="${submissionId}"]`);
                    if (submissionItem) {
                        submissionItem.classList.remove('unread');
                        const unreadBadge = submissionItem.querySelector('.unread-badge');
                        if (unreadBadge) {
                            unreadBadge.remove();
                        }
                        const markReadButton = submissionItem.querySelector('button[onclick*="markSubmissionRead"]');
                        if (markReadButton) {
                            markReadButton.remove();
                        }
                    }
                }
                
                showNotification('Submission marked as read');
            } else {
                showNotification(data.error || 'Failed to mark submission as read', 'error');
            }
        })
        .catch(error => {
            console.error('Error marking submission as read:', error);
            showNotification('Error marking submission as read', 'error');
        });
    }

    function markAllSubmissionsRead() {
        fetch('assets/php/admin_support.php?action=mark-all-submissions-read', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Refresh submissions
                loadContactSubmissions();
                loadSupportOverview();
                
                showNotification('All submissions marked as read');
            } else {
                showNotification(data.error || 'Failed to mark submissions as read', 'error');
            }
        })
        .catch(error => {
            console.error('Error marking all submissions as read:', error);
            showNotification('Error marking submissions as read', 'error');
        });
    }

    //Add new team mamber 
    async function submitNewMember() {
        try {
            const form = document.getElementById('add-member-form');
            if (!form) return;

            const name = document.getElementById('member-name').value.trim();
            const email = document.getElementById('member-email').value.trim();
            const phone = document.getElementById('member-phone').value.trim();
            const role = document.getElementById('member-role').value;
            const specializationField = document.getElementById('member-specialization');
            const specializationGroup = document.getElementById('specialization-group');

            // Show error if required fields are missing
            if (!name || !email || !phone || !role) {
                showNotification('error', 'Please fill in all required fields.');
                return;
            }

            const specialization = (role === 'professional') ? specializationField.value : null;

            const data = {
                name,
                email,
                phone,
                role,
                specialization
            };

            const response = await fetch('assets/php/add_team_member.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showNotification('success', 'Team member added successfully!');
                form.reset();
                document.getElementById('specialization-group').style.display = 'none';
                closeModal('add-member-modal');
                // Optionally refresh your team member list here
            } else {
                showNotification('error', result.error || 'Failed to add team member.');
            }

        } catch (error) {
            console.error('Error adding member:', error);
            showNotification('error', 'An error occurred while adding the member.');
        }
    }

    // Submit new service
    async function submitNewService() {
        try {
            const form = document.getElementById('add-service-form');
            if (!form) return;

            // Collect field values
            const name = document.getElementById('service-name').value.trim();
            const category = document.getElementById('service-category').value;
            const description = document.getElementById('service-description').value.trim();
            const price = document.getElementById('service-price').value;
            const duration = document.getElementById('service-duration').value;

            // Basic validation
            if (!name || !category || !description || !price || !duration) {
                showNotification('error', 'Please fill in all required fields');
                return;
            }

            // Construct data object
            const data = {
                name,
                category,
                description,
                price: parseFloat(price),
                duration: parseInt(duration)
            };

            // Send to backend
            const response = await fetch('assets/php/schedule_service.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showNotification('success', 'Service added successfully!');
                form.reset();
                closeModal('add-service-modal'); // Only if you're using a modal
            } else {
                showNotification('error', result.error || 'Failed to add service');
            }

        } catch (error) {
            console.error('Error adding service:', error);
            showNotification('error', 'An error occurred while adding the service');
        }
    }



    // Add these functions after the existing loadAppointments function

    // Load and render appointments
    async function loadAppointments() {
        //onsole.log('loadAppointments function called');
        //onsole.log('Loading appointments...'); // New Log
        try {
            const response = await fetch('assets/php/get_appointments.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            //onsole.log('loadAppointments: API response received:', data); // New Log
            
            if (data.error) {
                console.error('loadAppointments: Error from API:', data.error);
                if (data.debug_message) {
                    console.error('loadAppointments: API Debug message:', data.debug_message);
                }
                renderAppointments([]); // Show empty state in sidebar
                updateAppointmentsCalendar([]); // Clear calendar
                return;
            }
            
            if (!data.appointments || !Array.isArray(data.appointments)) {
                console.error('loadAppointments: Invalid appointments data format. Expected data.appointments to be an array.', data);
                renderAppointments([]); 
                updateAppointmentsCalendar([]);
                return;
            }
            
            //onsole.log('loadAppointments: Calling renderAppointments for sidebar with count:', data.appointments.length); // New Log
            renderAppointments(data.appointments); // This is for the sidebar list
            
            //onsole.log('loadAppointments: Calling updateAppointmentsCalendar with count:', data.appointments.length); // New Log
            updateAppointmentsCalendar(data.appointments); // This updates the FullCalendar
            
        } catch (error) {
            console.error('loadAppointments: Error fetching or processing appointments:', error);
            renderAppointments([]); 
            updateAppointmentsCalendar([]);
        }
    }

    // Render appointments in the sidebar
    // function renderAppointments(appointments) { ... } // Keep existing

    // Update the calendar with appointments
    function updateAppointmentsCalendar(appointmentsData) {
        //onsole.log(`updateAppointmentsCalendar: Function called with appointments count: ${appointmentsData.length}`);
        if (appointmentsData.length > 0) {
            //onsole.log('updateAppointmentsCalendar: First appointment sample:', appointmentsData[0]);
        }

        const calendarEl = document.getElementById('appointments-calendar');
        if (!calendarEl || !calendarEl._fullCalendar) {
            console.warn('updateAppointmentsCalendar: Calendar element or FullCalendar instance not found.');
            return;
        }
        const calendar = calendarEl._fullCalendar;

        // Transform appointment data to FullCalendar event structure
        // The 'appointmentsData' is expected to be an array of objects directly from the getCalendarData PHP endpoint
        const processedEvents = appointmentsData.map(appt => {
            // appt here is one event object from the PHP getCalendarData output
            return {
                id: String(appt.id), // Ensure ID is a string for FullCalendar
                title: appt.title || 'Unnamed Service',
                start: appt.start, // Already formatted YYYY-MM-DD HH:MM:SS
                end: appt.end,     // Already formatted YYYY-MM-DD HH:MM:SS
                className: appt.className, // Pass className directly
                extendedProps: appt.extendedProps || {} // Pass the whole extendedProps object from PHP
            };
        });
        //onsole.log('updateAppointmentsCalendar: Processed FullCalendar events:', processedEvents);

        // Clear existing events and add new ones
            //onsole.log('updateAppointmentsCalendar: Cleared old events.');
        calendar.removeAllEvents();
        //onsole.log(`updateAppointmentsCalendar: Added new event source with count: ${processedEvents.length}`);
        calendar.addEventSource(processedEvents);
        
        // It's often good practice to re-render or refetch events if the source changes significantly,
        // though addEventSource might handle this. If issues persist, these can be useful.
                //onsole.log('updateAppointmentsCalendar: Calling calendarEl._fullCalendar.render()');
        calendar.render(); // Re-render the calendar. Essential if view needs to re-calculate.
                //onsole.log('updateAppointmentsCalendar: Calling calendarEl._fullCalendar.refetchEvents()');
        calendar.refetchEvents(); // If your event source is a function/feed, this re-fetches. For an array, it might just re-process.
    }

    // Filter appointments by service type
    function filterAppointments(type) {
        //onsole.log('filterAppointments function called');
        //onsole.log(`[filterAppointments - Direct Style] Called with type: '${type}'`);
        const filterButtons = document.querySelectorAll('.schedule-filters .filter-btn');
        const normalizedFilterType = type.toLowerCase().replace(/_|-/g, '');

        const activeStyles = {
            backgroundColor: '#4F8E35',
            color: 'white',
            borderColor: '#4F8E35'
        };

        const inactiveStyles = {
            backgroundColor: 'white',
            color: '#666',
            borderColor: '#ddd'
        };

        filterButtons.forEach((btn) => {
            const onclickAttr = btn.getAttribute('onclick');
            const match = onclickAttr ? onclickAttr.match(/filterAppointments\('(.*?)'\)/) : null;
            const buttonOriginalFilterType = match && match[1] ? match[1] : 'unknown';

            let targetStyles;
            if (buttonOriginalFilterType === type) {
                targetStyles = activeStyles;
                // Remove .active class in case CSS is still trying to apply something, though it shouldn't matter for these properties now.
                btn.classList.remove('active'); 
            } else {
                targetStyles = inactiveStyles;
                btn.classList.remove('active'); // Ensure .active class is not present
            }

            btn.style.backgroundColor = targetStyles.backgroundColor;
            btn.style.color = targetStyles.color;
            btn.style.borderColor = targetStyles.borderColor;
            // Assuming border-width and border-style are consistently set by the base .schedule-filters .filter-btn CSS rule
            // If border style needs to change (e.g. from none to solid), you might need:
            // btn.style.borderWidth = '1px'; 
            // btn.style.borderStyle = 'solid';
        });

        //onsole.log('[filterAppointments - Direct Style] --- Final Button States (Inline Styles Applied) ---');
        filterButtons.forEach((btn, index) => {
            //onsole.log(`[filterAppointments - Direct Style] Button ${index}: className='${btn.className}', style.backgroundColor='${btn.style.backgroundColor}', style.color='${btn.style.color}', style.borderColor='${btn.style.borderColor}'`);
        });

        // Filter sidebar list (Pending Appointments)
        const appointmentItems = document.querySelectorAll('.schedule-sidebar .service-request-item');
        appointmentItems.forEach(item => {
            const itemServiceType = item.dataset.serviceType ? item.dataset.serviceType.toLowerCase().replace(/_|-/g, '') : 'default';
            if (normalizedFilterType === 'all' || itemServiceType.includes(normalizedFilterType) || normalizedFilterType.includes(itemServiceType)) {
                item.style.display = ''; // Show item
            } else {
                item.style.display = 'none'; // Hide item
            }
        });

        // Filter FullCalendar events
        const calendarEl = document.getElementById('appointments-calendar');
        if (calendarEl && calendarEl._fullCalendar) {
            const calendar = calendarEl._fullCalendar;
            //onsole.log(`[filterAppointments - Calendar] Filtering. Normalized filter type from button: '${normalizedFilterType}'`);
            calendar.getEvents().forEach((event, eventIndex) => {
                // Get the original service_type from extendedProps
                const originalEventServiceType = event.extendedProps.service_type;
                // Normalize the event's service_type, defaulting if missing
                const normalizedEventServiceType = originalEventServiceType ? String(originalEventServiceType).toLowerCase().replace(/_|-/g, '') : 'default';
                
                let shouldDisplay = false;
                if (normalizedFilterType === 'all') {
                    shouldDisplay = true;
                } else {
                    // Check if the event's normalized type includes the filter type, or vice-versa
                    shouldDisplay = normalizedEventServiceType.includes(normalizedFilterType) || normalizedFilterType.includes(normalizedEventServiceType);
                }

                //console.log(`[filterAppointments - Calendar] Event ${eventIndex} (ID: ${event.id}, Title: '${event.title}'): ` +
                            // `originalRawServiceType='${originalEventServiceType}', normalizedEventServiceType='${normalizedEventServiceType}', ` +
                            // `normalizedButtonFilterType='${normalizedFilterType}', shouldDisplay=${shouldDisplay}`);

                if (shouldDisplay) {
                    event.setProp('display', 'auto'); // 'auto' or 'block' are typical for showing
                } else {
                    event.setProp('display', 'none');
                }
            });
        } else {
            console.warn('[filterAppointments - Calendar] Calendar not found or not initialized for filtering.');
        }
    }

    // View appointment details
    // function viewAppointmentDetailsById(appointmentId) { ... } // REMOVED

    // Confirm appointment
    // async function confirmAppointment(appointmentId) { ... } // REMOVED

    // Format service type for display
    function formatServiceType(type) {
        return type.toLowerCase().split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Update Customer Table
    function updateCustomerTable(customers) {
        const tableBody = document.querySelector('.customer-list-table tbody');
        if (!tableBody) {
            console.error('Customer table body not found');
            return;
        }

        if (!customers || !Array.isArray(customers) || customers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">No customers found</td></tr>';
            return;
        }

        tableBody.innerHTML = customers.map(customer => {
            const firstName = customer.first_name || '';
            const lastName = customer.last_name || '';
            const fullName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'N/A Customer';
            
            const initials = (firstName && lastName)
                ? (firstName[0] + lastName[0]).toUpperCase()
                : (firstName ? firstName[0].toUpperCase() : (lastName ? lastName[0].toUpperCase() : '??'));

            const email = customer.email || 'No email';
            const city = customer.city || '';
            const state = customer.state || '';
            const location = (city || state) ? `${city}${city && state ? ', ' : ''}${state}`.trim() : 'N/A';

            const services = (customer.services && Array.isArray(customer.services) && customer.services.length > 0)
                ? customer.services.map(service => 
                    `<span class="service-badge ${String(service).toLowerCase().replace(/\s+|_/g, '-').replace(/[^a-z0-9-]/g, '')}">${formatServiceName(String(service))}</span>`
                  ).join('')
                : '<span class="no-services">None</span>';

            const lastServiceDate = customer.last_service 
                ? new Date(customer.last_service).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
                  })
                : 'Never';
            
            const lifetimeValue = customer.lifetime_value ? parseFloat(customer.lifetime_value).toFixed(2) : '0.00';
            const status = customer.status || 'inactive';

            return `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>
                        <div class="customer-info">
                            <div class="customer-avatar">${initials}</div>
                            <div>
                                <div class="customer-name">${fullName}</div>
                                <div class="customer-email">${email}</div>
                            </div>
                        </div>
                    </td>
                    <td>${location}</td>
                    <td>
                        <div class="service-badges">
                            ${services}
                        </div>
                    </td>
                    <td>${lastServiceDate}</td>
                    <td>$${lifetimeValue}</td>
                    <td><span class="status-badge status-${status.toLowerCase().replace('_', '-').replace(/\s+/g, '-')}">${formatStatus(status)}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" title="View Details" data-modal="customer-details" data-customer-id="${customer.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" title="Edit Customer" data-modal="edit-customer" data-customer-id="${customer.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" title="More Options" data-modal="customer-options" data-customer-id="${customer.id}">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update Customer Insights
    function updateCustomerInsights(insights) {
        // Update top service card
        const topServiceValueEl = document.querySelector('.insights-data-value');
        const topServiceMetaEl = document.querySelector('.insights-data-meta');
        
        if (!insights || !insights.top_service) {
            if (topServiceValueEl) topServiceValueEl.textContent = 'No data';
            if (topServiceMetaEl) topServiceMetaEl.textContent = 'No service data available';
            return;
        }

        if (topServiceValueEl) {
            topServiceValueEl.textContent = insights.top_service.category || 'No data';
        }
        if (topServiceMetaEl) {
            topServiceMetaEl.textContent = `${insights.top_service.percentage}% of customers`;
        }
    }

    // Initialize Customer Insights Charts
    function initCustomerInsightsCharts(insights) {
        //onsole.log('Initializing customer insights charts with data:', insights);

        // Helper function to safely get chart context
        function getChartContext(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas element '${canvasId}' not found`);
                return null;
            }
            return canvas.getContext('2d');
        }

        // Initialize Customer Growth Chart
        const growthCtx = getChartContext('customer-growth-chart');
        if (growthCtx) {
            try {
                const existingChart = Chart.getChart(growthCtx.canvas);
                if (existingChart) {
                    existingChart.destroy();
                }

                const growthData = insights?.customer_growth || [];
                new Chart(growthCtx, {
                    type: 'line',
                    data: {
                        labels: growthData.map(item => item.month),
                        datasets: [{
                            label: 'New Customers',
                            data: growthData.map(item => item.new_users),
                            borderColor: '#4F8E35',
                            backgroundColor: 'rgba(79, 142, 53, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating customer growth chart:', error);
            }
        }

        // Initialize Service Distribution Chart
        const distributionCtx = getChartContext('service-distribution-chart');
        if (distributionCtx) {
            try {
                const existingChart = Chart.getChart(distributionCtx.canvas);
                if (existingChart) {
                    existingChart.destroy();
                }

                const distributionData = insights?.service_distribution || [];
                new Chart(distributionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: distributionData.map(item => item.category),
                        datasets: [{
                            data: distributionData.map(item => item.order_count),
                            backgroundColor: [
                                '#4F8E35',
                                '#1976D2',
                                '#F57C00',
                                '#7B1FA2',
                                '#C62828'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                left: 10,
                                right: 10,
                                top: 0,
                                bottom: 0
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'right',
                                align: 'center',
                                labels: {
                                    boxWidth: 12,
                                    padding: 15,
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            tooltip: {
                                enabled: true,
                                position: 'nearest',
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value * 100) / total).toFixed(1);
                                        return `${label}: ${percentage}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating service distribution chart:', error);
            }
        }
    }

    // Format service name for display
    function formatServiceName(service) {
        //onsole.log('formatServiceName function called');
        return service.toLowerCase().split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Add these functions after the existing loadMarketingData function

    // Load Marketing Data
    async function loadMarketingData() {
        //onsole.log('loadMarketingData function called');
        try {
            const response = await fetch('assets/php/admin_marketing.php?action=get_dashboard_data'); // Changed endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.success) {
                marketingDataStore = data; // Store fetched data
                updateMarketingOverviewStats(data.overview); // Update the overview numbers
                updateMarketingOverviewCharts(data.overview); 
                updateCampaigns(data.campaigns);
                updatePromoCodes(data.promo_codes);
                // Assuming reviews, social links, SEO are handled elsewhere or within these functions
            } else {
                console.error('Error loading marketing data:', data.error);
                if (data.debug_message) {
                    console.error('Debug message:', data.debug_message);
                }
                marketingDataStore = {};
                updateMarketingOverviewStats({}); // Clear stats on error
                updateMarketingOverviewCharts({}); // Call with empty object on error
                updateCampaigns([]);
                updatePromoCodes([]);
                // Optionally, re-throw or throw a new error if this is critical for chart init
                throw new Error(data.error || 'Marketing data loading failed, charts may not initialize.');
            }
        } catch (error) {
            console.error('Error fetching marketing data:', error);
            marketingDataStore = {};
            updateMarketingOverviewStats({}); // Clear stats on error
            updateMarketingOverviewCharts({}); // Call with empty object on error
            updateCampaigns([]);
            updatePromoCodes([]);
            throw error; // Re-throw error to be caught by the caller in showSection
        }
    }

    function updateMarketingOverviewStats(overviewData) {
        // Removed //onsole.log('[DEBUG] updateMarketingOverviewStats called with:', overviewData);

        const budgetEl = document.querySelector('#marketing-section .overview-card:nth-child(1) .overview-data h3');
        // Removed //onsole.log('[DEBUG] budgetEl:', budgetEl);
        const budgetLabelEl = document.querySelector('#marketing-section .overview-card:nth-child(1) .overview-data p');
        const conversionEl = document.querySelector('#marketing-section .overview-card:nth-child(2) .overview-data h3');
        const conversionLabelEl = document.querySelector('#marketing-section .overview-card:nth-child(2) .overview-data p');
        const promosEl = document.querySelector('#marketing-section .overview-card:nth-child(3) .overview-data h3');
        const promosLabelEl = document.querySelector('#marketing-section .overview-card:nth-child(3) .overview-data p');
        const acquisitionEl = document.querySelector('#marketing-section .overview-card:nth-child(4) .overview-data h3');
        const acquisitionLabelEl = document.querySelector('#marketing-section .overview-card:nth-child(4) .overview-data p');

        if (overviewData && Object.keys(overviewData).length > 0) {
            // Removed //onsole.log('[DEBUG] Populating stats with data.');
            if (budgetEl) budgetEl.textContent = overviewData.budget?.monthly ? `$${parseFloat(overviewData.budget.monthly).toLocaleString()}` : '$0';
            if (budgetLabelEl) budgetLabelEl.textContent = 'Monthly Budget';
            
            if (conversionEl) conversionEl.textContent = overviewData.conversion_rate?.current ? `${overviewData.conversion_rate.current}%` : '0%';
            if (conversionLabelEl) conversionLabelEl.textContent = 'Conversion Rate';

            if (promosEl) promosEl.textContent = overviewData.active_promos?.count !== undefined ? overviewData.active_promos.count : '0';
            if (promosLabelEl) promosLabelEl.textContent = 'Active Promos';

            if (acquisitionEl) acquisitionEl.textContent = overviewData.customer_acquisition?.cost ? `$${parseFloat(overviewData.customer_acquisition.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
            if (acquisitionLabelEl) acquisitionLabelEl.textContent = 'Avg. Acquisition';
        } else {
            // Removed //onsole.log('[DEBUG] Clearing stats / overviewData is empty.');
            // Clear stats if data is empty or not available
            if (budgetEl) budgetEl.textContent = '$0';
            if (budgetLabelEl) budgetLabelEl.textContent = 'Monthly Budget';
            if (conversionEl) conversionEl.textContent = '0%';
            if (conversionLabelEl) conversionLabelEl.textContent = 'Conversion Rate';
            if (promosEl) promosEl.textContent = '0';
            if (promosLabelEl) promosLabelEl.textContent = 'Active Promos';
            if (acquisitionEl) acquisitionEl.textContent = '$0.00';
            if (acquisitionLabelEl) acquisitionLabelEl.textContent = 'Avg. Acquisition';
        }
    }

    // Update Campaigns List
    function updateCampaigns(campaigns) {
        if (!campaigns || !Array.isArray(campaigns)) {
            console.warn('No campaign data provided or invalid format');
            return;
        }

        console.log('upadateCampaigns working');
        try {
            const campaignList = document.querySelector('.campaign-list');
            if (!campaignList) return;

            campaignList.innerHTML = campaigns.map(campaign => `
                <div class="campaign-item">
                    <div class="campaign-status ${campaign.status}"></div>
                    <div class="campaign-details">
                        <h4>${campaign.name}</h4>
                        <div class="campaign-meta">
                            <span><i class="far fa-calendar-alt"></i> ${formatDateRange(campaign.start_date, campaign.end_date)}</span>
                            <span><i class="fas fa-tag"></i> ${campaign.description}</span>
                        </div>
                    </div>
                    <div class="campaign-progress">
                        <div class="progress-stat">
                            <div class="stat-label">Budget Used</div>
                            <div class="stat-value">$${campaign.budget_used} / $${campaign.budget}</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${(campaign.budget_used / campaign.budget * 100)}%"></div>
                            </div>
                        </div>
                        <div class="progress-stat">
                            <div class="stat-label">Conversions</div>
                            <div class="stat-value">${campaign.conversions_achieved} / ${campaign.conversion_goal}</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${(campaign.conversions_achieved / campaign.conversion_goal * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('') || '<div class="empty-state">No active campaigns</div>';
        } catch (error) {
            console.error('Error updating campaigns:', error);
        }
    }

    // Update Promo Codes Table
    function updatePromoCodes(promoCodes) {
        const promoTable = document.querySelector('.promo-code-table tbody');
        if (!promoTable) return;

        promoTable.innerHTML = promoCodes.map(promo => `
            <tr>
                <td><strong>${promo.code}</strong></td>
                <td>${promo.discount_type === 'percentage' ? promo.discount_value + '%' : '$' + promo.discount_value}</td>
                <td>${promo.current_uses}${promo.max_uses ? '/' + promo.max_uses : ''}</td>
                <td>${formatDate(promo.end_date) || 'No expiry'}</td>
                <td><span class="status-badge status-${promo.status}">${formatStatus(promo.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="Edit" onclick="editPromoCode(${promo.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="Toggle Status" onclick="togglePromoStatus(${promo.id})">
                            <i class="fas fa-toggle-${promo.status === 'active' ? 'on' : 'off'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update Reviews Section
    function updateReviews(reviews) {
        // Update summary stats
        const summaryEl = document.querySelector('.reviews-summary');
        if (summaryEl && reviews.summary) {
            const summary = reviews.summary;
            summaryEl.querySelector('.rating-number').textContent = summary.avg_rating.toFixed(1);
            summaryEl.querySelector('.rating-count').textContent = summary.total_reviews + ' reviews';

            // Update rating breakdown
            const breakdownBars = summaryEl.querySelectorAll('.rating-bar');
            if (breakdownBars.length === 5) {
                updateRatingBar(breakdownBars[0], summary.five_star, summary.total_reviews);
                updateRatingBar(breakdownBars[1], summary.four_star, summary.total_reviews);
                updateRatingBar(breakdownBars[2], summary.three_star, summary.total_reviews);
                updateRatingBar(breakdownBars[3], summary.two_star, summary.total_reviews);
                updateRatingBar(breakdownBars[4], summary.one_star, summary.total_reviews);
            }
        }

        // Update recent reviews
        const recentReviewsEl = document.querySelector('.recent-reviews');
        if (recentReviewsEl && reviews.recent) {
            recentReviewsEl.innerHTML = `
                <h3>Recent Reviews</h3>
                ${reviews.recent.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">${getInitials(review.reviewer_name)}</div>
                                <div>
                                    <div class="reviewer-name">${review.reviewer_name}</div>
                                    <div class="review-date">${formatTimeAgo(review.created_at)}</div>
                                </div>
                            </div>
                            <div class="review-rating">
                                ${generateStarRating(review.rating)}
                            </div>
                        </div>
                        <div class="review-content">
                            "${review.comment}"
                        </div>
                        <div class="review-actions">
                            <button class="btn-sm" onclick="respondToReview(${review.id})">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                        </div>
                    </div>
                `).join('')}
            `;
        }
    }

    // Update Social Links
    function updateSocialLinks(links) {
        const listingsContent = document.querySelector('#listings-content');
        if (!listingsContent) return;

        listingsContent.innerHTML = `
            <div class="social-links-grid">
                ${links.map(link => `
                    <a href="${link.url}" target="_blank" class="social-link-card">
                        <i class="${link.icon_class}"></i>
                        <span>${link.platform}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }

    // Update SEO Settings
    function updateSEOSettings(settings) {
        const keywordsContent = document.querySelector('#keywords-content');
        if (!keywordsContent) return;

        keywordsContent.innerHTML = `
            <div class="seo-settings">
                ${settings.map(setting => `
                    <div class="seo-page-card">
                        <h3>${setting.page_url}</h3>
                        <div class="seo-form">
                            <div class="form-group">
                                <label>Meta Title</label>
                                <input type="text" value="${setting.meta_title}" class="form-control" onchange="updateSEOSetting(${setting.id}, 'meta_title', this.value)">
                            </div>
                            <div class="form-group">
                                <label>Meta Description</label>
                                <textarea class="form-control" onchange="updateSEOSetting(${setting.id}, 'meta_description', this.value)">${setting.meta_description}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Keywords</label>
                                <textarea class="form-control" onchange="updateSEOSetting(${setting.id}, 'keywords', this.value)">${setting.keywords}</textarea>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Helper Functions
    function updateRatingBar(bar, count, total) {
        const percent = total > 0 ? (count / total) * 100 : 0;
        bar.querySelector('.progress').style.width = percent + '%';
        bar.querySelector('.rating-count').textContent = count;
    }

    function generateStarRating(rating) {
        return Array(5).fill(0).map((_, i) => 
            `<i class="fas fa-star${i < rating ? '' : '-o'}"></i>`
        ).join('');
    }

    function formatDateRange(start, end) {
        const startDate = new Date(start);
        const formattedStart = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        if (!end) return `From ${formattedStart}`;
        
        const endDate = new Date(end);
        const formattedEnd = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        return `${formattedStart} - ${formattedEnd}`;
    }

    function formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function formatTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown time';
        
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (isNaN(seconds)) return timestamp; // Return original if date is invalid

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (let [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }

        return 'Just now';
    }

    // Define loadTeamPerformance function here, before loadTeamSection uses it
    async function loadTeamPerformance() {
        //onsole.log('loadTeamPerformance function called');
        try {
            const response = await fetch('assets/php/get_team_performance.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.success) {
                if (data.overall) {
                     // updateTeamOverview(data.overall); // This was overwriting the correct overview data
                     updatePerformanceMetrics(data.overall);
                }
                if (data.professionals) {
                     updateProfessionalRatings(data.professionals);
                }
            } else {
                console.error('Error loading team performance data:', data.error || data.message || 'Unknown error');
                updateTeamOverview({}); // Reset overview
                updatePerformanceMetrics({}); // Reset charts
            }
        } catch (error) {
            console.error('Error fetching team performance:', error);
            updateTeamOverview({}); // Reset overview
            updatePerformanceMetrics({}); // Reset charts
        }
    }

    // Team Section Functions
    async function loadTeamSection() {
        //onsole.log("loadTeamSection function called");
        // Log the first job application *before* any processing, if available
        if (teamDataStore.job_applications && teamDataStore.job_applications.length > 0) {
            //console.log("[loadTeamSection - Pre-Fetch] Initial first job application object:", JSON.parse(JSON.stringify(teamDataStore.job_applications[0])));
        } else {
            //console.log("[loadTeamSection - Pre-Fetch] No job applications in teamDataStore initially.");
        }

        try {
            const teamData = await fetchWithErrorHandling('assets/php/get_team_data.php');
            //onsole.log('loadTeamSection: Raw teamData from PHP:', teamData);

            if (teamData && teamData.success) {
                teamDataStore = {
                    overview: teamData.overview || {},
                    team_members: teamData.team_members || [],
                    job_applications: teamData.job_applications || [],
                    team_schedule: teamData.team_schedule || [], // Ensure this is captured
                    performance_metrics: teamData.performance_metrics || {}
                };
                
                //console.log('loadTeamSection: teamDataStore.team_members:', JSON.parse(JSON.stringify(teamDataStore.team_members)));
                //console.log('loadTeamSection: teamDataStore.job_applications:', JSON.parse(JSON.stringify(teamDataStore.job_applications)));
                //console.log('loadTeamSection: teamDataStore.team_schedule (IMPORTANT!):', JSON.parse(JSON.stringify(teamDataStore.team_schedule)));
                //console.log('loadTeamSection: teamDataStore.overview:', JSON.parse(JSON.stringify(teamDataStore.overview)));

                if (teamData.overview) {
                    //console.log('Data being passed to updateTeamOverview:', teamData.overview);
                    //console.log('CHECKPOINT: typeof updateTeamOverview just before call:', typeof updateTeamOverview);
                    //console.log('CHECKPOINT: updateTeamOverview.toString() just before call:', updateTeamOverview.toString());
                    
                    updateTeamOverview(teamData.overview);
                }
                if (teamData.team_members) {
                    // Add this //onsole.log for debugging
                    //console.log('loadTeamSection: Inspecting teamData.team_members before calling updateTeamMembers:');
                    //console.log(teamData.team_members);
                        if (teamData.team_members.length > 0) {
                         //console.log('loadTeamSection: First member object in teamData.team_members:', teamData.team_members[0]);
                    }

                    //console.log("Updating team members with:", teamData.team_members);
                    updateTeamMembers(teamData.team_members);
                }
                if (teamData.job_applications) {
                    updateJobApplications(teamData.job_applications);
                }
                if (teamData.team_schedule) {
                    // updateTeamSchedule(teamData.team_schedule); // Initial render, might be filtered later
                    applyTeamScheduleFilters(); // Apply default (e.g., 'all' or 'month') filters on load
                }
                if (teamData.performance_metrics) {
                    updatePerformanceMetrics(teamData.performance_metrics);
                }

            } else {
                console.error('Error in team data response:', teamData ? teamData.message : 'No data received');
                // Display a user-friendly error message on the page if necessary
            }
        } catch (error) {
            console.error('Error in loadTeamSection:', error);
            // Display a user-friendly error message on the page
        }
        //console.log("teamDataStore after loadTeamSection:", JSON.parse(JSON.stringify(teamDataStore)));
    }

    // Function to update team overview section
    function updateTeamOverview(overview) {
        //onsole.log("updateTeamOverview: Received overview data:", JSON.stringify(overview));
        const data = overview || {}; 

        const elements = {
            activeTeam: document.querySelector('#team-section .dashboard-overview-cards .overview-card:nth-child(1) .overview-data h3'),
            pendingApps: document.querySelector('#team-section .dashboard-overview-cards .overview-card:nth-child(2) .overview-data h3'),
            avgRating: document.querySelector('#team-section .dashboard-overview-cards .overview-card:nth-child(3) .overview-data h3'),
            completionRate: document.querySelector('#team-section .dashboard-overview-cards .overview-card:nth-child(4) .overview-data h3')
        };
        //onsole.log("updateTeamOverview: Selected elements:", elements);

        if (elements.activeTeam) {
            const val = data.active_team !== undefined ? data.active_team : '0';
            //onsole.log(`updateTeamOverview: Setting activeTeam to: ${val}`);
            elements.activeTeam.textContent = val;
        } else {
            console.warn("updateTeamOverview: activeTeam element not found!");
        }

        if (elements.pendingApps) {
            const val = data.pending_applications !== undefined ? data.pending_applications : '0';
            //onsole.log(`updateTeamOverview: Setting pendingApps to: ${val}`);
            elements.pendingApps.textContent = val;
        } else {
            console.warn("updateTeamOverview: pendingApps element not found!");
        }

        if (elements.avgRating) {
            const val = formatRating(data.avg_rating);
            //onsole.log(`updateTeamOverview: Setting avgRating to: ${val}`);
            elements.avgRating.textContent = val; 
        } else {
            console.warn("updateTeamOverview: avgRating element not found!");
        }

        if (elements.completionRate) {
            const val = formatPercentage(data.completion_rate);
            //onsole.log(`updateTeamOverview: Setting completionRate to: ${val}`);
            elements.completionRate.textContent = val; 
        } else {
            console.warn("updateTeamOverview: completionRate element not found!");
        }

        // Keep the general check for debugging future selector issues
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`updateTeamOverview: Element for '${key}' (re-check) not found. Check selector and HTML structure within #team-section.`);
            }
        });
    }

    // Function to update performance metrics chart
    function updatePerformanceMetrics(data) {
        //onsole.log('updatePerformanceMetrics function called');
        const ctx = document.getElementById('performance-metrics-chart'); 
        if (!ctx || !ctx.getContext) return;

        const completionRate = data.completion_rate ?? 0;
        const onTimeRate = data.ontime_rate ?? 0;

        if (ctx._performanceChart) {
            ctx._performanceChart.destroy();
        }

        ctx._performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Completion Rate', 'On-time Rate'],
                datasets: [{
                    label: 'Performance Metrics',
                    data: [completionRate, onTimeRate],
                    backgroundColor: [
                        'rgba(79, 142, 53, 0.7)', 
                        'rgba(25, 118, 210, 0.7)' 
                    ],
                    borderColor: [
                        'rgba(79, 142, 53, 1)',
                        'rgba(25, 118, 210, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: { /* options */ }
        });
    }

    // Function to render team schedule
    function renderTeamSchedule(schedule) {
        const container = document.getElementById('team-schedule-list'); // CORRECTED SELECTOR
        if (!container) {
            console.warn("Team schedule list container (#team-schedule-list) not found."); // Updated warning
            return;
        }

        container.innerHTML = ''; // Clear loading message or previous content

        if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
            container.innerHTML = '<div class="empty-state">No schedule items to display for the selected filters.</div>'; // Specific message
            return;
        }

        // Group schedules by date
        const schedulesByDate = schedule.reduce((acc, item) => {
            // Ensure item.schedule_date or item.start_time exists and is a valid date string
            let dateStr = item.schedule_date;
            if (!dateStr && item.start_time) {
                dateStr = item.start_time.split('T')[0]; // Get YYYY-MM-DD from datetime string
            }
            if (!dateStr) {
                console.warn('[renderTeamSchedule] Item missing schedule_date/start_time:', item);
                return acc; // Skip items with no valid date
            }

            // Correctly parse the date to avoid timezone issues
            // dateStr is in 'YYYY-MM-DD' format
            const parts = dateStr.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
            const day = parseInt(parts[2], 10);
            
            // Create date object ensuring it's treated as local
            const localDate = new Date(year, month, day);
            
            const date = localDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        // Generate HTML for each date group
        const html = Object.entries(schedulesByDate).map(([date, items]) => `
            <div class="schedule-day">
                <h3 class="day-header">${date}</h3>
                <div class="schedule-items">
                    ${items.map(item => {
                        // Use schedule_date for display if start_time is not the primary date field for grouping
                        const displayStartTime = item.start_time ? formatTime(item.start_time.split('T')[1]?.substring(0, 5) || item.start_time.substring(0,5)) : 'N/A';
                        const displayEndTime = item.end_time ? formatTime(item.end_time.split('T')[1]?.substring(0, 5) || item.end_time.substring(0,5)) : 'N/A';
                        const memberName = item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : 'Unassigned';

                        return `
                        <div class="schedule-item ${item.status?.toLowerCase() || 'pending'}">
                            <div class="time-slot">
                                ${displayStartTime} - ${displayEndTime}
                            </div>
                            <div class="schedule-details">
                                <span class="team-member">${memberName}</span>
                                <span class="schedule-type">${item.service_name || item.schedule_type || 'N/A'}</span>
                                <span class="task-notes">${item.notes || ''}</span>
                            </div>
                            <div class="schedule-status">
                                <span class="status-badge status-${item.status?.toLowerCase() || 'pending'}">${formatStatus(item.status || 'pending')}</span>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="empty-state">No schedule items to display.</div>'; // Fallback if html is empty
    }

    // Helper function to format time
    function formatTime(timeStr) {
        if (!timeStr) return '';
        try {
            const [hours, minutes] = timeStr.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            console.error('Error formatting time:', e);
            return timeStr;
        }
    }

    // Add at the beginning of the file, after the initial event listeners

    // Utility function for handling fetch requests with error handling
    async function fetchWithErrorHandling(url, options = {}) {
        //console.log(`fetchWithErrorHandling: Attempting to fetch ${url}`);
        try {
            const response = await fetch(url, options);
            //console.log(`fetchWithErrorHandling: Received response for ${url}, Status: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`fetchWithErrorHandling: HTTP error for ${url}! Status: ${response.status}, Body: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }
            const data = await response.json();
            //console.log(`fetchWithErrorHandling: Successfully parsed JSON for ${url}:`, data);
            return data;
        } catch (error) {
            console.error(`fetchWithErrorHandling: Error fetching or parsing ${url}:`, error);
            throw error; // Re-throw to be caught by calling function
        }
    }

    // Add Service Modal Function
    function addService() {
        const modal = document.getElementById('add-service-modal');
        // if (!modal) {
        //     console.warn('Add service modal not found');
        //     return;
        // }
        const modalContent = document.querySelector('.modal-body');
        modalContent.innerHTML = ''
        modalContent.innerHTML = `<form id="add-service-form">
                    <div class="form-group">
                        <label for="service-name">Service Name:</label>
                        <input type="text" id="service-name" required>
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
                        <textarea id="service-description" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="service-price">Base Price:</label>
                        <div class="input-group">
                            <span class="input-prefix">$</span>
                            <input type="number" id="service-price" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="service-duration">Duration (minutes):</label>
                        <input type="number" id="service-duration" min="30" step="30" required>
                    </div>
                </form>`;
        // Reset form if exists
        // const form = modal.quers

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Add event listener for close button if not already added
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    }

    // Helper function to get initials from name
    function getInitials(name) {
        //onsole.log('getInitials function called');
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    }

    // Function to view team member profile
    function viewTeamMember(memberId) {
        // Show member profile modal or navigate to profile page
        showModal('member-profile-modal');
        loadMemberProfile(memberId);
    }

    // Function to show member options menu
    function showMemberOptions(memberId, 

        ) {
        // console.log('showMemberOptions function called');
        // Define menu options
        const options = [
            {
                label: 'Assign Task',
                action: `showAssignTaskForm(${memberId})`
            },
            {
                label: 'View Schedule',
                action: `viewTeamMemberSchedule(${memberId})`
            },
            {
                label: 'Performance Report',
                action: `viewPerformanceReport(${memberId})`
            },
            {
                label: 'Suspend Account',
                action: `suspendMember(${memberId})`
            }
        ];
        
        // Show context menu at click position
        showContextMenu(options, event || window.event);
    }

    // Initialize tooltips (if using a tooltip library)
    function initializeTooltips() {
        // Example using Bootstrap tooltips
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltips = document.querySelectorAll('[title]');
            tooltips.forEach(element => {
                new bootstrap.Tooltip(element);
            });
        }
    }

    function updateTeamSchedule(schedule) {
        const container = document.querySelector('.team-schedule-list');
        if (!container) {
            console.error("Team schedule container not found");
            return;
        }

        if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
            container.innerHTML = '<div class="empty-state">No schedules found</div>';
            return;
        }

        // Group schedules by date
        const schedulesByDate = schedule.reduce((acc, item) => {
            const date = new Date(item.schedule_date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        // Generate HTML for each date group
        const html = Object.entries(schedulesByDate).map(([date, items]) => `
            <div class="schedule-day">
                <h3 class="day-header">${date}</h3>
                <div class="schedule-items">
                    ${items.map(item => `
                        <div class="schedule-item ${item.status?.toLowerCase() || 'scheduled'}">
                            <div class="time-slot">
                                ${formatTime(item.start_time)} - ${formatTime(item.end_time)}
                            </div>
                <div class="schedule-details">
                                <span class="team-member">${item.first_name} ${item.last_name}</span>
                                <span class="schedule-type">${formatScheduleType(item.schedule_type)}</span>
                                ${item.service_name ? `<span class="service-name">${item.service_name}</span>` : ''}
                                ${item.notes ? `<span class="schedule-notes">${item.notes}</span>` : ''}
                </div>
                <div class="schedule-status">
                                <span class="status-badge status-${item.status?.toLowerCase() || 'scheduled'}">${formatScheduleStatus(item.status)}</span>
                            </div>
                        </div>
                    `).join('')}
            </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="empty-state">No schedules found</div>';
    }

    // Add missing helper functions
    function formatRole(role) {
        //onsole.log('formatRole function called');
        return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
    }

    function formatRating(rating) {
        return (rating ? parseFloat(rating).toFixed(1) : '0.0') + ' ⭐';
    }

    function formatPercentage(value) {
        return (value ? parseFloat(value).toFixed(1) : '0.0') + '%';
    }

    function getServiceColor(category) {
        const colors = {
            housekeeping: '#4F8E35',
            lawn_care: '#F9A825',
            pool_care: '#1976D2',
            default: '#666666'
        };
        return colors[category?.toLowerCase()] || colors.default;
    }

    // Add the missing updateJobApplications function
    function updateJobApplications(applications) {
        //onsole.log(`[updateJobApplications] Received ${applications ? applications.length : 'null/undefined'} applications to render.`);
        const container = document.querySelector('#team-section .applications-list');
        if (!container) {
            console.error("Job applications list container not found.");
            return;
        }

        container.innerHTML = ''; // Clear existing applications

        // If applications array is empty (either initially or after filtering), display the message set by the calling function or a generic one.
        // The primary "no results for filter" message is now handled in applyJobApplicationFiltersByPosition
        if (!applications || !Array.isArray(applications) || applications.length === 0) {
            // If container is empty and this function was called with an empty list,
            // it means applyJobApplicationFiltersByPosition might have already set a specific message.
            // Only set a generic "no applications" message if the container is truly empty and no specific filter message was set.
            if (container.innerHTML === '') { // Check if it wasn't already set by the caller
                container.innerHTML = '<div class="no-data">No job applications to display at the moment.</div>';
            }
            return;
        }

        container.innerHTML = applications.map(app => `
            <div class="application-item">
                <div class="application-info">
                    <h4>${app.applicant_name || 'Unknown Applicant'}</h4>
                    <div class="application-meta">
                        <span><i class="fas fa-briefcase"></i> Role: ${app.position_applied_for || 'N/A'} ${app.role_type === 'professional' && app.specialization ? `(${app.specialization})` : app.role_type === 'manager' && app.industry_sector ? `(${app.industry_sector})` : ''}</span>
                        <span><i class="fas fa-cogs"></i> Experience: ${app.experience || 'N/A'}</span>
                        <span><i class="fas fa-calendar-alt"></i> Applied: ${formatDate(app.application_date || new Date())}</span>
                    </div>
                </div>
                <div class="application-actions">
                    <span class="status-badge status-${app.status || 'pending'}">${formatStatus(app.status || 'pending')}</span>
                    <button class="btn-icon" title="View Application" onclick="viewApplication(${app.id})"><i class="fas fa-eye"></i></button>
                </div>
            </div>
        `).join('');
    }

    // Update initialization functions to remove section checks (they are now called by showSection)
    function initMarketingCharts() {
        try {
            // Conversion rates chart
            const conversionRatesCtx = document.getElementById('conversion-rates-chart');
            if (conversionRatesCtx && conversionRatesCtx.getContext) {
                // Chart creation logic...
                new Chart(conversionRatesCtx, {
                    type: 'line',
            data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                            label: 'Email',
                            data: [0, 0, 0, 0, 0, 0],
                            borderColor: '#4F8E35',
                            tension: 0.4,
                            pointRadius: 4
                        }]
                    },
                    options: { /* options */ }
                });
            }

            // Campaign performance chart
            const campaignPerformanceCtx = document.getElementById('campaign-performance-chart');
            if (campaignPerformanceCtx && campaignPerformanceCtx.getContext) {
                // Chart creation logic...
                new Chart(campaignPerformanceCtx, {
                    type: 'bar',
            data: {
                        labels: [],
                datasets: [{
                            label: 'Performance',
                            data: [],
                            backgroundColor: '#4F8E35',
                            borderRadius: 5
                        }]
                    },
                    options: { /* options */ }
                });
            }
        } catch (error) {
            console.error('Error initializing marketing charts:', error);
        }
    }

    // Function to update professional ratings (placeholder - adapt based on where ratings are displayed)
    function updateProfessionalRatings(professionals) {
        //onsole.log('Updating professional ratings:', professionals);
        // Example: If ratings are shown in the team member cards:
        professionals.forEach(pro => {
            const card = document.querySelector(`#team-members-list .team-member-card[data-member-id="${pro.id}"]`); // Assuming cards have data-member-id
            if (card) {
                const ratingElement = card.querySelector('.member-stats .stat:first-child .value'); // Adjust selector as needed
                if (ratingElement) {
                    ratingElement.textContent = formatRating(pro.avg_rating); 
                }
            }
        });
        // Add logic here if ratings are displayed elsewhere (e.g., a separate table)
    }

    function viewMemberDetails(memberId) {
        // Fetch member details
        fetch(`assets/php/get_team_member.php?id=${memberId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update modal content
                    const modal = document.getElementById('member-actions-modal');
                    const detailsContainer = modal.querySelector('.member-details');
                    if (detailsContainer) {
                        detailsContainer.innerHTML = `
                            <h3>${data.member.name}</h3>
                            <p><strong>Role:</strong> ${data.member.role}</p>
                            <p><strong>Email:</strong> ${data.member.email}</p>
                            <p><strong>Phone:</strong> ${data.member.phone}</p>
                        `;
                    }
                    showModal('member-actions-modal');
                } else {
                    showNotification('Failed to load member details', 'error');
                }
            })
            .catch(error => {
                console.error('Error loading member details:', error);
                showNotification('Error loading member details', 'error');
            });
    }

    // Function to show assign task form
    async function showAssignTaskForm(memberId) {
        if (!memberId) {
            showNotification('Member ID is required', 'error');
            return;
        }

                const modal = document.getElementById('assign-task-modal');
        if (!modal) {
            console.error('Assign task modal not found');
            showNotification('Error: Modal not found', 'error');
            return;
        }

        try {
            // Show loading state
            modal.querySelector('.modal-body').innerHTML = '<div class="loading-state">Loading task details...</div>';
            showModal('assign-task-modal');

            // Fetch member details and available tasks in parallel
            const [memberResponse, tasksResponse] = await Promise.all([
                fetch(`assets/php/get_team_member.php?id=${memberId}`),
                fetch('assets/php/get_available_tasks.php')
            ]);

            if (!memberResponse.ok || !tasksResponse.ok) {
                throw new Error('Failed to fetch required data');
            }

            const [memberData, tasksData] = await Promise.all([
                memberResponse.json(),
                tasksResponse.json()
            ]);

            if (!memberData.success) {
                throw new Error(memberData.error || 'Failed to load member details');
            }

            if (!tasksData.success) {
                throw new Error(tasksData.error || 'Failed to load available tasks');
            }

            // Update modal content
            modal.querySelector('.modal-body').innerHTML = `
                <form id="assign-task-form">
                    <input type="hidden" id="task-member-id" name="member_id" value="${memberId}">
                    
                    <div class="form-group">
                        <label for="task-template">Task Template</label>
                        <select id="task-template" name="template_id" required>
                            <option value="">Select a template</option>
                            ${tasksData.templates.map(template => `
                                <option value="${template.id}">
                                    ${template.name} (${template.task_count} tasks, ${template.estimated_time} mins)
                                </option>
                            `).join('')}
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
            `;

            // Set minimum date to today for due date input
            const dueDateInput = document.getElementById('task-due-date');
            const today = new Date();
            today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
            dueDateInput.min = today.toISOString().slice(0, 16);

            // Add form submission handler
            const saveBtn = modal.querySelector('.save-task-btn');
            if (saveBtn) {
                saveBtn.onclick = async (e) => {
                    e.preventDefault();
                    const form = document.getElementById('assign-task-form');
                    if (form) {
                        try {
                            const formData = new FormData(form);
                            const response = await fetch('assets/php/assign_task.php', {
                                method: 'POST',
                                body: formData
                            });

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const result = await response.json();
                            if (result.success) {
                                showNotification('Task assigned successfully');
                                hideModal('assign-task-modal');
                                // Refresh member tasks if needed
                                if (typeof loadMemberTasks === 'function') {
                                    loadMemberTasks(memberId);
                                }
            } else {
                                throw new Error(result.error || 'Failed to assign task');
                            }
                        } catch (error) {
                            console.error('Error assigning task:', error);
                            showNotification('Error assigning task', 'error');
            }
                    }
                };
            }

        } catch (error) {
            console.error('Error preparing task assignment:', error);
            showNotification('Error preparing task assignment', 'error');
            modal.querySelector('.modal-body').innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading task assignment form. Please try again.</p>
                </div>
            `;
        }
    }

    // Function to submit task assignment
    async function submitTaskAssignment(form) {
        try {
            const formData = new FormData(form);
            const response = await fetch('assets/php/assign_task.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                hideModal('assign-task-modal');
                showNotification('Task assigned successfully');
                // Refresh the team member's tasks if needed
                // loadMemberTasks(formData.get('member_id'));
            } else {
                throw new Error(data.error || 'Failed to assign task');
            }
        } catch (error) {
            console.error('Error assigning task:', error);
            showNotification('Error assigning task', 'error');
        }
    }

    // New function to fetch appointment details by ID and then populate/show the modal
    async function fetchAppointmentDetailsAndShowModal(appointmentId) {
        //onsole.log(`fetchAppointmentDetailsAndShowModal: Fetching details for appointment ID: ${appointmentId}`);
        if (!appointmentId) {
            console.error('fetchAppointmentDetailsAndShowModal: appointmentId is undefined or null');
            showNotification('Cannot load details: Appointment ID is missing.', 'error');
            return;
        }
        try {
            // Construct the URL for fetching appointment details
            // Ensure your PHP script `admin_appointments.php` with action=details expects an `id` parameter
            const response = await fetch(`assets/php/admin_appointments.php?action=details&id=${appointmentId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const appointmentData = await response.json();

            if (appointmentData.error) {
                console.error('Error fetching appointment details from API:', appointmentData.error);
                showNotification(appointmentData.error, 'error');
                return;
            }
            
            // The PHP now returns the appointment directly, not nested under a property like `appointmentData.appointment`
            populateAndShowAppointmentDetailsModal(appointmentData); 

        } catch (error) {
            console.error('Error in fetchAppointmentDetailsAndShowModal:', error);
            showNotification('Failed to load appointment details. Please try again.', 'error');
        }
    }

    // Helper function to format schedule type
    function formatScheduleType(type) {
        if (!type) return 'Regular';
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Helper function to format schedule status
    function formatScheduleStatus(status) {
        if (!status) return 'Scheduled';
        return status.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Settings Section Functions
    async function loadServicesList() {
        const container = document.querySelector('#settings-section .services-list');
        if (!container) {
            console.error("Services list container (.services-list within #settings-section) not found.");
            return;
        }
        container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading services...</div>';

        try {
            const response = await fetch('assets/php/get_services.php');
            const data = await response.json();
            
            // Log the response to help debug
            // console.log('Services API response:', data);

            // Check if we have valid data structure
            if (!data.success) {
                console.error('API returned error:', data.error || 'Unknown error');
                container.innerHTML = '<div class="empty-state">Error loading services</div>';
                return;
            }

            // Get the services array from the response
            const services = data.services || [];
            
            if (services.length === 0) {
                container.innerHTML = '<div class="empty-state">No services found</div>';
                return;
            }

            // Group services by category
            const groupedServices = services.reduce((acc, service) => {
                if (!acc[service.category]) {
                    acc[service.category] = [];
                }
                acc[service.category].push(service);
                return acc;
            }, {});

            // console.log(groupedServices)
            container.innerHTML = '';
            let categoryDelay = 0;

            // Create sections for each category
            Object.entries(groupedServices).forEach(([category, categoryServices]) => {
                const categorySection = document.createElement('div');
                categorySection.className = 'service-category';
                categorySection.style.opacity = '0';
                categorySection.style.transform = 'translateY(20px)';
                
                // Create category header
                const categoryHeader = document.createElement('h2');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = category;//it not a string
                categorySection.appendChild(categoryHeader);

                // Create services container for this category
                const servicesContainer = document.createElement('div');
                servicesContainer.className = 'category-services';

                // Add services to this category
                categoryServices.forEach((service, index) => {
                    const serviceItem = document.createElement('div');
                    serviceItem.className = 'service-item';
                    serviceItem.style.opacity = '0';
                    serviceItem.style.transform = 'translateY(20px)';
                    
                   serviceItem.innerHTML = `
                    <div class="service-info relative">
                        <div class="service-icon mt-8">
                            <i class="fas ${service.icon || 'fa-concierge-bell'}"></i>
                        </div>
                        <div class="service-details">
                            <h3>${service.name}</h3>
                            <p>${service.description || 'No description available'}</p>
                            <div class="service-meta">
                                <span><i class="fas fa-clock"></i> ${service.duration || 0} mins</span>
                                <span><i class="fas fa-dollar-sign"></i> ${parseFloat(service.base_price).toFixed(2)}</span>
                            </div>
                            <div class='service-meta'>
                                <span>
                                    <button class="btn-icon" title="Edit Service" onclick="editService(${service.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </span>
                                <span>
                                    <button class="btn-icon" title="Delete Service" onclick="deleteService(${service.id})">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                `;

                    servicesContainer.appendChild(serviceItem);
                    
                    // Animate each service item with a delay
                    setTimeout(() => {
                        serviceItem.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        serviceItem.style.opacity = '1';
                        serviceItem.style.transform = 'translateY(0)';
                    }, categoryDelay + (index * 100));
                });

                categorySection.appendChild(servicesContainer);
                container.appendChild(categorySection);
                
                // Animate category section
                setTimeout(() => {
                    categorySection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    categorySection.style.opacity = '1';
                    categorySection.style.transform = 'translateY(0)';
                }, categoryDelay);

                categoryDelay += 200; // Increment delay for next category
            });
            
        } catch (error) {
            console.error('Error loading services:', error);
            if (container) {
                container.innerHTML = '<div class="empty-state">Error loading services</div>';
            }
        }
    }

    // Enhanced loadTaskTemplatesList function with animations
    async function loadTaskTemplatesList() {
        try {
            const templatesList = document.querySelector('#settings-section .task-templates-list');
            if (!templatesList) {
                console.error('Task templates list container not found');
                return;
            }

            // First try to fetch dynamic templates
            const response = await fetch('assets/php/get_task_templates.php');
            const data = await response.json();
            
            // Add detailed logging of the response
            console.log('Task Templates API full response:', {
                rawData: data,
                hasSuccess: 'success' in data,
                hasTemplates: 'templates' in data,
                templatesType: data.templates ? typeof data.templates : 'undefined',
                isArray: data.templates ? Array.isArray(data.templates) : false,
                length: data.templates && Array.isArray(data.templates) ? data.templates.length : 0
            });

            // If API call fails or returns no data, keep the static content
            if (!data.success || !data.templates || !Array.isArray(data.templates) || data.templates.length === 0) {
                console.log('No dynamic templates found, keeping static content. Reason:', {
                     noSuccess: !data.success,
                     noTemplates: !data.templates,
                     notArray: !Array.isArray(data.templates),
                     emptyArray: data.templates && Array.isArray(data.templates) && data.templates.length === 0
                 });
                return; // Keep existing static content
            }

            // Group templates by category
            const groupedTemplates = data.templates.reduce((acc, template) => {
                if (!acc[template.category]) {
                    acc[template.category] = [];
                }
                acc[template.category].push(template);
                return acc;
            }, {});

            templatesList.innerHTML = '';
            let categoryDelay = 0;

            Object.entries(groupedTemplates).forEach(([category, templates]) => {
                const categorySection = document.createElement('div');
                categorySection.className = 'template-category';
                categorySection.style.opacity = '0';
                categorySection.style.transform = 'translateY(20px)';
                
                categorySection.innerHTML = `
                    <h3>${formatCategory(category)}</h3>
                    <div class="template-items">
                        ${templates.map(template => `
                            <div class="template-item">
                                <div class="template-content">
                                    <h4>${template.name}</h4>
                                    <ul class="task-checklist">
                                        ${template.tasks.map(task => `
                                            <li>${task.name}${task.required ? ' *' : ''}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                                <div class="template-actions">
                                    <button class="btn-icon" title="Edit Template" onclick="editTemplate(${template.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" title="Delete Template" onclick="deleteTemplate(${template.id})">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                templatesList.appendChild(categorySection);
                
                // Animate category section
                setTimeout(() => {
                    categorySection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    categorySection.style.opacity = '1';
                    categorySection.style.transform = 'translateY(0)';
                    
                    // Animate template items within the category
                    const templateItems = categorySection.querySelectorAll('.template-item');
                    templateItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }, categoryDelay);
                
                categoryDelay += 200;
            });

        } catch (error) {
            console.error('Error loading task templates:', error);
            // Don't clear existing content on error
            console.log('Keeping static content due to error');
        }
    }

    // Helper function to format category names
    function formatCategory(category) {
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Add hover effects for service and template items
    document.addEventListener('DOMContentLoaded', () => {
        // Add mousemove effect for service icons
        document.addEventListener('mousemove', (e) => {
            const icons = document.querySelectorAll('.service-icon');
            icons.forEach(icon => {
                const rect = icon.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                icon.style.transform = `
                    rotate(-5deg)
                    perspective(1000px)
                    rotateY(${(x - rect.width / 2) / 20}deg)
                    rotateX(${-(y - rect.height / 2) / 20}deg)
                `;
            });
        });
        
        // Reset icon transform on mouseout
        document.addEventListener('mouseleave', () => {
            const icons = document.querySelectorAll('.service-icon');
            icons.forEach(icon => {
                icon.style.transform = 'rotate(-5deg)';
            });
        });
    });

    // Function to load member profile
    async function loadMemberProfile(memberId) {
        const profileContent = document.querySelector('#member-profile-modal .member-profile-content');
        if (!profileContent) {
            console.error('Member profile content container not found');
            return;
        }

        // Show loading state
        profileContent.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading member profile...</p>
            </div>
        `;

        try {
            const response = await fetch(`assets/php/get_team_member.php?id=${memberId}&action=profile`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load profile');
            }

            const member = data.member;
            
            // Update modal content with member data
            profileContent.innerHTML = `
                <div class="profile-header">
                    <div class="profile-avatar">${getInitials(member.name)}</div>
                    <div class="profile-info">
                        <h3>${member.name}</h3>
                        <p class="role">${formatRole(member.role)} - ${member.specialization || 'General'}</p>
                    </div>
                </div>
                <div class="profile-details">
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${member.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Phone:</span>
                        <span class="value">${member.phone || 'Not provided'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Experience:</span>
                        <span class="value">${member.experience || 'Not specified'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Join Date:</span>
                        <span class="value">${formatDate(member.join_date)}</span>
                    </div>
                </div>
                <div class="performance-metrics">
                    <h4>Performance Metrics</h4>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-value">${member.completed_services}</span>
                            <span class="metric-label">Services Completed</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value">${member.rating.toFixed(1)}⭐</span>
                            <span class="metric-label">Average Rating</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value">${member.on_time_rate}%</span>
                            <span class="metric-label">On-Time Rate</span>
                        </div>
                    </div>
                </div>
                ${member.recent_services && member.recent_services.length > 0 ? `
                    <div class="recent-services">
                        <h4>Recent Services</h4>
                        <div class="services-list">
                            ${member.recent_services.map(service => `
                                <div class="service-item">
                                    <div class="service-header">
                                        <span class="service-name">${service.service_name}</span>
                                        <span class="service-date">${formatDate(service.date)}</span>
                                    </div>
                                    <div class="service-details">
                                        <span class="status-badge status-${service.status.toLowerCase()}">${formatStatus(service.status)}</span>
                                        ${service.rating ? `<span class="rating">${service.rating.toFixed(1)}⭐</span>` : ''}
                                    </div>
                                    ${service.feedback ? `
                                        <div class="service-feedback">
                                            <i class="fas fa-quote-left"></i>
                                            <p>${service.feedback}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;

        } catch (error) {
            console.error('Error loading member profile:', error);
            profileContent.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading profile. Please try again.</p>
                    <button class="btn-retry" onclick="loadMemberProfile(${memberId})">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    // Function to show context menu
    function showContextMenu(options, event) {
        // Example implementation
        const menu = document.getElementById('custom-context-menu');
        const menuList = menu.querySelector('ul');

        menuList.innerHTML = ''; // Clear previous items

        options.forEach(option => {
            const li = document.createElement('li');
            li.textContent = option.label;
            li.onclick = () => {
                menu.style.display = 'none';
                eval(option.action); // ⚠️ Use safer execution if possible
            };
            menuList.appendChild(li);
        });

        // Position the menu
        menu.style.top = event.pageY + 'px';
        menu.style.left = event.pageX + 'px';
        menu.style.display = 'block';
    }

    //  document.addEventListener('click', (e) => {
    //     const menu = document.getElementById('custom-context-menu');
    //     if (menu && !menu.contains(e.target)) {
    //         menu.style.display = 'none';
    //     }
    // });

    // function showContextMenu(options, event) {
    //     // Remove any existing context menus
    //     const existingMenu = document.querySelector('.context-menu');
    //     if (existingMenu) {
    //         existingMenu.remove();
    //     }

    //     // Create context menu
    //     const menu = document.createElement('div');
    //     menu.className = 'context-menu';
    //     console.log('show context menu');

    //     // Add menu items
    //     menu.innerHTML = options.map(option => `
    //         <div class="menu-item">
    //             <button onclick="handleContextMenuAction('${option.action}')">${option.label}</button>
    //         </div>
    //     `).join('');

    //     // Position menu near the clicked element
    //     const rect = event.target.getBoundingClientRect();
    //     menu.style.top = `${rect.bottom + window.scrollY}px`;
    //     menu.style.left = `${rect.left + window.scrollX}px`;

    //     // Add menu to document
    //     document.body.appendChild(menu);

    //     // Close menu when clicking outside
    //     document.addEventListener('click', function closeMenu(e) {
    //         if (!menu.contains(e.target) && e.target !== event.target) {
    //             menu.remove();
    //             document.removeEventListener('click', closeMenu);
    //         }
    //     });
    // }

    // Function to handle context menu actions
    function handleContextMenuAction(action) {
        if (typeof action === 'function') {
            action();
        } else if (typeof action === 'string') {
            // Execute the function string if it exists in the global scope
            const fn = window[action];
            if (typeof fn === 'function') {
                fn();
            }
        }
    }

    // ... existing code ...

    // Function to edit team member
    async function editTeamMember(memberId) {
        //onsole.log('editTeamMember function called');
        try {
            const response = await fetch(`assets/php/get_team_member.php?id=${memberId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load member data');
            }

            const member = data.member;
            
            // Populate form fields
            document.getElementById('edit-member-id').value = member.id;
            document.getElementById('edit-first-name').value = member.name.split(' ')[0] || '';
            document.getElementById('edit-last-name').value = member.name.split(' ')[1] || '';
            document.getElementById('edit-email').value = member.email;
            document.getElementById('edit-phone').value = member.phone;
            document.getElementById('edit-specialization').value = member.specialization || 'housekeeping';
            document.getElementById('edit-experience').value = member.experience || '';
            document.getElementById('edit-status').value = member.status || 'active';

            // Show the modal
            showModal('edit-member-modal');

            // Add form submission handler
            const form = document.getElementById('edit-member-form');
            const saveBtn = document.querySelector('#edit-member-modal .save-member-btn');
            
            // Remove any existing event listener
            saveBtn.onclick = null;
            
            // Add new event listener
            saveBtn.onclick = async (e) => {
                e.preventDefault();
                await saveMemberChanges(form);
            };

        } catch (error) {
            console.error('Error loading member data:', error);
            showNotification('Error loading member data', 'error');
        }
    }

    // Function to save member changes
    async function saveMemberChanges(form) {
        try {
            const formData = new FormData(form);
            const response = await fetch('assets/php/update_team_member.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                hideModal('edit-member-modal');
                showNotification('Member updated successfully');
                // Refresh the team members list
                loadTeamSection();
            } else {
                throw new Error(data.error || 'Failed to update member');
            }
        } catch (error) {
            console.error('Error saving member changes:', error);
            showNotification('Error saving changes', 'error');
        }
    }

    // Function to edit member schedule
    function editMemberSchedule(memberId) {
        // Implementation will be added later
        //onsole.log('Editing schedule for member:', memberId);
        showNotification('Schedule editing will be available soon');
    }

    // Function to manage availability
    function manageAvailability(memberId) {
        // Implementation will be added later
        //onsole.log('Managing availability for member:', memberId);
        showNotification('Availability management will be available soon');
    }

    // Function to confirm account suspension
    function confirmSuspendAccount(memberId) {
        if (confirm('Are you sure you want to suspend this team member\'s account?')) {
            suspendMember(memberId);
        }
    }

    // Function to suspend member account
    async function suspendMember(memberId) {
        try {
            const response = await fetch('assets/php/update_team_member.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    member_id: memberId,
                    action: 'suspend'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification('Member account suspended');
                loadTeamSection();
            } else {
                throw new Error(data.error || 'Failed to suspend account');
            }
        } catch (error) {
            console.error('Error suspending account:', error);
            showNotification('Error suspending account', 'error');
        }
    }

    // ... existing code ...

    // Application Actions Functions
    async function viewApplicationDetails(applicationId) {
        //onsole.log('viewApplicationDetails function called for ID:', applicationId);
        if (!applicationId) {
            console.error('Application ID is required');
            return;
        }

        const modal = $('#application-actions-modal'); // Use jQuery selector
        const modalMainContainer = modal.find('.modal-content');

        if (!modalMainContainer.length) {
            console.error('Application actions modal content container not found');
            showNotification('Error: Modal container not found', 'error');
            return;
        }
        
        modalMainContainer.html('<div style="padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading application details...</p></div>');
        showModal('application-actions-modal');
        
        try {
            const response = await fetch(`assets/php/get_application.php?id=${applicationId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.success && data.application) {
                const app = data.application;
                let fullModalHtml = '';

                // Header
                fullModalHtml += `
                    <div class="service-modal-header">
                        <h3>Job Application: ${app.fullname} (${app.position})</h3>
                        <button class="service-modal-close modal-close" aria-label="Close modal">&times;</button>
                    </div>`;

                // Body
                fullModalHtml += `
                    <div class="service-modal-body">
                        <div class="service-modal-section">
                            <h4><i class="fas fa-user-tie"></i> Applicant Information</h4>
                            <div class="service-modal-info">
                                <p><i class="fas fa-user"></i> <strong>Name:</strong> ${app.fullname}</p>
                                <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${app.email}</p>
                                <p><i class="fas fa-phone"></i> <strong>Phone:</strong> ${app.phone || 'N/A'}</p>
                                <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${app.location || 'Not specified'}</p>
                                <p><i class="fas fa-briefcase"></i> <strong>Applying for:</strong> ${app.position}</p>
                                <p><i class="fas fa-cogs"></i> <strong>Specialization:</strong> ${app.specialization || 'N/A'}</p>
                                <p><i class="fas fa-star"></i> <strong>Experience:</strong> ${app.experience_details || 'N/A'}</p>
                        </div>
                                            </div>
                        <div class="service-modal-section">
                            <h4><i class="fas fa-file-alt"></i> Message/Cover Letter</h4>
                            <p class="application-message">${app.message ? app.message.replace(/\\n/g, '<br>') : 'No message provided.'}</p>
                                                </div>
                        <div class="service-modal-section">
                            <h4><i class="fas fa-tasks"></i> Application Status & Details</h4>
                            <div class="service-modal-info">
                                <p><i class="fas fa-calendar-alt"></i> <strong>Applied:</strong> ${formatDate(app.application_date)}</p>
                                <p><i class="fas fa-info-circle"></i> <strong>Status:</strong> <span class="status-badge status-${app.status}">${formatStatus(app.status)}</span></p>
                                        </div>
                        </div>`;

                // Application Results Section
                if (app.application_results) {
                    const results = app.application_results;
                    fullModalHtml += `
                        <div class="service-modal-section">
                            <h4><i class="fas fa-clipboard-check"></i> Application Assessment</h4>
                            <div class="service-modal-info">
                                <p><i class="fas fa-thumbtack"></i> <strong>PIN:</strong> ${results.pin || 'N/A'}</p>
                                <p><i class="fas fa-question-circle"></i> <strong>Questionnaire:</strong> ${results.questionnaire || 'N/A'}</p>
                                <p><i class="fas fa-comments"></i> <strong>Behavioral:</strong> ${results.behavior || 'N/A'}</p>
                                <p><i class="fas fa-tasks"></i> <strong>Assessment:</strong> ${results.assessment || 'N/A'}</p>
                </div>
                            <h4><i class="fas fa-sticky-note"></i> Assessment Notes</h4>
                            <p class="application-notes">${results.notes ? results.notes.replace(/\\n/g, '<br>') : 'No assessment notes.'}</p>
                        </div>`;
            } else {
                    fullModalHtml += `
                        <div class="service-modal-section">
                            <h4><i class="fas fa-clipboard-check"></i> Application Assessment</h4>
                            <p>No assessment data found for this application.</p>
                        </div>`;
                }

                fullModalHtml += `</div>`; // Close service-modal-body

                // Footer with action buttons
                fullModalHtml += `
                    <div class="service-modal-footer">
                        <button type="button" class="btn-secondary modal-close">Close</button>
                        <button type="button" class="btn-primary review-btn"><i class="fas fa-check-circle"></i> Mark as Reviewed</button>
                        <button type="button" class="btn-info schedule-interview-btn"><i class="fas fa-calendar-plus"></i> Schedule Interview</button>
                        <button type="button" class="btn-success send-offer-btn"><i class="fas fa-paper-plane"></i> Send Offer</button>
                        <button type="button" class="btn-danger reject-btn"><i class="fas fa-times-circle"></i> Reject Application</button>
                    </div>`;
                
                modalMainContainer.html(fullModalHtml);

                // Add event listeners for new buttons
                modalMainContainer.find('.modal-close').click(() => hideModal('application-actions-modal'));
                modalMainContainer.find('.review-btn').click(() => updateApplicationStatus(applicationId, 'reviewed')); // Placeholder
                modalMainContainer.find('.schedule-interview-btn').click(() => scheduleInterview(applicationId)); // Placeholder
                modalMainContainer.find('.send-offer-btn').click(() => sendOffer(applicationId)); // Placeholder
                modalMainContainer.find('.reject-btn').click(() => rejectApplication(applicationId)); // Placeholder

            } else {
                throw new Error(data.error || 'Failed to load application details or application data missing.');
            }
        } catch (error) {
            console.error('Error loading application details:', error);
            modalMainContainer.html(`
                <div class="service-modal-header">
                    <h3>Error</h3>
                    <button class="service-modal-close modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="service-modal-body">
                    <div class="error-state" style="padding: 20px; text-align: center;">
                        <i class="fas fa-exclamation-circle fa-3x" style="color: #dc3545; margin-bottom: 15px;"></i>
                        <p>Error loading application details. Please try again.</p>
                        <p style="font-size: 0.8em; color: #6c757d;">${error.message}</p>
                </div>
                </div>
                <div class="service-modal-footer">
                    <button type="button" class="btn-secondary modal-close">Close</button>
                </div>
            `);
            modalMainContainer.find('.modal-close').click(() => hideModal('application-actions-modal'));
            showNotification('Error loading application details', 'error');
        }
    }

    // REMOVE setupApplicationActionButtons function as it's now integrated

    // Ticket Actions Functions
    // ... existing code ...

    // ... existing code ...

    // Sidebar Toggle
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active'); // Changed 'collapsed' to 'active'
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth <= 768) { // Or your mobile breakpoint
            // Check if sidebar is active (not collapsed) before trying to close
            if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active'); // Changed to remove 'active'
            }
        }
    });

    // Initialize charts for CRM section
    // ... existing code ...

    // Function to dynamically update the position/specialization filter options
    function updatePositionFilterOptions(selectedRoleType) {
        const positionFilterSelect = document.getElementById('position-filter');
        if (!positionFilterSelect) return;

        // Store current value to try and reselect it if possible
        const previousValue = positionFilterSelect.value;
        positionFilterSelect.innerHTML = ''; // Clear existing options

        let options = '<option value="all">All Specializations</option>';

        if (selectedRoleType === 'professional') {
            options += '<option value="housekeeping">Housekeeping</option>';
            options += '<option value="lawn_care">Lawn Care</option>';
            options += '<option value="pool_care">Pool Service</option>';
            positionFilterSelect.innerHTML = options;
        } else if (selectedRoleType === 'manager') {
            options = '<option value="all">All Sectors</option>'; // Changed from "All Specializations"
            options += '<option value="home_services">Home Services</option>';
            options += '<option value="hospitality">Hospitality</option>';
            options += '<option value="retail">Retail</option>';
            options += '<option value="customer_service">Customer Service</option>';
            options += '<option value="other">Other</option>';
            positionFilterSelect.innerHTML = options;
        } else { // Default for 'all' roles or if no specific role type matches
            options += '<option value="housekeeping">Housekeeping</option>';
            options += '<option value="lawn_care">Lawn Care</option>';
            options += '<option value="pool_care">Pool Service</option>';
            positionFilterSelect.innerHTML = options;
        }
        
        // Try to reselect the previous value if it still exists, otherwise set to 'all'
        if (Array.from(positionFilterSelect.options).some(opt => opt.value === previousValue)) {
            positionFilterSelect.value = previousValue;
        } else {
            positionFilterSelect.value = 'all';
        }
    }

    // ... existing code ...

    // Helper function to format date and time
    function formatJSDateTime(date) {
        if (!date || !(date instanceof Date)) {
            return 'Invalid Date';
        }
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    // Helper function to get initials from a name
    function getJSInitials(name) {
        if (!name || typeof name !== 'string') return 'N/A';
        const parts = name.split(' ');
        const initials = parts.map(part => part.charAt(0).toUpperCase()).join('');
        return initials || 'N/A';
    }

    // ... existing code ...

    // Function to open the appointment details modal
    function openAppointmentDetailsModal(appointmentId, isAssignMode = false) {
        //onsole.log(`openAppointmentDetailsModal called for ID: ${appointmentId}, Assign Mode: ${isAssignMode}`);
        const modal = $('#appointment-details-modal');
        const modalMainContainer = modal.find('.modal-content'); // Changed selector

        modalMainContainer.html('<div style="padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading...</p></div>'); // Simplified initial loading message
        showModal('appointment-details-modal');
        //onsole.log('showModal(\'appointment-details-modal\') called.');

        $.ajax({
            url: 'assets/php/get_appointments.php',
            method: 'GET',
            data: { appointment_id: appointmentId },
            dataType: 'json',
            success: function(response) {
                //onsole.log('AJAX success. Response:', response);
                if (response.success && response.appointment) {
                    const appointment = response.appointment;
                    //onsole.log('Appointment data received:', appointment);

                    let fullModalHtml = '<span class="close modal-close">&times;</span>'; // Main close button

                    if (isAssignMode) {
                        //onsole.log('Setting up for Assign Mode');
                        const serviceName = appointment.service_name || 'N/A';
                        let serviceDateTime = 'Date/Time N/A';
                        if (appointment.service_date && appointment.service_time) {
                            serviceDateTime = formatJSDateTime(new Date(appointment.service_date + 'T' + appointment.service_time));
                        } else if (appointment.service_date) {
                            serviceDateTime = formatJSDateTime(new Date(appointment.service_date));
                        }
                        const address = `${appointment.street || 'N/A'}, ${appointment.city || ''}`;

                        fullModalHtml +=
                            '<div class="service-modal-header">' +
                            '    <h3>Assign Service Professional</h3>' +
                            '</div>' +
                            '<div class="modal-body appointment-details-content">' +
                            '    <div class="service-modal-section">' +
                            '        <h4>Service Details</h4>' +
                            '        <div class="service-modal-info">' +
                            '            <p><i class="fas fa-clipboard-list"></i> ' + serviceName + '</p>' +
                            '            <p><i class="fas fa-calendar"></i> ' + serviceDateTime + '</p>' +
                            '            <p><i class="fas fa-map-marker-alt"></i> ' + address + '</p>' +
                            '        </div>' +
                            '    </div>' +
                            '    <div class="service-modal-section">' +
                            '        <h4>Available Professionals</h4>' +
                            '        <div class="professional-list" id="admin-professionals-list">' +
                            '            <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading professionals...</p></div>' +
                            '        </div>' +
                            '    </div>' +
                            '</div>' + 
                            '<div class="modal-footer">' +
                            '    <button type="button" class="btn-secondary modal-close">Cancel</button>' +
                            '</div>';
                        modalMainContainer.html(fullModalHtml);
                        loadAvailableProfessionalsForAssignment(appointmentId);
                    } else {
                        // View Details Mode
                        //onsole.log('Setting up for View Details Mode');
                        fullModalHtml +=
                            '<div class="modal-header"><h2>Appointment Details (#' + appointment.id + ')</h2></div>'+
                            '<div class="modal-body appointment-details-content">'+
                            '<p><strong>Service:</strong> ' + (appointment.service_name || 'N/A') + '</p>'+
                            '<p><strong>Date:</strong> ' + (appointment.service_date ? formatJSDateTime(new Date(appointment.service_date + 'T' + (appointment.service_time || '00:00:00'))) : 'N/A') + '</p>'+
                            '<p><strong>Customer:</strong> ' + (appointment.customer_name || 'N/A') + '</p>'+
                            '<p><strong>Address:</strong> ' + (appointment.street || 'N/A') + ', ' + (appointment.city || '') + ' ' + (appointment.state || '') + ' ' + (appointment.zipcode || '') + '</p>'+
                            '<p><strong>Status:</strong> <span class="status-badge status-' + (appointment.status ? appointment.status.toLowerCase() : 'unknown') + '">' + (appointment.status || 'N/A') + '</span></p>'+
                            '<p><strong>Price:</strong> $' + (appointment.price !== null && appointment.price !== undefined ? parseFloat(appointment.price).toFixed(2) : 'N/A') + '</p>'+
                            '<p><strong>Assigned Professional:</strong> ' + (appointment.professional_name || 'Not Assigned') + '</p>'+
                            '</div>' + 
                            '<div class="modal-footer">' +
                            '    <button type="button" class="btn-secondary modal-close">Close</button>' +
                            '</div>';
                        modalMainContainer.html(fullModalHtml); // Use modalMainContainer here
                        //onsole.log('View Details Mode HTML set.');
                    }
                } else {
                    console.error('Error or invalid data structure from get_appointments.php (single fetch):', response);
                    // Ensure error state also has the full structure
                    modalMainContainer.html('<span class="close modal-close">&times;</span><div class="modal-header"><h2>Error</h2></div><div class="modal-body"><p>Could not load appointment details. Invalid data received.</p></div><div class="modal-footer"><button type="button" class="btn-secondary modal-close">Close</button></div>');
                }
                //onsole.log('Exiting AJAX success callback for openAppointmentDetailsModal.');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX Error fetching appointment details:', textStatus, errorThrown, jqXHR.responseText);
                // Ensure error state also has the full structure
                modalMainContainer.html('<span class="close modal-close">&times;</span><div class="modal-header"><h2>Error</h2></div><div class="modal-body"><p>Error loading appointment details. Please try again.</p></div><div class="modal-footer"><button type="button" class="btn-secondary modal-close">Close</button></div>');
            }
        });
        //onsole.log('End of openAppointmentDetailsModal function.');
    }

    async function loadAvailableProfessionalsForAssignment(appointmentId) {
        const professionalsListContainer = $('#admin-professionals-list');
        if (!professionalsListContainer.length) {
            console.error('Professionals list container #admin-professionals-list not found.');
            return;
        }
        professionalsListContainer.html('<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading professionals...</p></div>');

        $.ajax({
            url: 'assets/php/get_all_available_professionals_admin.php', // UPDATED URL
            method: 'GET',
            data: { service_id: appointmentId }, // PHP script expects appointmentId as service_id
            dataType: 'json',
            success: function(response) {
                if (response.success && response.professionals && response.professionals.length > 0) {
                    const professionalsHtml = response.professionals.map(pro => `
                        <div class="professional-item" onclick="assignProfessionalToService(${appointmentId}, ${pro.id})">
                            <div class="professional-info">
                                <div class="professional-avatar">${getJSInitials(pro.name)}</div>
                                <div class="professional-details">
                                    <h4>${pro.name}</h4>
                                    <p>${pro.specialization || 'No specialization'}</p>
                                </div>
                            </div>
                            <div class="professional-rating">
                                <i class="fas fa-star"></i>
                                <span>${pro.rating ? pro.rating.toFixed(1) : 'N/A'}</span>
                            </div>
                        </div>
                    `).join('');
                    professionalsListContainer.html(professionalsHtml);
                } else {
                    professionalsListContainer.html('<div class="no-data-message"><i class="fas fa-user-slash"></i><p>No professionals found matching this service type for your location.</p></div>');
                }
            },
            error: function(xhr, status, error) {
                professionalsListContainer.html('<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>Failed to load professionals.</p></div>');
                console.error("Error fetching available professionals:", status, error, xhr.responseText);
            }
        });
    }

    function assignProfessionalToService(serviceId, professionalId) {
        //onsole.log(`Assigning professional ${professionalId} to service ${serviceId}`);
        // AJAX call to assign professional
        $.ajax({
            url: 'assets/php/assign_professional.php', // Ensure this endpoint handles the assignment
            method: 'POST',
            data: {
                service_id: serviceId,
                professional_id: professionalId
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showGlobalNotification('success', 'Professional assigned successfully!');
                    $('#appointment-details-modal').hide(); // Close modal
                    // Refresh relevant parts of the page, e.g., pending appointments list and calendar
                    if (typeof loadPendingAppointments === 'function') {
                        loadPendingAppointments(); // Reloads the pending appointments sidebar
                    }
                    const calendarEl = document.getElementById('appointments-calendar');
                    if (calendarEl && calendarEl.fullCalendar) {
                        calendarEl.fullCalendar('refetchEvents'); // Refreshes calendar
                    } else if (calendarEl && calendarEl._fullCalendar) { // For FullCalendar v5+
                         calendarEl._fullCalendar.refetchEvents();
                    }
                } else {
                    showGlobalNotification('error', response.message || 'Failed to assign professional.');
                }
            },
            error: function(xhr, status, error) {
                showGlobalNotification('error', 'Error assigning professional. Please try again.');
                console.error("Error assigning professional:", status, error, xhr.responseText);
            }
        });
    }

    // Event delegation for dynamically added elements
    $(document).ready(function() {
    // ... existing code ...

        // Handle clicks on buttons that open modals
        $(document).on('click', '[data-modal]', function(e) {
            e.preventDefault();
            const modalId = $(this).data('modal');
            const appointmentId = $(this).data('appointment-id');
            const memberId = $(this).data('member-id');
            const serviceId = $(this).data('service-id');
            const templateId = $(this).data('template-id');
            const customerId = $(this).data('customer-id');

            //onsole.log(`Modal button clicked for: ${modalId}`, { appointmentId, memberId, serviceId, templateId, customerId });

            if (modalId === 'appointment-details' && appointmentId) {
                const isAssignMode = $(this).hasClass('btn-primary'); // Check if it's the Confirm/Assign button
                openAppointmentDetailsModal(appointmentId, isAssignMode);
            } else if (modalId === 'quick-service') {
                openQuickServiceModal();
            } else if (modalId === 'add-member') {
                // ... existing code ...
            }
        });
    });

    // Quick Service Modal Logic - START
    // Ensure this is called, perhaps in initializeModals or document.addEventListener('DOMContentLoaded')
    function initializeQuickServiceModal() {
        //onsole.log('[initializeQuickServiceModal] Setting up Quick Service Modal');

        const quickServiceModal = document.getElementById('quick-service-modal');
        if (!quickServiceModal) {
            console.error('Quick Service Modal element not found!');
            return;
        }
        
        // Event listener for the main "Add Appointment" button in the appointments section
        const addAppointmentButton = document.querySelector('.schedule-actions .btn-primary[data-modal="quick-service"]');
        if (addAppointmentButton) {
            addAppointmentButton.addEventListener('click', () => {
                //onsole.log('[initializeQuickServiceModal] Add Appointment button clicked');
                openQuickServiceModal();
            });
        } else {
            console.warn('Add Appointment button for Quick Service Modal not found.');
        }

        // Close button inside the modal
        const closeButton = quickServiceModal.querySelector('.service-modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => closeModal('quick-service-modal'));
        }
        
        // Cancel button in footer
        const cancelButton = quickServiceModal.querySelector('.service-modal-footer .btn-secondary');
        if (cancelButton) {
             cancelButton.addEventListener('click', () => closeModal('quick-service-modal'));
        }

        // Submit button
        const scheduleButton = quickServiceModal.querySelector('.service-modal-footer .btn-primary');
        if (scheduleButton) {
            scheduleButton.addEventListener('click', submitQuickService);
        }

        // Customer select change
        const customerSelect = document.getElementById('qs-customer-select');
        if (customerSelect) {
            customerSelect.addEventListener('change', (event) => handleCustomerSelectionForQuickService(event.target.value));
        }

        // Service type buttons
        const serviceTypeButtons = quickServiceModal.querySelectorAll('.service-type-buttons .service-btn');
        serviceTypeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const serviceType = this.dataset.service;
                const optionsContainerId = `qs-${serviceType.replace('_', '-')}-options`; // e.g., qs-lawn-care-options
                toggleServiceSelectionForQuickService(this, optionsContainerId);
            });
        });

        // Attach onchange to all package selects and checkboxes for summary update
        const elementsForSummaryUpdate = quickServiceModal.querySelectorAll('.service-package, .additional-services input[type="checkbox"]');
        elementsForSummaryUpdate.forEach(element => {
            element.addEventListener('change', updateQuickServiceSummary);
        });
        
        //onsole.log('[initializeQuickServiceModal] Quick Service Modal setup complete.');
    }

    function openQuickServiceModal() {
        //onsole.log('[openQuickServiceModal] Opening Quick Service Modal.');
        const modal = document.getElementById('quick-service-modal');
        if (modal) {
            // Reset form (optional, good practice)
            const form = document.getElementById('quick-service-form');
            if (form) form.reset();

            // Hide dynamic sections initially
            const newCustomerFields = document.getElementById('qs-new-customer-fields');
            const customerAddressSelect = document.getElementById('qs-customer-address-select');
            if (newCustomerFields) newCustomerFields.style.display = 'none';
            if (customerAddressSelect) customerAddressSelect.style.display = 'none';
            
            const serviceOptions = document.querySelectorAll('#qs-service-options .service-options');
            serviceOptions.forEach(opt => opt.style.display = 'none');
            
            const serviceButtons = document.querySelectorAll('#quick-service-modal .service-type-buttons .service-btn');
            serviceButtons.forEach(btn => btn.classList.remove('active'));

            loadCustomersForQuickService(); // Load customers into the dropdown
            updateQuickServiceSummary(); // Clear summary
            showModal('quick-service-modal'); // Uses existing showModal function
        } else {
            console.error('Quick Service Modal element not found for opening.');
        }
    }

    async function loadCustomersForQuickService() {
        const selectElement = document.getElementById('qs-customer-select');
        if (!selectElement) {
            console.error('Customer select element for quick service not found.');
            return;
        }

        // Clear existing options except for "Select Customer" and "Add New"
        selectElement.innerHTML = '<option value=\"\">Select Customer</option><option value=\"new\">+ Add New Customer</option>';

        try {
            const response = await fetchWithErrorHandling('assets/php/get_customer_data.php?simple=true'); // Assuming an endpoint that returns basic customer list
            if (!response.ok) {
                throw new Error(`Failed to load customers: ${response.statusText}`);
            }
            const customers = await response.json();
            
            console.log(customers);
            if (customers && customers.data) {
                customers.data.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.id;
                    option.textContent = `${customer.first_name} ${customer.last_name} (${customer.email})`;
                    selectElement.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading customers for quick service:', error);
            showNotification('Error loading customers.', 'error');
        }
    }

    async function handleCustomerSelectionForQuickService(selectedValue) {
        const newCustomerFields = document.getElementById('qs-new-customer-fields');
        const customerAddressSelectContainer = document.getElementById('qs-customer-address-select');
        const addressSelect = document.getElementById('qs-address-select');

        if (!newCustomerFields || !customerAddressSelectContainer || !addressSelect) {
            console.error('One or more customer fields/selects for quick service not found.');
            return;
        }

        if (selectedValue === 'new') {
            newCustomerFields.style.display = 'block';
            customerAddressSelectContainer.style.display = 'none';
            addressSelect.innerHTML = '<option value=\"\">Select Address</option>'; // Clear addresses
        } else if (selectedValue) { // Existing customer selected
            newCustomerFields.style.display = 'none';
            customerAddressSelectContainer.style.display = 'block';
            await loadCustomerAddressesForQuickService(selectedValue);
        } else { // "Select Customer" or empty
            newCustomerFields.style.display = 'none';
            customerAddressSelectContainer.style.display = 'none';
            addressSelect.innerHTML = '<option value=\"\">Select Address</option>';
        }
    }

    async function loadCustomerAddressesForQuickService(customerId) {
        const selectElement = document.getElementById('qs-address-select');
        if (!selectElement) {
            console.error('Address select for quick service not found.');
            return;
        }
        selectElement.innerHTML = '<option value=\"\">Loading addresses...</option>'; // Placeholder

        try {
            // Assuming an endpoint like /api/customers/{customerId}/addresses
            const response = await fetchWithErrorHandling(`/api/customers/${customerId}/addresses`);
            if (!response.ok) {
                throw new Error(`Failed to load addresses: ${response.statusText}`);
            }
            const result = await response.json();
            const addresses = result.data; // Assuming addresses are in result.data

            selectElement.innerHTML = '<option value=\"\">Select Address</option>'; // Clear placeholder
            if (addresses && addresses.length > 0) {
                addresses.forEach(addr => {
                    const option = document.createElement('option');
                    option.value = addr.id; // Or full address if that's what your backend expects
                    option.textContent = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipcode}`;
                    selectElement.appendChild(option);
                });
            } else {
                selectElement.innerHTML = '<option value=\"\">No addresses found</option>';
            }
        } catch (error) {
            console.error('Error loading customer addresses for quick service:', error);
            selectElement.innerHTML = '<option value=\"\">Error loading addresses</option>';
            showNotification('Error loading addresses.', 'error');
        }
    }

    function toggleServiceSelectionForQuickService(buttonElement, optionsContainerId) {
        const optionsContainer = document.getElementById(optionsContainerId);
        const allOptionsContainers = document.querySelectorAll('#qs-service-options .service-options');
        const allServiceButtons = document.querySelectorAll('#quick-service-modal .service-type-buttons .service-btn');

        // Deactivate all buttons and hide all options first
        allServiceButtons.forEach(btn => btn.classList.remove('active'));
        allOptionsContainers.forEach(container => container.style.display = 'none');

        // Activate the clicked button and show its options
        if (optionsContainer) {
            if (buttonElement.classList.contains('active')) { // If already active, toggle it off
                buttonElement.classList.remove('active');
                optionsContainer.style.display = 'none';
            } else {
                buttonElement.classList.add('active');
                optionsContainer.style.display = 'block';
            }
        } else {
            console.warn(`Options container with ID ${optionsContainerId} not found.`);
        }
        updateQuickServiceSummary(); // Update summary when service type changes
    }


    function updateQuickServiceSummary() {
        const summaryContainer = document.getElementById('qs-selected-services-summary');
        const totalPriceElement = document.getElementById('qs-total-price');
        if (!summaryContainer || !totalPriceElement) {
            console.error('Summary or total price element for quick service not found.');
            return;
        }

        summaryContainer.innerHTML = ''; // Clear previous summary
        let totalPrice = 0;
        let summaryItems = [];

        // Find the active service type
        const activeServiceButton = document.querySelector('#quick-service-modal .service-type-buttons .service-btn.active');
        if (activeServiceButton) {
            const serviceType = activeServiceButton.dataset.service;
            const optionsContainerId = `qs-${serviceType.replace('_', '-')}-options`;
            const activeOptionsContainer = document.getElementById(optionsContainerId);

            if (activeOptionsContainer) {
                // Get selected package
                const packageSelect = activeOptionsContainer.querySelector('.service-package');
                if (packageSelect && packageSelect.value) {
                    const selectedOption = packageSelect.options[packageSelect.selectedIndex];
                    const packagePrice = parseFloat(selectedOption.dataset.price || 0);
                    const packageName = selectedOption.textContent.split('(')[0].trim();
                    totalPrice += packagePrice;
                    summaryItems.push({ name: packageName, price: packagePrice });
                }

                // Get selected extras
                const extrasCheckboxes = activeOptionsContainer.querySelectorAll('.additional-services input[type="checkbox"]:checked');
                extrasCheckboxes.forEach(checkbox => {
                    const extraPrice = parseFloat(checkbox.dataset.price || 0);
                    const extraName = checkbox.parentElement.textContent.split('(')[0].trim();
                    totalPrice += extraPrice;
                    summaryItems.push({ name: extraName, price: extraPrice });
                });
            }
        }

        if (summaryItems.length > 0) {
            summaryItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('summary-item');
                itemDiv.innerHTML = `<span class=\"item-name\">${item.name}</span><span class=\"item-price\">$${item.price.toFixed(2)}</span>`;
                summaryContainer.appendChild(itemDiv);
            });
        } else {
            summaryContainer.innerHTML = '<p>No services selected.</p>';
        }

        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    }

    //validation 
    function validateFormFields(newCustomerData, serviceDate) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const today = new Date().toISOString().split('T')[0];

        if (newCustomerData && !emailRegex.test(newCustomerData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return false;
        }

        if (new Date(serviceDate) < new Date(today)) {
            showNotification('Service date must be today or a future date.', 'error');
            return false;
        }

        return true;
    }



    async function submitQuickService() {
        console.log('[submitQuickService] Attempting to submit quick service form.');
        const form = document.getElementById('quick-service-form');
        if (!form) {
            console.error('Quick service form not found.');
            showNotification('Error submitting form. Please try again.', 'error');
            return;
        }

        // --- Customer Data ---
        const customerSelect = document.getElementById('qs-customer-select');
        let customerId = customerSelect.value;
        let newCustomerData = null;
        let selectedAddressId = null;

        if (customerId === 'new') {
            newCustomerData = {
                name: document.getElementById('qs-new-customer-name').value,
                phone: document.getElementById('qs-new-customer-phone').value,
                email: document.getElementById('qs-new-customer-email').value,
                address: document.getElementById('qs-new-customer-address').value, // This is a single address string
            };
            // Basic validation for new customer
            if (!newCustomerData.name || !newCustomerData.address) {
                showNotification('New customer name and address are required.', 'error');
                return;
            }
        } else if (customerId) {
            const addressSelect = document.getElementById('qs-address-select');
            selectedAddressId = addressSelect.value;
            if (!selectedAddressId) {
                showNotification('Please select a service address for the existing customer.', 'error');
                return;
            }
        } else {
            showNotification('Please select or add a customer.', 'error');
            return;
        }

        // --- Service Data ---
        const activeServiceButton = document.querySelector('#quick-service-modal .service-type-buttons .service-btn.active');
        if (!activeServiceButton) {
            showNotification('Please select a service type.', 'error');
            return;
        }
        const serviceType = activeServiceButton.dataset.service;
        const optionsContainerId = `qs-${serviceType.replace('_', '-')}-options`;
        const activeOptionsContainer = document.getElementById(optionsContainerId);

        let servicePackage = null;
        let serviceExtras = [];
        let mainServicePrice = 0;

        if (activeOptionsContainer) {
            const packageSelect = activeOptionsContainer.querySelector('.service-package');
            if (packageSelect && packageSelect.value) {
                const selectedOpt = packageSelect.options[packageSelect.selectedIndex];
                servicePackage = {
                    id: selectedOpt.value, // or some internal ID if different from display value
                    name: selectedOpt.textContent.split('(')[0].trim(),
                    price: parseFloat(selectedOpt.dataset.price || 0)
                };
                mainServicePrice = servicePackage.price;
            } else {
                 showNotification('Please select a service package.', 'error');
                 return;
            }

            const extrasCheckboxes = activeOptionsContainer.querySelectorAll('.additional-services input[type="checkbox"]:checked');
            extrasCheckboxes.forEach(checkbox => {
                serviceExtras.push({
                    id: checkbox.value,
                    name: checkbox.parentElement.textContent.split('(')[0].trim(),
                    price: parseFloat(checkbox.dataset.price || 0)
                });
            });
        } else {
            showNotification('Error retrieving service options. Please re-select service type.', 'error');
            return;
        }
        
        if (!servicePackage) { // Double check, even if caught by select.value before
            showNotification('Please select a service package.', 'error');
            return;
        }


        // --- Scheduling Data ---
        const serviceDate = document.getElementById('qs-service-date').value;
        const serviceTime = document.getElementById('qs-service-time-select').value; // Use the select ID
        const serviceNotes = document.getElementById('qs-service-notes').value;

        
        if (!serviceDate || !serviceTime) {
            showNotification('Service date and time are required.', 'error');
            return;
        }

        // --- Validate Email and Date ---
        if (!validateFormFields(newCustomerData, serviceDate)) {
            return;
        }
        
        // --- Total Price (recalculate for safety, or get from summary) ---
        const totalPriceText = document.getElementById('qs-total-price').textContent;
        const totalPrice = parseFloat(totalPriceText.replace('$', ''));


        // --- Construct Payload ---
        const payload = {
            customer_id: customerId === 'new' ? null : customerId,
            new_customer: newCustomerData, // Will be null if existing customer
            address_id: selectedAddressId, // Will be null if new customer (address is part of newCustomerData)
            service_type: serviceType,
            service_package: servicePackage,
            service_extras: serviceExtras,
            service_date: serviceDate,
            service_time: serviceTime,
            notes: serviceNotes,
            total_price: totalPrice,
            status: 'pending' // Or 'booked', 'requested' depending on workflow
        };

        console.log('Quick Service Payload:', payload);

        try {
            showNotification('Scheduling service...', 'info');
            // Replace with your actual API endpoint
            const response = await fetchWithErrorHandling('assets/php/schedule_service.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any necessary auth headers like 'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(payload)
            });

            console.log(response);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred during submission.' }));
                throw new Error(errorData.message || `Failed to schedule service. Status: ${response.status}`);
            }

            const result = await response;
            console.log('Quick Service Submission Result:', result);

            if (result.success) { // Assuming your API returns a success flag
                showNotification('Service scheduled successfully!', 'success');
                closeModal('quick-service-modal');
                // Optionally, refresh appointments list or calendar
                if (typeof loadAppointments === 'function') { // if function exists from Appointments section
                     loadAppointments();
                } else if (typeof calendar !== 'undefined' && calendar.refetchEvents) { // if FullCalendar instance exists
                     calendar.refetchEvents();
                }
            } else {
                showNotification(result.message || 'Failed to schedule service. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting quick service:', error);
            showNotification(`Error: ${error.message}`, 'error');
        }
    }


    // Make sure to call initializeQuickServiceModal when the DOM is ready, or after initializeModals
    // For example, at the end of the DOMContentLoaded listener:
    document.addEventListener('DOMContentLoaded', function() {
        // ... other initializations ...
        initializeQuickServiceModal();
        // ...
    });
    // Quick Service Modal Logic - END


    // ... existing code ...
    // Modify initializeModals to NOT handle the quick-service modal if initializeQuickServiceModal handles it.
    // OR call initializeQuickServiceModal from within initializeModals if that's preferred.
    // For this example, I'm assuming initializeQuickServiceModal is called separately on DOMContentLoaded.

    // Adjust existing closeModal if it needs to be more generic or if quick-service-modal has special needs.
    // The provided closeModal in service-manager.js is generic enough:
    // function closeModal(modalId) {
    //     const modal = document.getElementById(modalId);
    //     if (modal) {
    //         modal.classList.remove('show'); // Or use style.display = 'none' if not using class for show/hide
    //     }
    // }
    // Ensure you have a `showModal` that adds a 'show' class or sets display to flex/block.
    // Example:
    // function showModal(modalId) {
    //     const modal = document.getElementById(modalId);
    //     if (modal) {
    //         modal.style.display = 'flex'; // or 'block' depending on your modal CSS
    //         setTimeout(() => modal.classList.add('show'), 10); // For CSS transition
    //     }
    // }
    // If your existing showModal/hideModal in admin.js already handle this, no change needed there.
    // Just ensure they are compatible with the `service-modal` structure.

    // It seems `showModal` and `closeModal` are already defined in admin.js.
    // Ensure they work with the `service-modal` and `modal-content` structure.
    // The `closeModal` in admin.js (around line 500) uses `style.display = 'none'`, which is fine.
    // The `showModal` in admin.js (around line 492) also uses `style.display = 'flex'`, which is also fine.

    // The new `initializeQuickServiceModal` function should be called.
    // A good place is within the main DOMContentLoaded listener in admin.js, similar to how other initializations are done.

    // Example of integrating the call:
    /*
    document.addEventListener('DOMContentLoaded', async () => {
        // ... existing initializations like:
        // setupEventListeners();
        // initializeModals(); // If quick service init is separate, this is fine.
        // showSection('dashboard');
        // loadDashboardData();
        // initCalendar();
        // initCrmCharts();
        // initMarketingCharts();
        // initTeamPerformanceCharts();
        // initializeTooltips();

        initializeQuickServiceModal(); // Add this call

        // ... any other late initializations
        //onsole.log('Admin dashboard initialized with Quick Service Modal.');
    });
    */
    // Ensure fetchWithErrorHandling is available and CSRF token logic if needed.

    // IMPORTANT: Replace '/api/customers?simple=true', '/api/customers/${customerId}/addresses', 
    // and '/api/appointments/quick-schedule' with your actual API endpoints.
    // Adapt the expected structure of the API responses (e.g., `customers.data`, `result.data` for addresses, `result.success`).