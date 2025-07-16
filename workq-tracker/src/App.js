import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Coffee, Trash2, Save, X, LogIn, LogOut, Minus } from 'lucide-react';

const WorkTimeCalculator = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workRecords, setWorkRecords] = useState({});
  const [leaveRecords, setLeaveRecords] = useState({});
  const [salaryPerHour, setSalaryPerHour] = useState(500);
  const [showSalarySettings, setShowSalarySettings] = useState(false);
  
  // Time entry form state with AM/PM format
  const [timeEntry, setTimeEntry] = useState({
    selectedDate: '',
    inTime: { hour: '', minute: '', period: 'AM' },
    outTime: { hour: '', minute: '', period: 'PM' },
    breakTime: 60
  });
  
  // Track which times have been set via buttons
  const [timeStatus, setTimeStatus] = useState({
    inTimeSet: false,
    outTimeSet: false
  });

  // Modal state for date details
  const [selectedDateModal, setSelectedDateModal] = useState({
    isOpen: false,
    date: '',
    dateStr: ''
  });

  // Auto-fill current date on component mount
  useEffect(() => {
    const now = new Date();
    const currentDateStr = now.toISOString().split('T')[0];
    
    setTimeEntry(prev => ({
      ...prev,
      selectedDate: currentDateStr
    }));
  }, []);

  // Convert 12-hour time object to 24-hour format string
  const timeObjectTo24Hour = (timeObj) => {
    if (!timeObj.hour || !timeObj.minute) return '';
    let hour = parseInt(timeObj.hour);
    if (timeObj.period === 'PM' && hour !== 12) hour += 12;
    if (timeObj.period === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${timeObj.minute}`;
  };

  // Convert 24-hour format to 12-hour time object
  const time24HourToObject = (time24) => {
    if (!time24) return { hour: '', minute: '', period: 'AM' };
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return {
      hour: hour12.toString().padStart(2, '0'),
      minute: minutes,
      period: period
    };
  };

  // Format time object to display string
  const formatTimeDisplay = (timeObj) => {
    if (!timeObj.hour || !timeObj.minute) return '';
    return `${timeObj.hour}:${timeObj.minute} ${timeObj.period}`;
  };

  // Get current time as time object
  const getCurrentTimeObject = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return {
      hour: hour12.toString().padStart(2, '0'),
      minute: minutes.toString().padStart(2, '0'),
      period: period
    };
  };

  // Get current time display string
  const getCurrentTimeDisplay = () => {
    const timeObj = getCurrentTimeObject();
    return formatTimeDisplay(timeObj);
  };

  // Handle automatic in time entry
  const handleInTimeEntry = () => {
    const currentTimeObj = getCurrentTimeObject();
    setTimeEntry(prev => ({
      ...prev,
      inTime: currentTimeObj
    }));
    setTimeStatus(prev => ({
      ...prev,
      inTimeSet: true
    }));
  };

  // Handle automatic out time entry
  const handleOutTimeEntry = () => {
    const currentTimeObj = getCurrentTimeObject();
    setTimeEntry(prev => ({
      ...prev,
      outTime: currentTimeObj
    }));
    setTimeStatus(prev => ({
      ...prev,
      outTimeSet: true
    }));
  };

  // Format currency with rupees and paise
  const formatCurrency = (amount) => {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    if (paise === 0) {
      return `₹${rupees.toLocaleString('en-IN')}`;
    }
    return `₹${rupees.toLocaleString('en-IN')}.${paise.toString().padStart(2, '0')}`;
  };

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days
  const getDaysInMonth = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (day) => {
    if (!day) return '';
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const calculateWorkingHours = (inTimeObj, outTimeObj, breakMinutes = 60) => {
    const inTime24 = timeObjectTo24Hour(inTimeObj);
    const outTime24 = timeObjectTo24Hour(outTimeObj);
    
    if (!inTime24 || !outTime24) return 0;
    
    const inDate = new Date(`2000-01-01T${inTime24}`);
    const outDate = new Date(`2000-01-01T${outTime24}`);
    
    if (outDate < inDate) {
      outDate.setDate(outDate.getDate() + 1);
    }
    
    const diffMs = outDate - inDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = breakMinutes / 60;
    
    return Math.max(0, diffHours - breakHours);
  };

  const handleTimeSubmit = () => {
    if (!timeEntry.selectedDate || !timeEntry.inTime.hour || !timeEntry.outTime.hour) {
      alert('Please fill in all required fields (Date, In Time, Out Time)');
      return;
    }
    
    const workingHours = calculateWorkingHours(timeEntry.inTime, timeEntry.outTime, timeEntry.breakTime);
    
    setWorkRecords(prev => ({
      ...prev,
      [timeEntry.selectedDate]: {
        inTime: timeEntry.inTime,
        outTime: timeEntry.outTime,
        breakTime: timeEntry.breakTime,
        workingHours: workingHours
      }
    }));
    
    setTimeEntry(prev => ({
      ...prev,
      inTime: { hour: '', minute: '', period: 'AM' },
      outTime: { hour: '', minute: '', period: 'PM' },
      breakTime: 60
    }));
    
    setTimeStatus({
      inTimeSet: false,
      outTimeSet: false
    });
    
    alert('Work time added successfully!');
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = formatDate(day);
    const date = new Date(currentYear, currentMonth, day);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    setSelectedDateModal({
      isOpen: true,
      date: formattedDate,
      dateStr: dateStr
    });
  };

  const handleLeaveToggle = (dateStr) => {
    setLeaveRecords(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  const deleteWorkRecord = (dateStr) => {
    setWorkRecords(prev => {
      const newRecords = { ...prev };
      delete newRecords[dateStr];
      return newRecords;
    });
  };

  const editWorkRecord = (dateStr) => {
    const record = workRecords[dateStr];
    if (record) {
      setTimeEntry({
        selectedDate: dateStr,
        inTime: record.inTime,
        outTime: record.outTime,
        breakTime: record.breakTime
      });
      setTimeStatus({
        inTimeSet: true,
        outTimeSet: true
      });
    }
  };

  const getTotalHours = () => {
    return Object.values(workRecords).reduce((total, record) => total + record.workingHours, 0);
  };

  const getTotalSalary = () => {
    return getTotalHours() * salaryPerHour;
  };

  const getWorkingDays = () => {
    return Object.keys(workRecords).length;
  };

  const getLeaveDays = () => {
    return Object.values(leaveRecords).filter(Boolean).length;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentMonth, currentYear);
  const TimeInput = ({ label, timeObj, onChange, buttonLabel, buttonIcon, buttonColor, onButtonClick }) => (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex gap-1">
                      <select
            value={timeObj.hour}
            onChange={(e) => onChange({ ...timeObj, hour: e.target.value })}
            className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">--</option>
            {[...Array(12)].map((_, i) => {
              const hour = (i + 1).toString().padStart(2, '0');
              return <option key={hour} value={hour}>{hour}</option>;
            })}
          </select>
          <span className="p-2 sm:p-3 text-gray-500 font-bold text-sm sm:text-base">:</span>
          <select
            value={timeObj.minute}
            onChange={(e) => onChange({ ...timeObj, minute: e.target.value })}
            className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">--</option>
            {[...Array(60)].map((_, i) => {
              const minute = i.toString().padStart(2, '0');
              return <option key={minute} value={minute}>{minute}</option>;
            })}
          </select>
          <select
            value={timeObj.period}
            onChange={(e) => onChange({ ...timeObj, period: e.target.value })}
            className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <button
          onClick={onButtonClick}
          className={`${buttonColor} text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base w-full sm:w-auto transition-all duration-200 transform hover:scale-105 shadow-lg`}
          title="Use current time"
        >
          {buttonIcon}
          <span className="hidden sm:inline">{buttonLabel}</span>
          <span className="sm:hidden">{buttonLabel.split(' ')[0]}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Time Entry Section */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                WorkQ
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Smart Time Tracking & Salary Calculator</p>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Clock className="text-blue-600" size={20} />
              Time Entry
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                <input
                  type="date"
                  value={timeEntry.selectedDate}
                  onChange={(e) => setTimeEntry(prev => ({ ...prev, selectedDate: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              <TimeInput
                label="In Time"
                timeObj={timeEntry.inTime}
                onChange={(newTime) => setTimeEntry(prev => ({ ...prev, inTime: newTime }))}
                buttonLabel={timeStatus.inTimeSet ? "Update In" : "In Now"}
                buttonIcon={<LogIn size={16} />}
                buttonColor={timeStatus.inTimeSet ? "bg-green-700 hover:bg-green-800" : "bg-green-600 hover:bg-green-700"}
                onButtonClick={handleInTimeEntry}
              />
              
              <TimeInput
                label="Out Time"
                timeObj={timeEntry.outTime}
                onChange={(newTime) => setTimeEntry(prev => ({ ...prev, outTime: newTime }))}
                buttonLabel={timeStatus.outTimeSet ? "Update Out" : "Out Now"}
                buttonIcon={<LogOut size={16} />}
                buttonColor={timeStatus.outTimeSet ? "bg-red-700 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"}
                onButtonClick={handleOutTimeEntry}
              />
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-2">
                  <Minus size={16} />
                  Break Time (minutes)
                </label>
                <input
                  type="number"
                  value={timeEntry.breakTime}
                  onChange={(e) => setTimeEntry(prev => ({ ...prev, breakTime: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="60"
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 font-medium">Current Time:</div>
                <div className="text-base sm:text-lg font-bold text-gray-800">{getCurrentTimeDisplay()}</div>
                
                {/* Status Indicators */}
                <div className="mt-2 flex flex-col gap-1">
                  {timeStatus.inTimeSet && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">Clocked In at {formatTimeDisplay(timeEntry.inTime)}</span>
                    </div>
                  )}
                  {timeStatus.outTimeSet && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-700 font-medium">Clocked Out at {formatTimeDisplay(timeEntry.outTime)}</span>
                    </div>
                  )}
                  {!timeStatus.inTimeSet && !timeStatus.outTimeSet && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-600">Ready to clock in</span>
                    </div>
                  )}
                  {timeStatus.inTimeSet && !timeStatus.outTimeSet && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-700 font-medium">Currently working...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {timeStatus.inTimeSet && timeStatus.outTimeSet && timeEntry.inTime.hour && timeEntry.outTime.hour && (
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700 font-medium mb-1">Preview:</div>
                  <div className="text-xs sm:text-sm text-blue-600 mb-1">Working Hours: {calculateWorkingHours(timeEntry.inTime, timeEntry.outTime, timeEntry.breakTime).toFixed(1)}h</div>
                  <div className="text-xs sm:text-sm text-blue-600">Salary: {formatCurrency(calculateWorkingHours(timeEntry.inTime, timeEntry.outTime, timeEntry.breakTime) * salaryPerHour)}</div>
                </div>
              )}
              
              <button
                onClick={handleTimeSubmit}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
              >
                <Save size={18} />
                Save Work Time
              </button>
              
              <button
                onClick={() => {
                  setTimeEntry(prev => ({ 
                    ...prev, 
                    inTime: { hour: '', minute: '', period: 'AM' },
                    outTime: { hour: '', minute: '', period: 'PM' },
                    breakTime: 60 
                  }));
                  setTimeStatus({
                    inTimeSet: false,
                    outTimeSet: false
                  });
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <X size={16} />
                Clear Times
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
              <div className="text-xs sm:text-sm text-blue-600 font-semibold">Total Hours</div>
              <div className="text-lg sm:text-2xl font-bold text-blue-800">{getTotalHours().toFixed(1)}h</div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
              <div className="text-xs sm:text-sm text-green-600 font-semibold">Total Salary</div>
              <div className="text-lg sm:text-2xl font-bold text-green-800">{formatCurrency(getTotalSalary())}</div>
            </div>
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
              <div className="text-xs sm:text-sm text-purple-600 font-semibold">Working Days</div>
              <div className="text-lg sm:text-2xl font-bold text-purple-800">{getWorkingDays()}</div>
            </div>
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
              <div className="text-xs sm:text-sm text-orange-600 font-semibold">Leave Days</div>
              <div className="text-lg sm:text-2xl font-bold text-orange-800">{getLeaveDays()}</div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={24} />
                Work Calendar
              </h1>
              <button
                onClick={() => setShowSalarySettings(true)}
                className="bg-green-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center shadow-md transition-all duration-200"
              >
                <DollarSign size={18} />
                Salary Settings
              </button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base font-medium transition-all duration-200"
              >
                <span className="hidden sm:inline">← Previous</span>
                <span className="sm:hidden">← Prev</span>
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-center">
                <span className="block sm:inline">{monthNames[currentMonth]}</span>
                <span className="block sm:inline sm:ml-2">{currentYear}</span>
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base font-medium transition-all duration-200"
              >
                <span className="hidden sm:inline">Next →</span>
                <span className="sm:hidden">Next →</span>
              </button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={day} className="p-3 sm:p-4 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const dateStr = formatDate(day);
                  const workRecord = workRecords[dateStr];
                  const isLeave = leaveRecords[dateStr];
                  const isToday = day && new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day)}
                      className={`min-h-[100px] sm:min-h-[130px] p-2 sm:p-3 border-r border-b relative transition-all duration-200 ${
                        day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                      } ${isLeave ? 'bg-red-50' : ''} ${isToday ? 'bg-yellow-50' : ''}`}
                    >
                      {day && (
                        <>
                          {/* Date Number */}
                          <div className={`font-bold mb-2 text-base sm:text-lg ${
                            isToday ? 'text-blue-600 bg-blue-100 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base' : 
                            workRecord ? 'text-green-700' : 
                            isLeave ? 'text-red-700' : 'text-gray-700'
                          }`}>
                            {day}
                          </div>
                          
                          {/* Mobile: Simple Status Indicators */}
                          <div className="space-y-1">
                            {workRecord && (
                              <div className="text-center">
                                <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium mb-1">
                                  {workRecord.workingHours.toFixed(1)}h
                                </div>
                                <div className="text-xs text-green-700 font-semibold hidden sm:block">
                                  {formatCurrency(workRecord.workingHours * salaryPerHour)}
                                </div>
                              </div>
                            )}
                            
                            {isLeave && (
                              <div className="text-center">
                                <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                  Leave
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons - Only on Desktop */}
                          {workRecord && (
                            <div className="hidden sm:flex gap-1 mt-2 justify-end absolute bottom-2 right-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editWorkRecord(dateStr);
                                }}
                                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Clock size={10} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWorkRecord(dateStr);
                                }}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          )}
                          
                          {/* Leave Toggle - Only on Desktop */}
                          {!workRecord && (
                            <div className="hidden sm:block absolute bottom-2 right-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLeaveToggle(dateStr);
                                }}
                                className={`p-1 rounded text-xs transition-all duration-200 ${
                                  isLeave ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                                }`}
                                title={isLeave ? "Remove Leave" : "Mark Leave"}
                              >
                                <Coffee size={10} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDateModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Date Details</h3>
              <button
                onClick={() => setSelectedDateModal({ isOpen: false, date: '', dateStr: '' })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">{selectedDateModal.date}</h4>
            </div>
            
            {(() => {
              const workRecord = workRecords[selectedDateModal.dateStr];
              const isLeave = leaveRecords[selectedDateModal.dateStr];
              
              if (workRecord) {
                return (
                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-green-700">Work Day</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clock In:</span>
                          <span className="font-medium">{formatTimeDisplay(workRecord.inTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clock Out:</span>
                          <span className="font-medium">{formatTimeDisplay(workRecord.outTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Break Time:</span>
                          <span className="font-medium">{workRecord.breakTime} minutes</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Working Hours:</span>
                          <span className="font-bold text-green-700">{workRecord.workingHours.toFixed(1)} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salary:</span>
                          <span className="font-bold text-green-700">{formatCurrency(workRecord.workingHours * salaryPerHour)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          editWorkRecord(selectedDateModal.dateStr);
                          setSelectedDateModal({ isOpen: false, date: '', dateStr: '' });
                        }}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Edit Record
                      </button>
                      <button
                        onClick={() => {
                          deleteWorkRecord(selectedDateModal.dateStr);
                          setSelectedDateModal({ isOpen: false, date: '', dateStr: '' });
                        }}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              } else if (isLeave) {
                return (
                  <div className="space-y-3">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-semibold text-red-700">Leave Day</span>
                      </div>
                      <p className="text-sm text-red-600">You are on leave for this day.</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleLeaveToggle(selectedDateModal.dateStr);
                        setSelectedDateModal({ isOpen: false, date: '', dateStr: '' });
                      }}
                      className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove Leave
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="font-semibold text-gray-700">No Activity</span>
                      </div>
                      <p className="text-sm text-gray-600">No work record or leave marked for this day.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setTimeEntry(prev => ({ ...prev, selectedDate: selectedDateModal.dateStr }));
                          setSelectedDateModal({ isOpen: false, date: '', dateStr: '' });
                        }}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add Work Time
                      </button>
                      <button
                        onClick={() => {
                          handleLeaveToggle(selectedDateModal.dateStr);
                          setSelectedDateModal({ isOpen: false, date: '', dateStr: '' });
                        }}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Mark Leave
                      </button>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}

      {/* Salary Settings Modal */}
      {showSalarySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Salary Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Salary Per Hour</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={salaryPerHour}
                    onChange={(e) => setSalaryPerHour(parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 border rounded-lg text-sm sm:text-base"
                    placeholder="Enter hourly rate"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  Current total salary: {formatCurrency(getTotalSalary())}
                </div>
                <div className="text-sm text-gray-600">
                  Based on {getTotalHours().toFixed(1)} hours worked
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                onClick={() => setShowSalarySettings(false)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Save
              </button>
              <button
                onClick={() => setShowSalarySettings(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkTimeCalculator;