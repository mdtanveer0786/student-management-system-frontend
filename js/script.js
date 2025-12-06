// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';
let currentSort = '-createdAt';
let studentToDelete = null;
let currentEditId = null;

// DOM Elements
const elements = {
    // Navigation
    menuToggle: document.getElementById('menuToggle'),
    sidebar: document.querySelector('.sidebar'),
    navItems: document.querySelectorAll('.sidebar-nav li'),
    pageTitle: document.getElementById('pageTitle'),
    
    // Pages
    pages: {
        dashboard: document.getElementById('dashboardContent'),
        students: document.getElementById('studentsContent'),
        addStudent: document.getElementById('addStudentContent'),
        export: document.getElementById('exportContent')
    },
    
    // Dashboard
    totalStudents: document.getElementById('totalStudents'),
    totalClasses: document.getElementById('totalClasses'),
    recentActivity: document.getElementById('recentActivity'),
    recentStudentsTable: document.getElementById('recentStudentsTable'),
    
    // Students List
    studentsTable: document.getElementById('studentsTable'),
    studentSearch: document.getElementById('studentSearch'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    pageInfo: document.getElementById('pageInfo'),
    
    // Forms
    addStudentForm: document.getElementById('addStudentForm'),
    editStudentForm: document.getElementById('editStudentForm'),
    
    // Buttons
    addStudentBtn: document.getElementById('addStudentBtn'),
    addStudentFromList: document.getElementById('addStudentFromList'),
    cancelAdd: document.getElementById('cancelAdd'),
    exportCSV: document.getElementById('exportCSV'),
    
    // Modals
    editModal: document.getElementById('editModal'),
    deleteModal: document.getElementById('deleteModal'),
    modalCloses: document.querySelectorAll('.modal-close'),
    confirmDelete: document.getElementById('confirmDelete'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer'),
    
    // Loading
    loadingOverlay: document.getElementById('loadingOverlay'),
    
    // Dark Mode
    darkModeToggle: document.getElementById('darkModeToggle'),
    
    // Search
    searchInput: document.getElementById('searchInput')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadDashboard();
    loadStudents();
    checkDarkMode();
});

// Event Listeners
function initEventListeners() {
    // Navigation
    elements.menuToggle.addEventListener('click', toggleSidebar);
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.page));
    });
    
    // Dashboard Actions
    elements.addStudentBtn.addEventListener('click', () => navigateTo('add-student'));
    elements.addStudentFromList.addEventListener('click', () => navigateTo('add-student'));
    elements.cancelAdd.addEventListener('click', () => navigateTo('students'));
    
    // Forms
    elements.addStudentForm.addEventListener('submit', handleAddStudent);
    elements.editStudentForm.addEventListener('submit', handleEditStudent);
    
    // Search and Pagination
    elements.studentSearch.addEventListener('input', debounce(handleSearch, 300));
    elements.searchInput.addEventListener('input', debounce(handleGlobalSearch, 300));
    elements.prevPage.addEventListener('click', () => changePage(-1));
    elements.nextPage.addEventListener('click', () => changePage(1));
    
    // Modals
    elements.modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    elements.confirmDelete.addEventListener('click', handleDeleteStudent);
    
    // Export
    elements.exportCSV.addEventListener('click', handleExportCSV);
    
    // Dark Mode
    elements.darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Click outside modals to close
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Navigation
function navigateTo(page) {
    // Update active navigation item
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Hide all pages
    Object.values(elements.pages).forEach(pageElement => {
        pageElement.classList.remove('active');
    });
    
    // Show selected page
    switch(page) {
        case 'dashboard':
            elements.pages.dashboard.classList.add('active');
            elements.pageTitle.textContent = 'Dashboard';
            loadDashboard();
            break;
        case 'students':
            elements.pages.students.classList.add('active');
            elements.pageTitle.textContent = 'Students';
            loadStudents();
            break;
        case 'add-student':
            elements.pages.addStudent.classList.add('active');
            elements.pageTitle.textContent = 'Add Student';
            elements.addStudentForm.reset();
            clearFormErrors('addStudentForm');
            break;
        case 'export':
            elements.pages.export.classList.add('active');
            elements.pageTitle.textContent = 'Export Data';
            break;
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        toggleSidebar();
    }
}

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
}

// Dark Mode
function checkDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    elements.darkModeToggle.checked = isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    const isDarkMode = elements.darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Loading State
function showLoading() {
    elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

// API Functions
async function fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        body: options.body ? JSON.stringify(options.body) : null,
    });
    
    return response.json();
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const data = await fetchAPI('/students?limit=5');
        if (data.success) {
            elements.totalStudents.textContent = data.pagination.total;
            elements.recentActivity.textContent = data.data.length;
            
            // Get unique classes count
            const classes = new Set(data.data.map(student => student.class));
            elements.totalClasses.textContent = classes.size;
            
            updateRecentStudents(data.data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function updateRecentStudents(students) {
    elements.recentStudentsTable.innerHTML = '';
    
    if (students.length === 0) {
        elements.recentStudentsTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: var(--text-light); margin-bottom: 16px; display: block;"></i>
                    <p>No students found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <strong>${student.name}</strong>
                </div>
            </td>
            <td>${student.email}</td>
            <td><span class="badge">${student.class}</span></td>
            <td>${student.rollNumber}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="openEditModal('${student._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="openDeleteModal('${student._id}', '${student.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        elements.recentStudentsTable.appendChild(row);
    });
}

// Student Functions
async function loadStudents() {
    showLoading();
    try {
        const data = await fetchAPI(
            `/students?page=${currentPage}&limit=${currentLimit}&search=${currentSearch}&sort=${currentSort}`
        );
        
        if (data.success) {
            updateStudentsTable(data.data);
            updatePagination(data.pagination);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('Failed to load students', 'error');
    } finally {
        hideLoading();
    }
}

function updateStudentsTable(students) {
    elements.studentsTable.innerHTML = '';
    
    if (students.length === 0) {
        elements.studentsTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: var(--text-light); margin-bottom: 16px; display: block;"></i>
                    <p>No students found. ${currentSearch ? 'Try a different search.' : 'Add your first student!'}</p>
                </td>
            </tr>
        `;
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <strong>${student.name}</strong>
                </div>
            </td>
            <td>${student.email}</td>
            <td><span class="badge">${student.class}</span></td>
            <td>${student.rollNumber}</td>
            <td>${student.phone}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="openEditModal('${student._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="openDeleteModal('${student._id}', '${student.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        elements.studentsTable.appendChild(row);
    });
}

function updatePagination(pagination) {
    elements.pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
    elements.prevPage.disabled = pagination.page === 1;
    elements.nextPage.disabled = pagination.page === pagination.pages;
}

function changePage(direction) {
    currentPage += direction;
    loadStudents();
}

function handleSearch(e) {
    currentSearch = e.target.value;
    currentPage = 1;
    loadStudents();
}

function handleGlobalSearch(e) {
    if (elements.pages.students.classList.contains('active')) {
        handleSearch(e);
    }
}

// Form Handling
function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

function displayFormErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    });
}

async function handleAddStudent(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        class: document.getElementById('class').value,
        rollNumber: document.getElementById('rollNumber').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    try {
        const data = await fetchAPI('/students', {
            method: 'POST',
            body: formData
        });
        
        if (data.success) {
            showToast('Student added successfully!');
            elements.addStudentForm.reset();
            loadDashboard();
            navigateTo('students');
        } else {
            if (data.message.includes('Validation')) {
                displayFormErrors(data.error || {});
            } else {
                showToast(data.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showToast('Failed to add student', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditStudent(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        class: document.getElementById('editClass').value,
        rollNumber: document.getElementById('editRollNumber').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value
    };
    
    try {
        const data = await fetchAPI(`/students/${currentEditId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (data.success) {
            showToast('Student updated successfully!');
            closeAllModals();
            loadDashboard();
            loadStudents();
        } else {
            if (data.message.includes('Validation')) {
                displayFormErrors({...Object.keys(formData).reduce((acc, key) => {
                    acc[`edit${key.charAt(0).toUpperCase() + key.slice(1)}`] = data.error;
                    return acc;
                }, {})});
            } else {
                showToast(data.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error updating student:', error);
        showToast('Failed to update student', 'error');
    } finally {
        hideLoading();
    }
}

// Modal Functions
function openEditModal(studentId) {
    showLoading();
    currentEditId = studentId;
    
    fetchAPI(`/students/${studentId}`)
        .then(data => {
            if (data.success) {
                document.getElementById('editId').value = data.data._id;
                document.getElementById('editName').value = data.data.name;
                document.getElementById('editEmail').value = data.data.email;
                document.getElementById('editClass').value = data.data.class;
                document.getElementById('editRollNumber').value = data.data.rollNumber;
                document.getElementById('editPhone').value = data.data.phone;
                document.getElementById('editAddress').value = data.data.address;
                
                clearFormErrors('editStudentForm');
                elements.editModal.classList.add('active');
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error fetching student:', error);
            showToast('Failed to load student data', 'error');
        })
        .finally(() => {
            hideLoading();
        });
}

function openDeleteModal(studentId, studentName) {
    studentToDelete = studentId;
    document.getElementById('deleteStudentPreview').innerHTML = `
        <strong>${studentName}</strong><br>
        <small>ID: ${studentId}</small>
    `;
    elements.deleteModal.classList.add('active');
}

function closeAllModals() {
    elements.editModal.classList.remove('active');
    elements.deleteModal.classList.remove('active');
    studentToDelete = null;
    currentEditId = null;
}

async function handleDeleteStudent() {
    if (!studentToDelete) return;
    
    showLoading();
    try {
        const data = await fetchAPI(`/students/${studentToDelete}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showToast('Student deleted successfully!');
            closeAllModals();
            loadDashboard();
            loadStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Failed to delete student', 'error');
    } finally {
        hideLoading();
    }
}

// Export Functions
async function handleExportCSV() {
    showLoading();
    try {
        const data = await fetchAPI('/students/export/csv');
        
        if (data.success) {
            // Convert data to CSV
            const csvData = data.data;
            const headers = Object.keys(csvData[0] || {});
            const csvRows = [];
            
            // Add headers
            csvRows.push(headers.join(','));
            
            // Add data rows
            csvData.forEach(row => {
                const values = headers.map(header => {
                    const escaped = ('' + row[header]).replace(/"/g, '\\"');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            });
            
            const csvContent = csvRows.join('\n');
            
            // Download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('CSV exported successfully!');
        }
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showToast('Failed to export CSV', 'error');
    } finally {
        hideLoading();
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions available globally for onclick attributes
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;