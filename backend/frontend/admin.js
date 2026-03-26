// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadDashboardData();
}

function setupEventListeners() {
    // Login form
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

async function checkAuth() {
    try {
        console.log('Checking authentication...');
        const response = await fetch('/api/admin/stats', {
            credentials: 'include'
        });
        
        console.log('Auth check response status:', response.status);
        
        if (response.ok) {
            console.log('User is authenticated, showing dashboard');
            showDashboard();
        } else if (response.status === 401) {
            console.log('User not authenticated, showing login');
            showLogin();
        } else {
            console.error('Unexpected auth check response:', response.status);
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    console.log('Attempting login with:', loginData.username);
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(loginData)
        });
        
        console.log('Login response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Login result:', result);
        
        if (result.success) {
            showToast('Login successful!', 'success');
            setTimeout(() => {
                showDashboard();
            }, 500);
        } else {
            showToast('Login failed: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login error: ' + error.message, 'error');
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/admin/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            showToast('Logout successful', 'success');
            showLogin();
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout error', 'error');
    }
}

async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/stats', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('totalEnrollments').textContent = data.total || 0;
            document.getElementById('pendingEnrollments').textContent = data.pending || 0;
            document.getElementById('approvedEnrollments').textContent = data.approved || 0;
        }
        
        // Load enrollments
        loadEnrollments();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadEnrollments() {
    try {
        const response = await fetch('/api/admin/enrollments', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const enrollmentsList = document.getElementById('enrollmentsList');
            
            if (data.data && data.data.length > 0) {
                enrollmentsList.innerHTML = data.data.map(enrollment => `
                    <div class="enrollment-item">
                        <h4>${enrollment.name}</h4>
                        <p>Phone: ${enrollment.phone}</p>
                        <p>Course: ${enrollment.course}</p>
                        <p>Status: <span class="status ${enrollment.status}">${enrollment.status}</span></p>
                        <div class="actions">
                            <button onclick="updateStatus(${enrollment.id}, 'approved')" class="approve-btn">Approve</button>
                            <button onclick="updateStatus(${enrollment.id}, 'rejected')" class="reject-btn">Reject</button>
                        </div>
                    </div>
                `).join('');
            } else {
                enrollmentsList.innerHTML = '<p>No enrollments found</p>';
            }
        }
    } catch (error) {
        console.error('Error loading enrollments:', error);
    }
}

async function updateStatus(id, status) {
    try {
        const response = await fetch(`/api/admin/enrollments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showToast('Status updated successfully', 'success');
            loadEnrollments();
            loadDashboardData();
        } else {
            showToast('Error updating status', 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Error updating status', 'error');
    }
}
