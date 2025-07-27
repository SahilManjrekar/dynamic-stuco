// Main JavaScript file with Firebase integration
// All your existing logic remains the same - just modified to use Firebase

// Global variables (same as before)
let currentUser = null;
let currentUserType = null;
let currentEditingEventId = null;
let currentEnrollingEventId = null;
let navigationHistory = ['home'];
let currentPage = 'home';
let skipCountdown = 5;
let countdownInterval = null;
let html5QrcodeScanner = null;
let isScanning = false;
let enrollmentChart = null;
let categoryChart = null;
let financeChart = null;

// Sponsor videos - Replace with your actual video paths
const sponsorVideos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
];

// Initialize the page
function init() {
    console.log('Initializing page...');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const eventDate = document.getElementById('eventDate');
    const editEventDate = document.getElementById('editEventDate');
    if (eventDate) eventDate.min = today;
    if (editEventDate) editEventDate.min = today;
    
    updateBackButton();
    console.log('Page initialized successfully');
}

// Tab navigation (unchanged)
function showTab(tabName) {
    console.log('Showing tab:', tabName);
    
    // Stop scanner if leaving scan tab
    if (currentPage === 'scan' && tabName !== 'scan') {
        stopScanner();
    }

    // Add to navigation history if it's a new page
    if (currentPage !== tabName) {
        navigationHistory.push(tabName);
        if (navigationHistory.length > 10) {
            navigationHistory.shift();
        }
        currentPage = tabName;
    }

    if (tabName === 'enrolled') {
        updateEnrolledEvents();
    } else if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'finance') {
        updateFinanceData();
    } else if (tabName === 'manage-events') {
        updateEventManagement();
    }
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.add('hidden'));
    
    // Show selected tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    // Update active tab
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Find and activate the correct tab button
    const tabButtons = document.querySelectorAll('.nav-tab');
    tabButtons.forEach(button => {
        const buttonText = button.textContent.toLowerCase();
        if ((tabName === 'home' && buttonText === 'home') ||
            (tabName === 'about' && buttonText === 'about') ||
            (tabName === 'events' && buttonText === 'events') ||
            (tabName === 'enrolled' && buttonText.includes('enrolled')) ||
            (tabName === 'scan' && buttonText.includes('scan')) ||
            (tabName === 'gallery' && buttonText === 'gallery') ||
            (tabName === 'sponsors' && buttonText === 'sponsors') ||
            (tabName === 'feedback' && buttonText === 'feedback') ||
            (tabName === 'dashboard' && buttonText === 'dashboard') ||
            (tabName === 'finance' && buttonText === 'finance') ||
            (tabName === 'manage-events' && buttonText.includes('manage events'))) {
            button.classList.add('active');
        }
    });
    
    updateBackButton();
}

// Back button functionality (unchanged)
function goBack() {
    console.log('Going back...');
    if (navigationHistory.length > 1) {
        navigationHistory.pop();
        const previousPage = navigationHistory[navigationHistory.length - 1];
        currentPage = previousPage;
        showTab(previousPage);
    }
}

function updateBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (!backBtn) return;
    
    if (navigationHistory.length > 1 && currentPage !== 'home') {
        backBtn.style.display = 'block';
        const previousPage = navigationHistory[navigationHistory.length - 2];
        backBtn.innerHTML = `← Back to ${previousPage.charAt(0).toUpperCase() + previousPage.slice(1)}`;
    } else {
        backBtn.style.display = 'none';
    }
}

// Login functionality (unchanged)
function showLogin() {
    showModal('loginModal');
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    let isValidCredentials = false;
    
    if (userType === 'student' && username === 'student' && password === 'student123') {
        isValidCredentials = true;
    } else if (userType === 'secretary' && username === 'secretary' && password === 'secretary123') {
        isValidCredentials = true;
    } else if (userType === 'management' && username === 'admin' && password === 'admin123') {
        isValidCredentials = true;
    }

    if (isValidCredentials) {
        currentUser = username;
        currentUserType = userType;
        
        // Update UI based on user type
        const badgeClass = userType === 'management' ? 'user-badge management' : 'user-badge';
        document.getElementById('userInfo').innerHTML = `
            <div class="${badgeClass}">${userType.charAt(0).toUpperCase() + userType.slice(1)}: ${username}</div>
            <button class="btn btn-secondary" onclick="logout()">Logout</button>
        `;
        
        // Show user-specific features
        if (userType === 'student') {
            document.getElementById('enrolledTab').style.display = 'inline-block';
            updateEnrolledEvents();
        } else if (userType === 'secretary') {
            document.getElementById('scanTab').style.display = 'inline-block';
            const addEventBtn = document.getElementById('addEventBtn');
            const addPhotoBtn = document.getElementById('addPhotoBtn');
            if (addEventBtn) addEventBtn.style.display = 'block';
            if (addPhotoBtn) addPhotoBtn.style.display = 'block';
        } else if (userType === 'management') {
            // Show all management tabs
            document.getElementById('dashboardTab').style.display = 'inline-block';
            document.getElementById('financeTab').style.display = 'inline-block';
            document.getElementById('manageEventsTab').style.display = 'inline-block';
            document.getElementById('scanTab').style.display = 'inline-block';
            const addEventBtn = document.getElementById('addEventBtn');
            const addPhotoBtn = document.getElementById('addPhotoBtn');
            if (addEventBtn) addEventBtn.style.display = 'block';
            if (addPhotoBtn) addPhotoBtn.style.display = 'block';
            
            // Redirect to dashboard
            showTab('dashboard');
        }
        
        hideModal('loginModal');
        updateEventsList();
        updateGalleryList();
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        console.log('Login successful:', userType, username);
    } else {
        alert('Invalid credentials! Please use the demo credentials provided.');
    }
}

function logout() {
    stopScanner(); // Stop scanner if active
    currentUser = null;
    currentUserType = null;
    document.getElementById('userInfo').innerHTML = '<button class="btn" onclick="showLogin()">Login</button>';
    
    // Hide user-specific features
    document.getElementById('enrolledTab').style.display = 'none';
    document.getElementById('scanTab').style.display = 'none';
    document.getElementById('dashboardTab').style.display = 'none';
    document.getElementById('financeTab').style.display = 'none';
    document.getElementById('manageEventsTab').style.display = 'none';
    
    const addEventBtn = document.getElementById('addEventBtn');
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    if (addEventBtn) addEventBtn.style.display = 'none';
    if (addPhotoBtn) addPhotoBtn.style.display = 'none';
    
    updateEventsList();
    updateGalleryList();
    showTab('home');
    console.log('Logout successful');
}

// Event Records functionality
function showEventRecordsModal() {
    const select = document.getElementById('recordEventSelect');
    select.innerHTML = '<option value="">Choose an event...</option>';
    
    window.events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.title;
        select.appendChild(option);
    });
    
    showModal('eventRecordsModal');
}

function loadEventRecords() {
    const eventId = document.getElementById('recordEventSelect').value;
    const container = document.getElementById('eventRecordsContainer');
    
    if (!eventId) {
        container.style.display = 'none';
        return;
    }
    
    const event = window.events.find(e => e.id == eventId);
    if (!event) return;
    
    container.style.display = 'block';
    
    // Update event details
    document.getElementById('selectedEventTitle').textContent = event.title;
    document.getElementById('selectedEventDetails').innerHTML = `
        📅 ${new Date(event.date).toLocaleDateString()} | 📍 ${event.location} | 
        💰 Fee: ${event.fee > 0 ? `₹${event.fee}` : 'Free'} | 
        👥 ${event.enrolledStudents.length}/${event.maxParticipants} enrolled
    `;
    
    // Update student records
    const recordsList = document.getElementById('studentRecordsList');
    recordsList.innerHTML = event.enrolledStudents.map(student => {
        const statusClass = student.paymentStatus === 'paid' ? 'payment-paid' : 
                          student.paymentStatus === 'pending' ? 'payment-pending' : 'payment-free';
        const statusText = student.paymentStatus === 'paid' ? 'Paid' : 
                         student.paymentStatus === 'pending' ? 'Pending' : 'Free Event';
        
        return `
            <div class="student-record">
                <div>${student.name}</div>
                <div>${new Date(student.enrollDate).toLocaleDateString()}</div>
                <div><span class="payment-status ${statusClass}">${statusText}</span></div>
                <div>₹${student.amount}</div>
                <div>
                    ${student.paymentStatus === 'pending' ? 
                        `<button class="btn btn-sm btn-success" onclick="updatePaymentStatus(${event.id}, '${student.name}', 'paid')">Mark Paid</button>` : 
                        `<button class="btn btn-sm btn-secondary" onclick="viewStudentDetails('${student.name}')">View Details</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    // Update summary
    const totalEnrolled = event.enrolledStudents.length;
    const totalPaid = event.enrolledStudents.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.amount, 0);
    const totalPending = event.enrolledStudents.filter(s => s.paymentStatus === 'pending').reduce((sum, s) => sum + s.amount, 0);
    const enrollmentRate = Math.round((totalEnrolled / event.maxParticipants) * 100);
    
    document.getElementById('totalEnrolled').textContent = totalEnrolled;
    document.getElementById('totalPaid').textContent = `₹${totalPaid.toLocaleString()}`;
    document.getElementById('totalPending').textContent = `₹${totalPending.toLocaleString()}`;
    document.getElementById('enrollmentRate').textContent = `${enrollmentRate}%`;
}

async function updatePaymentStatus(eventId, studentName, newStatus) {
    try {
        const event = window.events.find(e => e.id === eventId);
        if (!event) return;
        
        const student = event.enrolledStudents.find(s => s.name === studentName);
        if (!student) return;
        
        student.paymentStatus = newStatus;
        
        // Update in Firebase
        await window.firebaseOperations.updateEvent(eventId, { enrolledStudents: event.enrolledStudents });
        
        // Add to recent activities
        await window.firebaseOperations.addActivity({
            action: "Payment updated",
            details: `${studentName} payment marked as ${newStatus} for ${event.title}`,
            time: 'Just now'
        });
        
        loadEventRecords(); // Refresh the records
        alert(`Payment status updated successfully for ${studentName}!`);
    } catch (error) {
        console.error('Error updating payment status:', error);
        alert('Error updating payment status. Please try again.');
    }
}

function viewStudentDetails(studentName) {
    alert(`Student Details:\n\nName: ${studentName}\n\nContact: student@college.edu\nStudent ID: STU${Math.floor(Math.random() * 10000)}\nYear: 3rd Year\nDepartment: Computer Science`);
}

function exportEventRecord() {
    const eventId = document.getElementById('recordEventSelect').value;
    if (!eventId) {
        alert('Please select an event first!');
        return;
    }
    
    const event = window.events.find(e => e.id == eventId);
    if (!event) return;
    
    alert(`📊 Event Record Export\n\nEvent: ${event.title}\nDate: ${event.date}\nTotal Students: ${event.enrolledStudents.length}\nTotal Revenue: ₹${event.enrolledStudents.reduce((sum, s) => sum + (s.paymentStatus === 'paid' ? s.amount : 0), 0)}\n\nRecord has been exported successfully!`);
}

// Dashboard functions
function updateDashboard() {
    updateMetrics();
    updateCharts();
    updateRecentActivity();
}

function updateMetrics() {
    // Calculate metrics
    const allStudents = new Set();
    window.events.forEach(event => {
        event.enrolledStudents.forEach(student => {
            allStudents.add(student.name);
        });
    });
    const totalStudents = allStudents.size;
    const activeEvents = window.events.filter(e => e.status === 'upcoming').length;
    const totalEnrollments = window.events.reduce((sum, e) => sum + e.enrolledStudents.length, 0);
    const totalBudget = window.events.reduce((sum, e) => sum + (e.budget || 0), 0);

    // Update DOM
    document.getElementById('totalStudentsMetric').textContent = totalStudents;
    document.getElementById('activeEventsMetric').textContent = activeEvents;
    document.getElementById('totalEnrollmentsMetric').textContent = totalEnrollments;
    document.getElementById('totalRevenueMetric').textContent = `₹${totalBudget.toLocaleString()}`;
}

function updateCharts() {
    // Enrollment trends chart
    const ctx1 = document.getElementById('enrollmentChart').getContext('2d');
    if (enrollmentChart) enrollmentChart.destroy();
    
    enrollmentChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Monthly Enrollments',
                data: [12, 19, 15, 25, 22, 30, 35],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
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

    // Category distribution chart
    const ctx2 = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();
    
    categoryChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Cultural', 'Academic', 'Sports', 'Social'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#28a745',
                    '#ffc107'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    activityContainer.innerHTML = window.recentActivities.slice(0, 5).map(activity => `
        <div style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
            <div style="font-weight: 500; color: #333;">${activity.action}</div>
            <div style="font-size: 14px; color: #666;">${activity.details}</div>
            <div style="font-size: 12px; color: #999; margin-top: 5px;">${activity.time}</div>
        </div>
    `).join('');
}

// Finance functions
function updateFinanceData() {
    updateBudgetOverview();
    updateSponsorManagement();
    updateFinanceChart();
}

function updateBudgetOverview() {
    const container = document.getElementById('budgetOverview');
    container.innerHTML = window.budgetCategories.map(category => {
        const percentage = Math.round((category.spent / category.allocated) * 100);
        return `
            <div class="budget-item">
                <div>
                    <div style="font-weight: 500;">${category.name}</div>
                    <div style="font-size: 14px; color: #666;">₹${category.spent.toLocaleString()} / ₹${category.allocated.toLocaleString()}</div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div style="font-weight: bold; color: ${percentage > 80 ? '#dc3545' : '#28a745'};">
                    ${percentage}%
                </div>
            </div>
        `;
    }).join('');
}

function updateSponsorManagement() {
    const container = document.getElementById('sponsorManagement');
    container.innerHTML = window.sponsors.map(sponsor => `
        <div class="sponsor-item">
            <div>
                <div style="font-weight: 500;">${sponsor.name}</div>
                <div style="font-size: 14px; color: #666;">${sponsor.contact} - ${sponsor.email}</div>
            </div>
            <div style="font-weight: bold; color: #28a745;">₹${sponsor.amount.toLocaleString()}</div>
        </div>
    `).join('');
}

function updateFinanceChart() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    if (financeChart) financeChart.destroy();
    
    financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: window.budgetCategories.map(c => c.name),
            datasets: [{
                label: 'Allocated',
                data: window.budgetCategories.map(c => c.allocated),
                backgroundColor: 'rgba(102, 126, 234, 0.6)'
            }, {
                label: 'Spent',
                data: window.budgetCategories.map(c => c.spent),
                backgroundColor: 'rgba(40, 167, 69, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Event Management functions
function updateEventManagement() {
    updateEventStats();
    updateEventsTable();
}

function updateEventStats() {
    const upcomingEvents = window.events.filter(e => e.status === 'upcoming').length;
    const totalParticipants = window.events.reduce((sum, e) => sum + e.enrolledStudents.length, 0);
    const totalCapacity = window.events.reduce((sum, e) => sum + e.maxParticipants, 0);
    const averageEnrollment = totalCapacity > 0 ? Math.round((totalParticipants / totalCapacity) * 100) : 0;

    document.getElementById('upcomingEventsCount').textContent = upcomingEvents;
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('averageEnrollment').textContent = `${averageEnrollment}%`;
}

function updateEventsTable() {
    const tbody = document.getElementById('eventsTableBody');
    tbody.innerHTML = window.events.map(event => {
        const enrollmentRate = Math.round((event.enrolledStudents.length / event.maxParticipants) * 100);
        const statusBadge = getStatusBadge(event.status);
        
        return `
            <div class="table-row">
                <div>${event.title}</div>
                <div>${new Date(event.date).toLocaleDateString()}</div>
                <div>${event.location}</div>
                <div>${event.enrolledStudents.length}/${event.maxParticipants}</div>
                <div>${statusBadge}</div>
                <div class="event-actions-table">
                    <button class="btn btn-sm" onclick="showEditEventModal('${event.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
                    <button class="btn btn-sm btn-secondary" onclick="viewEventDetails('${event.id}')">Details</button>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusBadge(status) {
    const colors = {
        upcoming: '#007bff',
        ongoing: '#28a745',
        completed: '#6c757d'
    };
    return `<span style="padding: 4px 8px; background: ${colors[status]}; color: white; border-radius: 10px; font-size: 12px;">${status}</span>`;
}

function filterEvents() {
    // Implementation for filtering events based on status and search
    updateEventsTable();
}

function viewEventDetails(eventId) {
    const event = window.events.find(e => e.id === eventId);
    if (event) {
        const totalRevenue = event.enrolledStudents.reduce((sum, s) => sum + (s.paymentStatus === 'paid' ? s.amount : 0), 0);
        const pendingRevenue = event.enrolledStudents.reduce((sum, s) => sum + (s.paymentStatus === 'pending' ? s.amount : 0), 0);
        
        alert(`Event Details:\n\nTitle: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\nEnrolled: ${event.enrolledStudents.length}/${event.maxParticipants}\nBudget: ₹${event.budget?.toLocaleString() || 'N/A'}\nRevenue Collected: ₹${totalRevenue.toLocaleString()}\nRevenue Pending: ₹${pendingRevenue.toLocaleString()}\nEvent Fee: ₹${event.fee || 0}`);
    }
}

// Sponsor management
function showAddSponsorModal() {
    showModal('addSponsorModal');
}

async function addSponsor() {
    const name = document.getElementById('sponsorName').value;
    const amount = parseInt(document.getElementById('sponsorAmount').value);
    const contact = document.getElementById('sponsorContact').value;
    const email = document.getElementById('sponsorEmail').value;

    if (!name || !amount || !contact || !email) {
        alert('Please fill in all fields!');
        return;
    }

    try {
        await window.firebaseOperations.addSponsor({
            name, amount, contact, email
        });

        // Add to recent activities
        await window.firebaseOperations.addActivity({
            action: "New sponsor added",
            details: `${name} partnership confirmed with ₹${amount.toLocaleString()} contribution`,
            time: 'Just now'
        });

        updateFinanceData();
        if (currentPage === 'dashboard') updateRecentActivity();
        hideModal('addSponsorModal');
        
        // Clear form
        document.getElementById('sponsorName').value = '';
        document.getElementById('sponsorAmount').value = '';
        document.getElementById('sponsorContact').value = '';
        document.getElementById('sponsorEmail').value = '';
        
        alert('Sponsor added successfully!');
    } catch (error) {
        console.error('Error adding sponsor:', error);
        alert('Error adding sponsor. Please try again.');
    }
}

// Announcement system
function showAnnouncementModal() {
    showModal('announcementModal');
}

async function makeAnnouncement() {
    const title = document.getElementById('announcementTitle').value;
    const message = document.getElementById('announcementMessage').value;
    const type = document.getElementById('announcementType').value;

    if (!title || !message) {
        alert('Please fill in all fields!');
        return;
    }

    try {
        // Add to recent activities
        await window.firebaseOperations.addActivity({
            action: `📢 ${type.charAt(0).toUpperCase() + type.slice(1)} announcement`,
            details: title,
            time: 'Just now'
        });

        hideModal('announcementModal');
        if (currentPage === 'dashboard') updateRecentActivity();
        
        // Clear form
        document.getElementById('announcementTitle').value = '';
        document.getElementById('announcementMessage').value = '';
        document.getElementById('announcementType').value = 'info';
        
        alert('Announcement sent successfully to all users!');
    } catch (error) {
        console.error('Error making announcement:', error);
        alert('Error making announcement. Please try again.');
    }
}

function generateReport() {
    const reportData = {
        totalEvents: window.events.length,
        totalStudents: new Set([].concat(...window.events.map(e => e.enrolledStudents.map(s => s.name)))).size,
        totalBudget: window.events.reduce((sum, e) => sum + (e.budget || 0), 0),
        totalSponsors: window.sponsors.length,
        totalSponsorAmount: window.sponsors.reduce((sum, s) => sum + s.amount, 0),
        totalRevenue: window.events.reduce((sum, e) => 
            sum + e.enrolledStudents.reduce((eSum, s) => 
                eSum + (s.paymentStatus === 'paid' ? s.amount : 0), 0), 0)
    };
    
    alert(`📊 COMPREHENSIVE MANAGEMENT REPORT\n\n` +
          `📅 Total Events: ${reportData.totalEvents}\n` +
          `👥 Unique Students: ${reportData.totalStudents}\n` +
          `💰 Total Event Budget: ₹${reportData.totalBudget.toLocaleString()}\n` +
          `💵 Revenue Collected: ₹${reportData.totalRevenue.toLocaleString()}\n` +
          `🤝 Total Sponsors: ${reportData.totalSponsors}\n` +
          `💰 Sponsor Contributions: ₹${reportData.totalSponsorAmount.toLocaleString()}\n\n` +
          `Report generated on ${new Date().toLocaleDateString()}`);
}

function exportFinancialReport() {
    const totalRevenue = window.events.reduce((sum, e) => 
        sum + e.enrolledStudents.reduce((eSum, s) => 
            eSum + (s.paymentStatus === 'paid' ? s.amount : 0), 0), 0);
    const totalPending = window.events.reduce((sum, e) => 
        sum + e.enrolledStudents.reduce((eSum, s) => 
            eSum + (s.paymentStatus === 'pending' ? s.amount : 0), 0), 0);
    
    alert(`📊 FINANCIAL REPORT EXPORTED\n\n` +
          `💰 Total Revenue: ₹${totalRevenue.toLocaleString()}\n` +
          `⏳ Pending Payments: ₹${totalPending.toLocaleString()}\n` +
          `🤝 Sponsor Funding: ₹${window.sponsors.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}\n\n` +
          `The detailed financial report has been exported successfully!`);
}

// Modal management (unchanged)
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Event enrollment with sponsor video (modified to use Firebase)
async function enrollInEvent(eventId) {
    console.log('Enrolling in event:', eventId);
    
    if (!currentUser || currentUserType !== 'student') {
        alert('Please log in as a student to enroll in events!');
        return;
    }

    const event = window.events.find(e => e.id === eventId);
    if (!event) return;

    // Check if already enrolled
    if (event.enrolledStudents.some(s => s.name === currentUser)) {
        alert('You are already enrolled in this event!');
        return;
    }

    if (event.enrolledStudents.length >= event.maxParticipants) {
        alert('Sorry, this event is full!');
        return;
    }

    currentEnrollingEventId = eventId;
    showSponsorVideo();
}

function showSponsorVideo() {
    console.log('Showing sponsor video...');
    
    const randomVideo = sponsorVideos[Math.floor(Math.random() * sponsorVideos.length)];
    const video = document.getElementById('sponsorVideo');
    const modal = document.getElementById('sponsorVideoModal');
    
    if (video && modal) {
        video.src = randomVideo;
        video.load();
        
        showModal('sponsorVideoModal');
        document.getElementById('skipVideoBtn').style.display = 'block';
        document.getElementById('continueBtn').style.display = 'none';
        
        // Start countdown
        skipCountdown = 5;
        const skipBtn = document.getElementById('skipVideoBtn');
        skipBtn.disabled = true;
        skipBtn.textContent = `Skip Video (${skipCountdown}s)`;
        
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            skipCountdown--;
            if (skipCountdown > 0) {
                skipBtn.textContent = `Skip Video (${skipCountdown}s)`;
            } else {
                skipBtn.textContent = 'Skip Video';
                skipBtn.disabled = false;
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        // Try to auto-play
        video.play().catch(error => {
            console.log('Auto-play prevented:', error);
        });
        
        // Video end handler
        video.onended = function() {
            if (countdownInterval) clearInterval(countdownInterval);
            document.getElementById('skipVideoBtn').style.display = 'none';
            document.getElementById('continueBtn').style.display = 'block';
        };
    }
}

function skipSponsorVideo() {
    const skipBtn = document.getElementById('skipVideoBtn');
    if (!skipBtn.disabled) {
        completeEnrollment();
    }
}

async function completeEnrollment() {
    console.log('Completing enrollment...');
    
    const video = document.getElementById('sponsorVideo');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    hideModal('sponsorVideoModal');
    
    try {
        const event = window.events.find(e => e.id === currentEnrollingEventId);
        if (event) {
            // Add student with payment info
            const newStudent = {
                name: currentUser,
                enrollDate: new Date().toISOString().split('T')[0],
                paymentStatus: event.fee > 0 ? 'pending' : 'free',
                amount: event.fee || 0
            };
            
            event.enrolledStudents.push(newStudent);
            
            // Update in Firebase
            await window.firebaseOperations.updateEvent(currentEnrollingEventId, {
                enrolledStudents: event.enrolledStudents
            });
            
            // Add to recent activities
            await window.firebaseOperations.addActivity({
                action: "New student enrolled",
                details: `${currentUser} enrolled in ${event.title}`,
                time: 'Just now'
            });
            
            updateEventsList();
            
            setTimeout(() => {
                showEnrollmentSuccess(event);
            }, 300);
        }
    } catch (error) {
        console.error('Error completing enrollment:', error);
        alert('Error completing enrollment. Please try again.');
    }
    
    currentEnrollingEventId = null;
}

function showEnrollmentSuccess(event) {
    const title = document.getElementById('enrolledEventTitle');
    const details = document.getElementById('enrolledEventDetails');
    const qrContainer = document.getElementById('qrCodeContainer');

    if (title && details && qrContainer) {
        title.textContent = event.title;
        details.innerHTML = `
            <strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}<br>
            <strong>📍 Location:</strong> ${event.location}<br>
            <strong>💰 Fee:</strong> ${event.fee > 0 ? `₹${event.fee}` : 'Free'}<br>
            <strong>👥 Participants:</strong> ${event.enrolledStudents.length}/${event.maxParticipants}
        `;

        const qrData = {
            event: event.title,
            date: event.date,
            location: event.location,
            user: currentUser,
            timestamp: new Date().toISOString()
        };

        qrContainer.innerHTML = ""; // Clear old QR code
        new QRCode(qrContainer, {
            text: JSON.stringify(qrData),
            width: 256,
            height: 256
        });

        showModal('enrollmentSuccessModal');
    }
}

async function unenrollFromEvent(eventId) {
    if (!currentUser || currentUserType !== 'student') {
        alert('Please log in as a student to unenroll from events!');
        return;
    }

    try {
        const event = window.events.find(e => e.id === eventId);
        if (!event) return;

        const index = event.enrolledStudents.findIndex(s => s.name === currentUser);
        if (index > -1) {
            event.enrolledStudents.splice(index, 1);
            
            // Update in Firebase
            await window.firebaseOperations.updateEvent(eventId, {
                enrolledStudents: event.enrolledStudents
            });
            
            // Add to recent activities
            await window.firebaseOperations.addActivity({
                action: "Student unenrolled",
                details: `${currentUser} unenrolled from ${event.title}`,
                time: 'Just now'
            });
            
            updateEventsList();
            updateEnrolledEvents();
            alert('Successfully unenrolled from the event!');
        }
    } catch (error) {
        console.error('Error unenrolling from event:', error);
        alert('Error unenrolling from event. Please try again.');
    }
}

function toggleParticipantsList(eventId) {
    const participantsList = document.getElementById(`participants-${eventId}`);
    if (participantsList) {
        participantsList.classList.toggle('hidden');
    }
}

async function removeParticipant(eventId, studentName) {
    if (currentUserType !== 'secretary' && currentUserType !== 'management') {
        alert('Only secretaries and management can remove participants!');
        return;
    }

    if (confirm(`Are you sure you want to remove ${studentName} from this event?`)) {
        try {
            const event = window.events.find(e => e.id === eventId);
            if (event) {
                const index = event.enrolledStudents.findIndex(s => s.name === studentName);
                if (index > -1) {
                    event.enrolledStudents.splice(index, 1);
                    
                    // Update in Firebase
                    await window.firebaseOperations.updateEvent(eventId, {
                        enrolledStudents: event.enrolledStudents
                    });
                    
                    updateEventsList();
                }
            }
        } catch (error) {
            console.error('Error removing participant:', error);
            alert('Error removing participant. Please try again.');
        }
    }
}

// Event management (modified to use Firebase)
function showAddEventModal() {
    if (currentUserType !== 'secretary' && currentUserType !== 'management') {
        alert('Only secretaries and management can add events!');
        return;
    }
    showModal('addEventModal');
}

function clearAddEventForm() {
    const fields = ['eventTitle', 'eventDate', 'eventDescription', 'eventLocation', 'eventMaxParticipants', 'eventFee', 'eventPosterInput'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    const preview = document.getElementById('eventPosterPreview');
    if (preview) preview.innerHTML = '';
}

async function addEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const description = document.getElementById('eventDescription').value;
    const location = document.getElementById('eventLocation').value;
    const maxParticipants = parseInt(document.getElementById('eventMaxParticipants').value) || 100;
    const fee = parseInt(document.getElementById('eventFee').value) || 0;
    const posterInput = document.getElementById('eventPosterInput');

    if (!title || !date || !description || !location) {
        alert('Please fill in all required fields!');
        return;
    }

    async function createEvent(posterUrl = '') {
        try {
            const newEventData = {
                title: title,
                date: date,
                description: description,
                location: location,
                maxParticipants: maxParticipants,
                enrolledStudents: [],
                poster: posterUrl,
                budget: fee * maxParticipants,
                status: 'upcoming',
                fee: fee
            };

            await window.firebaseOperations.addEvent(newEventData);
            
            // Add to recent activities
            await window.firebaseOperations.addActivity({
                action: "Event created",
                details: `${title} has been scheduled for ${new Date(date).toLocaleDateString()}`,
                time: 'Just now'
            });
            
            updateEventsList();
            if (currentPage === 'manage-events') updateEventManagement();
            if (currentPage === 'dashboard') updateRecentActivity();
            hideModal('addEventModal');
            clearAddEventForm();
            console.log('Event added successfully');
            alert('Event created successfully!');
        } catch (error) {
            console.error('Error adding event:', error);
            alert('Error creating event. Please try again.');
        }
    }

    if (posterInput && posterInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            createEvent(e.target.result);
        };
        reader.readAsDataURL(posterInput.files[0]);
    } else {
        createEvent();
    }
}

function showEditEventModal(eventId) {
    if (currentUserType !== 'secretary' && currentUserType !== 'management') {
        alert('Only secretaries and management can edit events!');
        return;
    }
    
    const event = window.events.find(e => e.id === eventId);
    if (!event) return;

    currentEditingEventId = eventId;
    
    document.getElementById('editEventTitle').value = event.title;
    document.getElementById('editEventDate').value = event.date;
    document.getElementById('editEventDescription').value = event.description;
    document.getElementById('editEventLocation').value = event.location;
    document.getElementById('editEventMaxParticipants').value = event.maxParticipants;
    document.getElementById('editEventFee').value = event.fee || 0;
    
    const previewDiv = document.getElementById('editEventPosterPreview');
    if (previewDiv) {
        if (event.poster) {
            previewDiv.innerHTML = `
                <div class="image-preview-container">
                    <img src="${event.poster}" alt="Current Event Poster" class="image-preview">
                    <button type="button" class="remove-image-btn" onclick="removeImage('editEventPosterInput', 'editEventPosterPreview')">&times;</button>
                </div>
            `;
        } else {
            previewDiv.innerHTML = '';
        }
    }
    
    showModal('editEventModal');
}

async function updateEvent() {
    const title = document.getElementById('editEventTitle').value;
    const date = document.getElementById('editEventDate').value;
    const description = document.getElementById('editEventDescription').value;
    const location = document.getElementById('editEventLocation').value;
    const maxParticipants = parseInt(document.getElementById('editEventMaxParticipants').value) || 100;
    const fee = parseInt(document.getElementById('editEventFee').value) || 0;
    const posterInput = document.getElementById('editEventPosterInput');

    if (!title || !date || !description || !location) {
        alert('Please fill in all fields!');
        return;
    }

    const eventIndex = window.events.findIndex(e => e.id === currentEditingEventId);
    if (eventIndex !== -1) {
        async function updateEventData(posterUrl = null) {
            try {
                const updatedData = {
                    title: title,
                    date: date,
                    description: description,
                    location: location,
                    maxParticipants: maxParticipants,
                    fee: fee,
                    poster: posterUrl !== null ? posterUrl : window.events[eventIndex].poster
                };
                
                // Update local data
                window.events[eventIndex] = {
                    ...window.events[eventIndex],
                    ...updatedData
                };
                
                // Update in Firebase
                await window.firebaseOperations.updateEvent(currentEditingEventId, updatedData);
                
                // Add to recent activities
                await window.firebaseOperations.addActivity({
                    action: "Event updated",
                    details: `${title} details have been modified`,
                    time: 'Just now'
                });
                
                updateEventsList();
                if (currentPage === 'manage-events') updateEventManagement();
                if (currentPage === 'dashboard') updateRecentActivity();
                hideModal('editEventModal');
                currentEditingEventId = null;
                console.log('Event updated successfully');
                alert('Event updated successfully!');
            } catch (error) {
                console.error('Error updating event:', error);
                alert('Error updating event. Please try again.');
            }
        }

        if (posterInput && posterInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updateEventData(e.target.result);
            };
            reader.readAsDataURL(posterInput.files[0]);
        } else {
            updateEventData();
        }
    }
}

async function deleteEvent(eventId) {
    if (currentUserType !== 'secretary' && currentUserType !== 'management') {
        alert('Only secretaries and management can delete events!');
        return;
    }
    
    const event = window.events.find(e => e.id === eventId);
    if (!event) return;
    
    if (confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
        try {
            await window.firebaseOperations.deleteEvent(eventId);
            
            // Add to recent activities
            await window.firebaseOperations.addActivity({
                action: "Event deleted",
                details: `${event.title} has been removed from the system`,
                time: 'Just now'
            });
            
            updateEventsList();
            if (currentPage === 'manage-events') updateEventManagement();
            if (currentPage === 'dashboard') updateRecentActivity();
            console.log('Event deleted:', eventId);
            alert('Event deleted successfully!');
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Error deleting event. Please try again.');
        }
    }
}

function updateEventsList() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    if (window.events.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #666;">No events scheduled at the moment.</p>';
        return;
    }

    eventsList.innerHTML = window.events.map(event => {
        const isEnrolled = currentUser && event.enrolledStudents.some(s => s.name === currentUser);
        const isFull = event.enrolledStudents.length >= event.maxParticipants;
        const canEnroll = currentUser && currentUserType === 'student' && !isEnrolled && !isFull;
        const canUnenroll = currentUser && currentUserType === 'student' && isEnrolled;
        
        let enrollmentStatusClass = 'enrollment-status';
        let enrollmentStatusText = `👥 ${event.enrolledStudents.length}/${event.maxParticipants} enrolled`;
        
        if (isFull) {
            enrollmentStatusClass = 'enrollment-full';
            enrollmentStatusText = '🚫 Event Full';
        } else if (isEnrolled) {
            enrollmentStatusClass = 'enrollment-enrolled';
            enrollmentStatusText = '✅ You are enrolled';
        }

        return `
            <div class="event-card">
                ${event.poster ? 
                    `<img src="${event.poster}" alt="${event.title} Poster" class="event-poster" onclick="showEventPosterModal('${event.poster}')">` : 
                    `<div class="event-poster-placeholder">📅 Event Poster</div>`
                }
                
                <div class="event-header">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${new Date(event.date).toLocaleDateString()}</div>
                </div>
                <div class="event-description">${event.description}</div>
                <div style="margin-bottom: 15px; color: #667eea; font-weight: 500;">
                    📍 ${event.location} ${event.fee > 0 ? `| 💰 Fee: ₹${event.fee}` : '| 🆓 Free Event'}
                </div>
                
                <div class="${enrollmentStatusClass}">
                    <span>${enrollmentStatusText}</span>
                </div>
                
                <div class="event-actions">
                    ${canEnroll ? `<button class="btn btn-success" onclick="enrollInEvent('${event.id}')">Enroll Now</button>` : ''}
                    ${canUnenroll ? `<button class="btn btn-warning" onclick="unenrollFromEvent('${event.id}')">Unenroll</button>` : ''}
                    ${(currentUserType === 'secretary' || currentUserType === 'management') ? `
                        <button class="btn" onclick="showEditEventModal('${event.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
                        <button class="btn btn-secondary" onclick="toggleParticipantsList('${event.id}')">View Participants</button>
                    ` : ''}
                </div>
                
                ${(currentUserType === 'secretary' || currentUserType === 'management') ? `
                    <div id="participants-${event.id}" class="participants-list hidden">
                        <h4 style="margin-bottom: 10px;">Enrolled Participants (${event.enrolledStudents.length}/${event.maxParticipants})</h4>
                        ${event.enrolledStudents.length > 0 ? 
                            event.enrolledStudents.map(student => `
                                <div class="participant-item">
                                    <span>${student.name} ${student.paymentStatus === 'pending' ? '(Payment Pending)' : student.paymentStatus === 'paid' ? '(Paid)' : ''}</span>
                                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="removeParticipant('${event.id}', '${student.name}')">Remove</button>
                                </div>
                            `).join('') : 
                            '<p style="color: #666; text-align: center;">No participants enrolled yet.</p>'
                        }
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function updateEnrolledEvents() {
    const list = document.getElementById('enrolledEventsList');
    if (!list || !currentUser) return;

    const enrolledEvents = window.events.filter(e => e.enrolledStudents.some(s => s.name === currentUser));

    if (enrolledEvents.length === 0) {
        list.innerHTML = '<p style="color: #666;">You are not enrolled in any events yet.</p>';
        return;
    }

    list.innerHTML = enrolledEvents.map((event, index) => {
        const qrId = `qr-code-${event.id}-${index}`;
        const userEnrollment = event.enrolledStudents.find(s => s.name === currentUser);
        
        return `
            <div class="event-card">
                ${event.poster ? `<img src="${event.poster}" class="event-poster" alt="Poster" onclick="showEventPosterModal('${event.poster}')">` : ''}
                <div class="event-title">${event.title}</div>
                <div style="color:#667eea;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</div>
                <div style="color:#444;"><strong>Location:</strong> ${event.location}</div>
                <div style="color:#444;"><strong>Fee:</strong> ${event.fee > 0 ? `₹${event.fee}` : 'Free'}</div>
                ${userEnrollment && userEnrollment.paymentStatus === 'pending' ? 
                    `<div style="color:#ffc107; font-weight: bold;">⚠️ Payment Pending: ₹${userEnrollment.amount}</div>` : ''
                }
                <div class="event-description">${event.description}</div>
                <div id="${qrId}" style="margin-top: 15px;"></div>
                <p style="font-size: 14px; color: #999;">Scan this QR at the event venue to verify your booking.</p>
            </div>
        `;
    }).join('');

    // Generate QR codes after DOM is updated
    enrolledEvents.forEach((event, index) => {
        const qrId = `qr-code-${event.id}-${index}`;
        const qrContainer = document.getElementById(qrId);

        if (qrContainer) {
            const qrData = {
                event: event.title,
                date: event.date,
                location: event.location,
                user: currentUser,
                timestamp: new Date().toISOString()
            };

            new QRCode(qrContainer, {
                text: JSON.stringify(qrData),
                width: 200,
                height: 200
            });
        }
    });
}

// Gallery functionality (modified to use Firebase)
function showAddPhotoModal() {
    if (currentUserType !== 'secretary' && currentUserType !== 'management') {
        alert('Only secretaries and management can upload photos!');
        return;
    }
    showModal('addPhotoModal');
}

async function addPhoto() {
    const title = document.getElementById('photoTitle').value;
    const description = document.getElementById('photoDescription').value;
    const category = document.getElementById('photoCategory').value;
    const photoInput = document.getElementById('photoUploadInput');

    if (!title || !description || !photoInput.files[0]) {
        alert('Please fill in all fields and select a photo!');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const newPhotoData = {
                title: title,
                description: description,
                category: category,
                image: e.target.result,
                uploadedBy: currentUser,
                uploadDate: new Date().toISOString().split('T')[0]
            };

            await window.firebaseOperations.addPhoto(newPhotoData);
            
            // Add to recent activities
            await window.firebaseOperations.addActivity({
                action: "Photo uploaded",
                details: `${title} added to gallery`,
                time: 'Just now'
            });
            
            updateGalleryList();
            if (currentPage === 'dashboard') updateRecentActivity();
            hideModal('addPhotoModal');
            clearAddPhotoForm();
            console.log('Photo added successfully');
            alert('Photo uploaded successfully!');
        } catch (error) {
            console.error('Error adding photo:', error);
            alert('Error uploading photo. Please try again.');
        }
    };
    reader.readAsDataURL(photoInput.files[0]);
}

function clearAddPhotoForm() {
    document.getElementById('photoTitle').value = '';
    document.getElementById('photoDescription').value = '';
    document.getElementById('photoCategory').value = 'events';
    document.getElementById('photoUploadInput').value = '';
    document.getElementById('photoUploadPreview').innerHTML = '';
}

async function deletePhoto(photoId) {
    if (currentUserType !== 'secretary' && currentUserType !== 'management') {
        alert('Only secretaries and management can delete photos!');
        return;
    }
    
    if (confirm('Are you sure you want to delete this photo?')) {
        try {
            await window.firebaseOperations.deletePhoto(photoId);
            updateGalleryList();
            console.log('Photo deleted:', photoId);
            alert('Photo deleted successfully!');
        } catch (error) {
            console.error('Error deleting photo:', error);
            alert('Error deleting photo. Please try again.');
        }
    }
}

function updateGalleryList() {
    const galleryList = document.getElementById('galleryList');
    if (!galleryList) return;
    
    if (window.galleryPhotos.length === 0) {
        galleryList.innerHTML = '<p style="text-align: center; color: #666;">No photos uploaded yet.</p>';
        return;
    }

    galleryList.innerHTML = `
        <div class="gallery-grid">
            ${window.galleryPhotos.map(photo => `
                <div class="gallery-item">
                    <img src="${photo.image}" alt="${photo.title}" class="gallery-image" onclick="showEventPosterModal('${photo.image}')">
                    <div class="gallery-info">
                        <div class="gallery-title">${photo.title}</div>
                        <div class="gallery-description">${photo.description}</div>
                        <div class="gallery-meta">
                            <span>📂 ${photo.category}</span>
                            <span>📅 ${new Date(photo.uploadDate).toLocaleDateString()}</span>
                        </div>
                        ${(currentUserType === 'secretary' || currentUserType === 'management') ? `
                            <div class="gallery-actions">
                                <button class="btn btn-danger" style="padding: 8px 16px; font-size: 14px;" onclick="deletePhoto('${photo.id}')">Delete</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Image handling (unchanged)
function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file && preview) {
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            input.value = '';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div class="image-preview-container">
                    <img src="${e.target.result}" alt="Preview" class="image-preview">
                    <button type="button" class="remove-image-btn" onclick="removeImage('${inputId}', '${previewId}')">&times;</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (input) input.value = '';
    if (preview) preview.innerHTML = '';
}

function showEventPosterModal(posterSrc) {
    const modal = document.getElementById('eventPosterModal');
    const image = document.getElementById('eventPosterModalImage');
    if (modal && image) {
        image.src = posterSrc;
        modal.style.display = 'block';
    }
}

// Feedback management (modified to use Firebase)
async function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText');
    if (!feedbackText || !feedbackText.value.trim()) {
        alert('Please enter your feedback!');
        return;
    }

    try {
        const newFeedbackData = {
            author: currentUser ? currentUser : 'Anonymous',
            text: feedbackText.value,
            date: new Date().toISOString().split('T')[0]
        };

        await window.firebaseOperations.addFeedback(newFeedbackData);
        
        // Add to recent activities
        await window.firebaseOperations.addActivity({
            action: "Feedback received",
            details: `New feedback from ${newFeedbackData.author}`,
            time: 'Just now'
        });
        
        updateFeedbackList();
        if (currentPage === 'dashboard') updateRecentActivity();
        feedbackText.value = '';
        console.log('Feedback submitted successfully');
        alert('Thank you for your feedback!');
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback. Please try again.');
    }
}

function updateFeedbackList() {
    const feedbackList = document.getElementById('feedbackList');
    if (!feedbackList) return;
    
    if (window.feedbacks.length === 0) {
        feedbackList.innerHTML = '<p style="text-align: center; color: #666;">No feedback yet.</p>';
        return;
    }

    feedbackList.innerHTML = window.feedbacks.map(feedback => `
        <div class="feedback-item">
            <div class="feedback-header">
                <div class="feedback-author">${feedback.author}</div>
                <div class="feedback-date">${new Date(feedback.date).toLocaleDateString()}</div>
            </div>
            <div>${feedback.text}</div>
        </div>
    `).join('');
}

// QR Scanner functionality (unchanged - works with client-side data)
function initializeScanner() {
    const resultContainer = document.getElementById('scanResult');
    const startBtn = document.getElementById('startScannerBtn');
    const stopBtn = document.getElementById('stopScannerBtn');
    
    if (isScanning) {
        return;
    }

    resultContainer.innerHTML = "📷 Requesting camera permission...";
    startBtn.style.display = 'none';
    
    try {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.stop().then(() => {
                html5QrcodeScanner.clear();
                html5QrcodeScanner = null;
                startScanning();
            }).catch(err => {
                console.error("Error stopping previous scanner:", err);
                startScanning();
            });
        } else {
            startScanning();
        }
    } catch (error) {
        console.error("Error initializing scanner:", error);
        resultContainer.innerHTML = `<p style="color: red;">❌ Error: ${error.message}</p>`;
        startBtn.style.display = 'block';
    }

    function startScanning() {
        html5QrcodeScanner = new Html5Qrcode("reader");
        
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        html5QrcodeScanner.start(
            { facingMode: "environment" },
            config,
            (qrCodeMessage) => {
                try {
                    resultContainer.innerHTML = "🔍 Verifying QR code...";
                    
                    const data = JSON.parse(qrCodeMessage);
                    const matchedEvent = window.events.find(ev => 
                        ev.title === data.event &&
                        ev.date === data.date &&
                        ev.location === data.location &&
                        ev.enrolledStudents.some(s => s.name === data.user)
                    );

                    if (matchedEvent) {
                        resultContainer.innerHTML = `
                            <div style="color: green; text-align: center;">
                                <h3>✅ QR Code Verified!</h3>
                                <p><strong>Event:</strong> ${data.event}</p>
                                <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
                                <p><strong>Location:</strong> ${data.location}</p>
                                <p><strong>Student:</strong> ${data.user}</p>
                                <p><strong>Verified at:</strong> ${new Date().toLocaleString()}</p>
                                <div style="background: rgba(40, 167, 69, 0.1); padding: 15px; border-radius: 10px; margin-top: 15px;">
                                    <p style="color: #28a745; margin: 0;">Student is enrolled and verified for this event!</p>
                                </div>
                            </div>
                        `;
                    } else {
                        resultContainer.innerHTML = `
                            <div style="color: red; text-align: center;">
                                <h3>❌ Invalid QR Code</h3>
                                <p>This QR code is either not genuine or the student is not enrolled in the specified event.</p>
                                <div style="background: rgba(220, 53, 69, 0.1); padding: 15px; border-radius: 10px; margin-top: 15px;">
                                    <p style="color: #dc3545; margin: 0;">Access denied!</p>
                                </div>
                            </div>
                        `;
                    }
                } catch (err) {
                    console.error("Error parsing QR code:", err);
                    resultContainer.innerHTML = `
                        <div style="color: red; text-align: center;">
                            <h3>❌ Invalid QR Code Format</h3>
                            <p>This QR code is not a valid student enrollment code.</p>
                        </div>
                    `;
                }
            },
            (errorMessage) => {
                // Scanning in progress - don't show errors
            }
        ).then(() => {
            console.log("QR Code scanner started successfully.");
            isScanning = true;
            stopBtn.style.display = 'block';
            resultContainer.innerHTML = "📱 Scanner active - Point camera at QR code";
        }).catch(err => {
            console.error("Unable to start scanning:", err);
            isScanning = false;
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
            
            if (err.name === 'NotAllowedError') {
                resultContainer.innerHTML = `
                    <div style="color: red; text-align: center;">
                        <h3>📷 Camera Permission Denied</h3>
                        <p>Please allow camera access and try again.</p>
                        <p style="font-size: 14px; color: #666;">You may need to refresh the page and grant permission.</p>
                    </div>
                `;
            } else {
                resultContainer.innerHTML = `
                    <div style="color: red; text-align: center;">
                        <h3>❌ Camera Error</h3>
                        <p>Unable to access camera: ${err.message}</p>
                        <p style="font-size: 14px; color: #666;">Please check camera permissions and try again.</p>
                    </div>
                `;
            }
        });
    }
}

function stopScanner() {
    const resultContainer = document.getElementById('scanResult');
    const startBtn = document.getElementById('startScannerBtn');
    const stopBtn = document.getElementById('stopScannerBtn');
    
    if (html5QrcodeScanner && isScanning) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
            isScanning = false;
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
            resultContainer.innerHTML = 'Scanner stopped. Click "Start Camera" to begin scanning QR codes';
            console.log("QR Code scanner stopped.");
        }).catch(err => {
            console.error("Error stopping scanner:", err);
            isScanning = false;
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        });
    }
}

// Close modals when clicking outside (unchanged)
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Initialize when page loads (unchanged)
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);