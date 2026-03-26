// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (session-based)
    authenticatedFetch('/api/admin/stats')
    .then(response => {
        if (response.ok) {
            showDashboard();
        } else {
            showLogin();
        }
    })
    .catch(error => {
        showLogin();
    });
    
    setupEventListeners();
});

// ── Toast Notification ───────────────────────────────────────
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ── Authentication ─────────────────────────────────────────
function showLogin() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadDashboardData();
}

// ── Login Handler ───────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const submitBtn = e.target.querySelector('.login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for session cookies
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            
            showToast('Login successful! Welcome back.', 'success');
            showDashboard();
        } else {
            showToast(data.message || 'Invalid credentials. Please try again.', 'error');
        }
    } catch (error) {
        showToast('Login error. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// ── Logout Handler ───────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/api/admin/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        showToast('Logout successful', 'success');
        showLogin();
        document.getElementById('loginForm').reset();
    } catch (error) {
        showToast('Logout error', 'error');
    }
});

function setupEventListeners() {
    // Login form
    // document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    
    // Logout button
    // document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

async function checkAuth() {
    try {
        // Test if session is valid
        const response = await fetch('/api/admin/stats', {
            credentials: 'include'
        });
        
        if (response.ok) {
            showDashboard();
        } else {
            showLogin();
        }
        
    } catch (error) {
        showLogin();
    }
}

// ─── Helper for Authenticated API Calls ─────────────────────────
async function authenticatedFetch(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include', // Important for session cookies
        ...options
    });
    
    if (response.status === 401) {
        showLogin();
        throw new Error('Authentication failed');
    }
    
    return response;
}

// ─── Dashboard Data Loading ───────────────────────────────────
async function loadDashboardData() {
    try {
        const response = await authenticatedFetch('/api/admin/stats');
        
        if (response.ok) {
            const data = await response.json();
            
            // Animate stat numbers
            animateValue('totalEnrollments', 0, data.total || 0, 1500);
            animateValue('pendingEnrollments', 0, data.pending || 0, 1500);
            animateValue('approvedEnrollments', 0, data.approved || 0, 1500);
            animateValue('totalContacts', 0, data.contacts || 0, 1500);
        } else {
        }
        
        // Load enrollments and contacts
        loadEnrollments();
        loadContacts();
    } catch (error) {
    }
}

// ─── Animated Counter ─────────────────────────────────────────
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ─── Load Enrollments ─────────────────────────────────────────
async function loadEnrollments() {
    try {
        const response = await authenticatedFetch('/api/admin/enrollments');
        
        if (response.ok) {
            const data = await response.json();
            const enrollmentsList = document.getElementById('enrollmentsList');
            
            if (data.data && data.data.length > 0) {
                enrollmentsList.innerHTML = data.data.map((enrollment, index) => `
                    <div class="enrollment-item" style="animation: fadeUp 0.6s ease both; animation-delay: ${index * 0.1}s">
                        <h4>${enrollment.name}</h4>
                        <p><strong>Phone:</strong> ${enrollment.phone}</p>
                        <p><strong>Course:</strong> ${enrollment.course}</p>
                        <p><strong>Status:</strong> <span class="status ${enrollment.status}">${enrollment.status}</span></p>
                        <p><small><em>Submitted: ${new Date(enrollment.created_at).toLocaleDateString()}</em></small></p>
                        ${enrollment.status === 'pending' ? `
                            <div class="actions">
                                <button onclick="updateStatus(${enrollment.id}, 'approved')" class="approve-btn">✓ Approve</button>
                                <button onclick="updateStatus(${enrollment.id}, 'rejected')" class="reject-btn">✕ Reject</button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            } else {
                enrollmentsList.innerHTML = '<p style="text-align: center; color: #666;">No enrollments found.</p>';
            }
        } else {
            document.getElementById('enrollmentsList').innerHTML = '<p style="text-align: center; color: #dc3545;">Error loading enrollments.</p>';
        }
    } catch (error) {
        document.getElementById('enrollmentsList').innerHTML = '<p style="text-align: center; color: #dc3545;">Error loading enrollments.</p>';
    }
}

// ─── Load Contacts ───────────────────────────────────────────
async function loadContacts() {
    try {
        const response = await authenticatedFetch('/api/admin/contacts');
        
        if (response.ok) {
            const data = await response.json();
            const contactsList = document.getElementById('contactsList');
            
            if (data.data && data.data.length > 0) {
                contactsList.innerHTML = data.data.map((contact, index) => `
                    <div class="contact-item" style="animation: fadeUp 0.6s ease both; animation-delay: ${index * 0.1}s">
                        <h4>${contact.name}</h4>
                        <p><strong>Email:</strong> ${contact.email}</p>
                        <p class="message">${contact.message}</p>
                        <p><small><em>Received: ${new Date(contact.created_at).toLocaleDateString()}</em></small></p>
                    </div>
                `).join('');
            } else {
                contactsList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">No contact messages found</p>';
            }
        } else {
        }
    } catch (error) {
    }
}

// ─── Update Enrollment Status ───────────────────────────────────
async function updateStatus(id, status) {
    try {
        
        const response = await authenticatedFetch(`/api/admin/enrollments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showToast(`Enrollment ${status} successfully!`, 'success');
            // Refresh all data
            loadDashboardData();
        } else {
            showToast('Error updating status', 'error');
        }
    } catch (error) {
        showToast('Error updating status', 'error');
    }
}

// ─── Navbar Scroll Effect ───────────────────────────────────────
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.admin-navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
});

// ─── Initialize on Load ───────────────────────────────────────────
// This is handled by the DOMContentLoaded listener at the top of the file
