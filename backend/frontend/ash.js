// ── Page Navigation ──────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav a[data-page]').forEach(a => a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const nav = document.querySelector(`nav a[data-page="${id}"]`);
  if (nav) nav.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Sticky Header ────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile Menu ──────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('#mobile-menu') && !e.target.closest('.hamburger')) {
    document.getElementById('mobile-menu').classList.remove('open');
  }
});

// ── Enroll Modal ─────────────────────────────────────────────
function openEnroll() {
  document.getElementById('enroll-modal').classList.add('open');
}
function closeEnroll(e) {
  if (!e || e.target === document.getElementById('enroll-modal') || e.target.classList.contains('close-btn')) {
    document.getElementById('enroll-modal').classList.remove('open');
  }
}

// ── Form Validation Helpers ───────────────────────────────────
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const existingError = field.parentNode.querySelector('.field-error');
  
  if (existingError) {
    existingError.remove();
  }
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
  field.classList.add('error');
}

function clearFieldErrors(formType) {
  if (formType === 'contact') {
    ['c-name', 'c-email', 'c-message'].forEach(id => {
      const field = document.getElementById(id);
      const error = field.parentNode.querySelector('.field-error');
      if (error) error.remove();
      field.classList.remove('error');
    });
  } else if (formType === 'enrollment') {
    ['e-name', 'e-phone', 'e-prog'].forEach(id => {
      const field = document.getElementById(id);
      const error = field.parentNode.querySelector('.field-error');
      if (error) error.remove();
      field.classList.remove('error');
    });
  }
}

function addSuccessAnimation(element) {
  element.classList.add('success');
  setTimeout(() => {
    element.classList.remove('success');
  }, 2000);
}

// ── Real-time Field Validation ─────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Contact form real-time validation
  const contactFields = {
    'c-name': {
      validate: (value) => value.length >= 2 && value.length <= 100,
      message: 'Name must be 2-100 characters'
    },
    'c-email': {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email'
    },
    'c-message': {
      validate: (value) => value.length >= 10 && value.length <= 1000,
      message: 'Message must be 10-1000 characters'
    }
  };
  
  // Enrollment form real-time validation
  const enrollmentFields = {
    'e-name': {
      validate: (value) => value.length >= 2 && value.length <= 100,
      message: 'Name must be 2-100 characters'
    },
    'e-phone': {
      validate: (value) => /^(?:(?:\+|00)212|0)[6-7]\d{8}$/.test(value.replace(/\s/g, '')),
      message: 'Enter valid Moroccan phone (06/07XXXXXXXX)'
    }
  };
  
  // Add real-time validation listeners
  Object.keys(contactFields).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', () => validateField(fieldId, contactFields[fieldId]));
      field.addEventListener('input', () => {
        // Clear error on input
        const error = field.parentNode.querySelector('.field-error');
        if (error) error.remove();
        field.classList.remove('error');
      });
    }
  });
  
  Object.keys(enrollmentFields).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', () => validateField(fieldId, enrollmentFields[fieldId]));
      field.addEventListener('input', () => {
        // Clear error on input
        const error = field.parentNode.querySelector('.field-error');
        if (error) error.remove();
        field.classList.remove('error');
      });
    }
  });
});

function validateField(fieldId, validation) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();
  
  if (!validation.validate(value)) {
    showFieldError(fieldId, validation.message);
    return false;
  } else {
    const error = field.parentNode.querySelector('.field-error');
    if (error) error.remove();
    field.classList.remove('error');
    return true;
  }
}

// ── Toast Notification ───────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Enrollment Form ───────────────────────────────────────────
function submitEnroll() {
  const name  = document.getElementById('e-name').value.trim();
  const phone = document.getElementById('e-phone').value.trim();
  const course = document.getElementById('e-prog').value.trim();
  
  // Clear previous errors
  clearFieldErrors('enrollment');
  
  // Enhanced validation with field-specific errors
  let hasError = false;
  
  if (!name || name.length < 2) {
    showFieldError('e-name', 'Name must be at least 2 characters');
    hasError = true;
  } else if (name.length > 100) {
    showFieldError('e-name', 'Name must be less than 100 characters');
    hasError = true;
  }
  
  // Phone validation (Moroccan format)
  const phoneRegex = /^(?:(?:\+|00)212|0)[6-7]\d{8}$/;
  if (!phone) {
    showFieldError('e-phone', 'Phone number is required');
    hasError = true;
  } else if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    showFieldError('e-phone', 'Please enter a valid Moroccan phone number (06/07XXXXXXXX or +212XXXXXXXXX)');
    hasError = true;
  }
  
  // Course validation
  if (!course || course === 'Primary School Support' || course === 'Middle School Support' || course === 'High School Preparation' || course === 'University Level Courses' || course === 'Board Games Activities') {
    // Valid course selected
  } else {
    showFieldError('e-prog', 'Please select a course');
    hasError = true;
  }
  
  if (hasError) {
    showToast('⚠️ Please fix the errors below', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#enroll-modal .btn[onclick="submitEnroll()"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
  submitBtn.disabled = true;
  
  // Disable form fields during submission
  document.getElementById('e-name').disabled = true;
  document.getElementById('e-phone').disabled = true;
  document.getElementById('e-prog').disabled = true;
  
  // Send enrollment to backend
  fetch('/api/enroll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      phone: phone,
      course: course
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showToast('✅ ' + data.message, 'success');
      // Clear form
      document.getElementById('e-name').value = '';
      document.getElementById('e-phone').value = '';
      document.getElementById('e-prog').selectedIndex = 0;
      // Add success animation
      addSuccessAnimation(submitBtn);
      // Close modal after success
      setTimeout(() => closeEnroll(), 1500);
    } else {
      showToast('❌ ' + data.message, 'error');
    }
  })
  .catch(error => {
    console.error('Enrollment error:', error);
    showToast('❌ Error submitting enrollment. Please try again.', 'error');
  })
  .finally(() => {
    // Restore button and form state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    document.getElementById('e-name').disabled = false;
    document.getElementById('e-phone').disabled = false;
    document.getElementById('e-prog').disabled = false;
  });
}

// Alias for backward compatibility
function submitEnrollment() {
  submitEnroll();
}

// ── Contact Form Submit ──────────────────────────────────────
function submitContact() {
  const name  = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const msg   = document.getElementById('c-message').value.trim();
  
  // Clear previous errors
  clearFieldErrors('contact');
  
  // Enhanced validation with field-specific errors
  let hasError = false;
  
  if (!name || name.length < 2) {
    showFieldError('c-name', 'Name must be at least 2 characters');
    hasError = true;
  } else if (name.length > 100) {
    showFieldError('c-name', 'Name must be less than 100 characters');
    hasError = true;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showFieldError('c-email', 'Email is required');
    hasError = true;
  } else if (!emailRegex.test(email)) {
    showFieldError('c-email', 'Please enter a valid email address');
    hasError = true;
  }
  
  // Message validation
  if (!msg || msg.length < 10) {
    showFieldError('c-message', 'Message must be at least 10 characters');
    hasError = true;
  } else if (msg.length > 1000) {
    showFieldError('c-message', 'Message must be less than 1000 characters');
    hasError = true;
  }
  
  if (hasError) {
    showToast('⚠️ Please fix the errors below', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#contact button[onclick="submitContact()"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
  submitBtn.disabled = true;
  
  // Disable form fields during submission
  document.getElementById('c-name').disabled = true;
  document.getElementById('c-email').disabled = true;
  document.getElementById('c-message').disabled = true;
  
  // Send contact form to backend
  fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      email: email,
      message: msg
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showToast('✅ ' + data.message, 'success');
      // Clear form
      document.getElementById('c-name').value = '';
      document.getElementById('c-email').value = '';
      document.getElementById('c-message').value = '';
      // Add success animation
      addSuccessAnimation(submitBtn);
    } else {
      showToast('❌ ' + data.message, 'error');
    }
  })
  .catch(error => {
    console.error('Contact form error:', error);
    showToast('❌ Error sending message. Please try again.', 'error');
  })
  .finally(() => {
    // Restore button and form state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    document.getElementById('c-name').disabled = false;
    document.getElementById('c-email').disabled = false;
    document.getElementById('c-message').disabled = false;
  });
}

// ── Enrollment Form ───────────────────────────────────────────
function submitEnrollment() {
  const name  = document.getElementById('e-name').value.trim();
  const phone = document.getElementById('e-phone').value.trim();
  const course = document.getElementById('e-prog').value.trim();
  
  // Enhanced validation
  if (!name || !phone || !course) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }
  
  // Name validation
  if (name.length < 2 || name.length > 100) {
    showToast('⚠️ Name must be between 2 and 100 characters.');
    return;
  }
  
  // Phone validation (Moroccan format)
  const phoneRegex = /^(?:(?:\+|00)212|0)[6-7]\d{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    showToast('⚠️ Please enter a valid Moroccan phone number (06/07XXXXXXXX or +212XXXXXXXXX).');
    return;
  }
  
  // Course validation
  if (course === 'Primary School Support' || course === 'Middle School Support' || course === 'High School Preparation' || course === 'University Level Courses' || course === 'Board Games Activities') {
    // Valid course selected
  } else {
    showToast('⚠️ Please select a course.');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#enroll-modal .btn[onclick="submitEnrollment()"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;
  
  // Send enrollment to backend
  fetch('/api/enroll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      phone: phone,
      course: course
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showToast('✅ Enrollment submitted! We will contact you soon.');
      document.getElementById('e-name').value = '';
      document.getElementById('e-phone').value = '';
      document.getElementById('e-prog').selectedIndex = 0;
      closeEnroll();
    } else {
      showToast('❌ Error submitting enrollment: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Enrollment error:', error);
    showToast('❌ Error submitting enrollment. Please try again.');
  })
  .finally(() => {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}
