// Constants
const FULL_DAY_SALARY = 400;
const HALF_DAY_SALARY = 250;

// Data structure
let attendanceData = {
    currentMonth: getCurrentMonthKey(),
    attendance: {},
    advances: []
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderCalendar();
    updateReport();
    renderAdvances();
    setupModal();
});

// Get current month key (YYYY-MM format)
function getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Check if we need to reset data for new month
function checkMonthReset() {
    const currentMonth = getCurrentMonthKey();
    if (attendanceData.currentMonth !== currentMonth) {
        // New month - reset data
        attendanceData = {
            currentMonth: currentMonth,
            attendance: {},
            advances: []
        };
        saveData();
    }
}

// Calendar Rendering
function renderCalendar() {
    checkMonthReset();
    
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Set month/year header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.dataset.date = dateStr;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Check attendance status
        const attendanceStatus = attendanceData.attendance[dateStr];
        if (attendanceStatus) {
            // Add the correct CSS class based on status
            if (attendanceStatus === 'full') {
                dayCell.classList.add('full-day');
            } else if (attendanceStatus === 'half') {
                dayCell.classList.add('half-day');
            } else if (attendanceStatus === 'absent') {
                dayCell.classList.add('absent');
            }
            
            const statusText = document.createElement('div');
            statusText.className = 'day-status';
            if (attendanceStatus === 'full') {
                statusText.textContent = 'FULL';
            } else if (attendanceStatus === 'half') {
                statusText.textContent = 'HALF';
            } else if (attendanceStatus === 'absent') {
                statusText.textContent = 'ABSENT';
            }
            dayCell.appendChild(statusText);
        }
        
        // Add click event
        dayCell.addEventListener('click', function() {
            openAttendanceModal(dateStr);
        });
        
        calendarGrid.appendChild(dayCell);
    }
}

// Attendance Modal
let selectedDate = null;

function setupModal() {
    const modal = document.getElementById('attendance-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        selectedDate = null;
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            selectedDate = null;
        }
    };
}

function openAttendanceModal(dateStr) {
    selectedDate = dateStr;
    const modal = document.getElementById('attendance-modal');
    const selectedDateElement = document.getElementById('selected-date');
    
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    selectedDateElement.textContent = dateFormatted;
    modal.style.display = 'block';
}

function markAttendanceType(type) {
    if (!selectedDate) return;
    
    if (type === 'clear') {
        delete attendanceData.attendance[selectedDate];
    } else {
        attendanceData.attendance[selectedDate] = type;
    }
    
    saveData();
    renderCalendar();
    updateReport();
    
    // Close modal
    document.getElementById('attendance-modal').style.display = 'none';
    selectedDate = null;
}

// Advance Payments
function addAdvance() {
    const dateInput = document.getElementById('advance-date');
    const amountInput = document.getElementById('advance-amount');
    
    const date = dateInput.value;
    const amount = parseFloat(amountInput.value);
    
    if (!date || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid date and amount.');
        return;
    }
    
    // Check if date is in current month
    const currentMonth = getCurrentMonthKey();
    const advanceMonth = date.substring(0, 7);
    
    if (advanceMonth !== currentMonth) {
        alert('Advance payments can only be added for the current month.');
        return;
    }
    
    attendanceData.advances.push({
        date: date,
        amount: amount
    });
    
    saveData();
    renderAdvances();
    updateReport();
    
    // Clear form
    dateInput.value = '';
    amountInput.value = '';
}

function renderAdvances() {
    const advanceList = document.getElementById('advance-list');
    advanceList.innerHTML = '';
    
    if (attendanceData.advances.length === 0) {
        advanceList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No advance payments recorded</p>';
        return;
    }
    
    // Sort advances by date (newest first)
    const sortedAdvances = [...attendanceData.advances].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedAdvances.forEach((advance, index) => {
        const advanceItem = document.createElement('div');
        advanceItem.className = 'advance-item';
        
        const info = document.createElement('div');
        info.className = 'advance-item-info';
        
        const dateElement = document.createElement('div');
        dateElement.className = 'advance-item-date';
        const date = new Date(advance.date);
        dateElement.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const amountElement = document.createElement('div');
        amountElement.className = 'advance-item-amount';
        amountElement.textContent = `Rs. ${advance.amount.toFixed(2)}`;
        
        info.appendChild(dateElement);
        info.appendChild(amountElement);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt" style="margin-right: 5px;"></i>Delete';
        deleteBtn.onclick = function() {
            deleteAdvance(index);
        };
        
        advanceItem.appendChild(info);
        advanceItem.appendChild(deleteBtn);
        advanceList.appendChild(advanceItem);
    });
}

function deleteAdvance(index) {
    if (confirm('Are you sure you want to delete this advance payment?')) {
        attendanceData.advances.splice(index, 1);
        saveData();
        renderAdvances();
        updateReport();
    }
}

// Salary Calculation and Report
function calculateSalary() {
    let fullDays = 0;
    let halfDays = 0;
    
    Object.values(attendanceData.attendance).forEach(status => {
        if (status === 'full') {
            fullDays++;
        } else if (status === 'half') {
            halfDays++;
        }
    });
    
    const totalSalary = (fullDays * FULL_DAY_SALARY) + (halfDays * HALF_DAY_SALARY);
    const totalAdvances = attendanceData.advances.reduce((sum, advance) => sum + advance.amount, 0);
    const netSalary = totalSalary - totalAdvances;
    
    return {
        fullDays,
        halfDays,
        totalSalary,
        totalAdvances,
        netSalary
    };
}

function updateReport() {
    const salaryData = calculateSalary();
    
    document.getElementById('total-full-days').textContent = salaryData.fullDays;
    document.getElementById('total-half-days').textContent = salaryData.halfDays;
    document.getElementById('total-salary').textContent = `Rs. ${salaryData.totalSalary.toFixed(2)}`;
    document.getElementById('total-advances').textContent = `Rs. ${salaryData.totalAdvances.toFixed(2)}`;
    document.getElementById('net-salary').textContent = `Rs. ${salaryData.netSalary.toFixed(2)}`;
}

// Data Persistence
function saveData() {
    try {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    } catch (e) {
        console.error('Error saving data:', e);
        alert('Error saving data. Please check your browser storage settings.');
    }
}

function loadData() {
    try {
        const saved = localStorage.getItem('attendanceData');
        if (saved) {
            const parsed = JSON.parse(saved);
            const currentMonth = getCurrentMonthKey();
            
            // If saved month is different, reset for new month
            if (parsed.currentMonth === currentMonth) {
                attendanceData = parsed;
            } else {
                // New month - reset data
                attendanceData = {
                    currentMonth: currentMonth,
                    attendance: {},
                    advances: []
                };
                saveData();
            }
        }
    } catch (e) {
        console.error('Error loading data:', e);
        alert('Error loading saved data.');
    }
}

// Data Export - Improved JSON format
function exportData() {
    try {
        const salaryData = calculateSalary();
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = getCurrentMonthKey();
        const [year, month] = currentMonth.split('-');
        const monthName = monthNames[parseInt(month) - 1];
        
        // Create a more readable JSON structure
        const readableData = {
            "Attendance Report": {
                "Month": `${monthName} ${year}`,
                "Export Date": now.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            },
            "Summary": {
                "Total Full Days": salaryData.fullDays,
                "Total Half Days": salaryData.halfDays,
                "Full Day Salary (per day)": `Rs. ${FULL_DAY_SALARY}`,
                "Half Day Salary (per day)": `Rs. ${HALF_DAY_SALARY}`,
                "Total Salary Earned": `Rs. ${salaryData.totalSalary.toFixed(2)}`,
                "Total Advance Payments": `Rs. ${salaryData.totalAdvances.toFixed(2)}`,
                "Net Salary": `Rs. ${salaryData.netSalary.toFixed(2)}`
            },
            "Attendance Details": (() => {
                const details = [];
                Object.keys(attendanceData.attendance).sort().forEach(date => {
                    const status = attendanceData.attendance[date];
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    let daySalary = 0;
                    if (status === 'full') daySalary = FULL_DAY_SALARY;
                    else if (status === 'half') daySalary = HALF_DAY_SALARY;
                    
                    details.push({
                        "Date": formattedDate,
                        "Status": status.toUpperCase(),
                        "Salary": `Rs. ${daySalary}`
                    });
                });
                return details;
            })(),
            "Advance Payments": attendanceData.advances.map(advance => ({
                "Date": new Date(advance.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                "Amount": `Rs. ${advance.amount.toFixed(2)}`
            })),
            "Raw Data": {
                "Month Code": attendanceData.currentMonth,
                "Attendance Records": attendanceData.attendance,
                "Advance Records": attendanceData.advances
            }
        };
        
        const dataStr = JSON.stringify(readableData, null, 4);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-report-${monthName}-${year}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully as JSON!');
    } catch (e) {
        console.error('Error exporting data:', e);
        alert('Error exporting data. Please try again.');
    }
}

// PDF Export - Using direct jsPDF method for reliability
function exportPDF() {
    try {
        const salaryData = calculateSalary();
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = getCurrentMonthKey();
        const [year, month] = currentMonth.split('-');
        const monthName = monthNames[parseInt(month) - 1];
        
        // Use direct jsPDF method for reliable PDF generation
        if (typeof window.jspdf !== 'undefined') {
            tryAlternativePDFExport(salaryData, monthName, year, now);
        } else {
            // Fallback: try html2pdf if jsPDF not available
            alert('PDF library loading. Please wait a moment and try again.');
            setTimeout(() => {
                if (typeof window.jspdf !== 'undefined') {
                    tryAlternativePDFExport(salaryData, monthName, year, now);
                } else {
                    alert('PDF library not loaded. Please refresh the page and try again.');
                }
            }, 1000);
        }
    } catch (e) {
        console.error('Error exporting PDF:', e);
        alert('Error exporting PDF. Please try again.');
    }
}

// PDF export method using jsPDF directly - Modern and Attractive Design
function tryAlternativePDFExport(salaryData, monthName, year, now) {
    try {
        // Use jsPDF directly
        if (typeof window.jspdf !== 'undefined') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Color constants
            const primaryColor = [102, 126, 234]; // #667eea
            const secondaryColor = [118, 75, 162]; // #764ba2
            const lightGray = [248, 249, 250]; // #f8f9fa
            const borderGray = [224, 224, 224]; // #e0e0e0
            const textGray = [100, 100, 100];
            const darkText = [51, 51, 51];
            
            // Title Section
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text('Attendance Management Report', 105, 25, { align: 'center' });
            
            // Month and date
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            doc.text(`${monthName} ${year}`, 105, 33, { align: 'center' });
            doc.text(`Generated on: ${now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`, 105, 38, { align: 'center' });
            
            let yPos = 50;
            
            // Salary Summary Section with Box
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkText);
            doc.text('Salary Summary', 20, yPos);
            yPos += 8;
            
            // Summary box background
            doc.setFillColor(...lightGray);
            doc.roundedRect(20, yPos - 3, 170, 50, 3, 3, 'F');
            
            // Summary items
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            const summaryItems = [
                { label: 'Total Full Days:', value: salaryData.fullDays.toString() },
                { label: 'Total Half Days:', value: salaryData.halfDays.toString() },
                { label: 'Full Day Salary (per day):', value: `Rs. ${FULL_DAY_SALARY}` },
                { label: 'Half Day Salary (per day):', value: `Rs. ${HALF_DAY_SALARY}` },
                { label: 'Total Salary Earned:', value: `Rs. ${salaryData.totalSalary.toFixed(2)}` },
                { label: 'Total Advance Payments:', value: `Rs. ${salaryData.totalAdvances.toFixed(2)}` }
            ];
            
            summaryItems.forEach((item, index) => {
                doc.setFont('helvetica', 'bold');
                doc.text(item.label, 25, yPos);
                doc.setFont('helvetica', 'bold');
                doc.text(item.value, 175, yPos, { align: 'right' });
                yPos += 7;
            });
            
            yPos += 3;
            
            // Net Salary Highlight Box
            doc.setFillColor(...primaryColor);
            doc.roundedRect(20, yPos - 5, 170, 10, 3, 3, 'F');
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Net Salary:', 25, yPos + 2);
            doc.text(`Rs. ${salaryData.netSalary.toFixed(2)}`, 175, yPos + 2, { align: 'right' });
            yPos += 18;
            
            // Attendance Details Section
            const attendanceDates = Object.keys(attendanceData.attendance).sort();
            if (attendanceDates.length > 0) {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...darkText);
                doc.text('Attendance Details', 20, yPos);
                yPos += 8;
                
                // Table header
                doc.setFillColor(...primaryColor);
                doc.roundedRect(20, yPos - 5, 170, 8, 2, 2, 'F');
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 255, 255);
                doc.text('Date', 25, yPos);
                doc.text('Status', 100, yPos);
                doc.text('Salary', 160, yPos, { align: 'right' });
                yPos += 8;
                
                // Table rows with alternating colors
                let rowIndex = 0;
                attendanceDates.forEach(date => {
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 20;
                        // Redraw header on new page
                        doc.setFillColor(...primaryColor);
                        doc.roundedRect(20, yPos - 5, 170, 8, 2, 2, 'F');
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(255, 255, 255);
                        doc.text('Date', 25, yPos);
                        doc.text('Status', 100, yPos);
                        doc.text('Salary', 160, yPos, { align: 'right' });
                        yPos += 8;
                        rowIndex = 0;
                    }
                    
                    // Alternating row background
                    if (rowIndex % 2 === 0) {
                        doc.setFillColor(...lightGray);
                        doc.rect(20, yPos - 4, 170, 7, 'F');
                    }
                    
                    const status = attendanceData.attendance[date];
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                    });
                    let daySalary = 0;
                    if (status === 'full') daySalary = FULL_DAY_SALARY;
                    else if (status === 'half') daySalary = HALF_DAY_SALARY;
                    
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(0, 0, 0);
                    doc.text(formattedDate, 25, yPos);
                    doc.setFont('helvetica', 'bold');
                    doc.text(status.toUpperCase(), 100, yPos);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Rs. ${daySalary}`, 160, yPos, { align: 'right' });
                    
                    // Row border
                    doc.setDrawColor(...borderGray);
                    doc.line(20, yPos + 3, 190, yPos + 3);
                    
                    yPos += 7;
                    rowIndex++;
                });
                yPos += 5;
            }
            
            // Advance Payments Section
            if (attendanceData.advances.length > 0) {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...darkText);
                doc.text('Advance Payments', 20, yPos);
                yPos += 8;
                
                // Table header
                doc.setFillColor(...primaryColor);
                doc.roundedRect(20, yPos - 5, 170, 8, 2, 2, 'F');
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 255, 255);
                doc.text('Date', 25, yPos);
                doc.text('Amount', 160, yPos, { align: 'right' });
                yPos += 8;
                
                // Table rows with alternating colors
                let advanceRowIndex = 0;
                attendanceData.advances.forEach(advance => {
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 20;
                        // Redraw header on new page
                        doc.setFillColor(...primaryColor);
                        doc.roundedRect(20, yPos - 5, 170, 8, 2, 2, 'F');
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(255, 255, 255);
                        doc.text('Date', 25, yPos);
                        doc.text('Amount', 160, yPos, { align: 'right' });
                        yPos += 8;
                        advanceRowIndex = 0;
                    }
                    
                    // Alternating row background
                    if (advanceRowIndex % 2 === 0) {
                        doc.setFillColor(...lightGray);
                        doc.rect(20, yPos - 4, 170, 7, 'F');
                    }
                    
                    const dateObj = new Date(advance.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                    });
                    
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(0, 0, 0);
                    doc.text(formattedDate, 25, yPos);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Rs. ${advance.amount.toFixed(2)}`, 160, yPos, { align: 'right' });
                    
                    // Row border
                    doc.setDrawColor(...borderGray);
                    doc.line(20, yPos + 3, 190, yPos + 3);
                    
                    yPos += 7;
                    advanceRowIndex++;
                });
            }
            
            doc.save(`attendance-report-${monthName}-${year}.pdf`);
            alert('PDF exported successfully!');
        } else {
            alert('PDF library not loaded. Please refresh the page and try again.');
        }
    } catch (e) {
        console.error('Alternative PDF export error:', e);
        alert('Error exporting PDF. Please try again.');
    }
}


