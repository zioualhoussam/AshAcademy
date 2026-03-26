// Main website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Enrollment form
    const enrollmentForm = document.getElementById('enrollmentForm');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', handleEnrollment);
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

async function handleEnrollment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const enrollmentData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        course: formData.get('course')
    };
    
    try {
        const response = await fetch('/api/enroll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(enrollmentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Enrollment submitted successfully! We will contact you soon.');
            e.target.reset();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        alert('Error submitting enrollment. Please try again.');
    }
}
