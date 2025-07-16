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

  // Time input component
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
          className={`${buttonColor} text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base w-full sm:w-auto`}
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
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                WorkQ
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Smart Time Tracking & Salary Calculator</p>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Clock className="text-blue-600" size={18} />
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
                buttonLabel="In Now"
                buttonIcon={<LogIn size={16} />}
                buttonColor="bg-green-600 hover:bg-green-700"
                onButtonClick={handleInTimeEntry}
              />
              
              <TimeInput
                label="Out Time"
                timeObj={timeEntry.outTime}
                onChange={(newTime) => setTimeEntry(prev => ({ ...prev, outTime: newTime }))}
                buttonLabel="Out Now"
                buttonIcon={<LogOut size={16} />}
                buttonColor="bg-red-600 hover:bg-red-700"
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
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-4">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                Work Calendar
              </h1>
              <button
                onClick={() => setShowSalarySettings(true)}
                className="bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <DollarSign size={16} />
                Salary Settings
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">←</span> Prev
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-center">
                <span className="block sm:inline">{monthNames[currentMonth]}</span>
                <span className="block sm:inline sm:ml-2">{currentYear}</span>
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
              >
                Next <span className="hidden sm:inline">→</span>
              </button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 sm:p-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const dateStr = formatDate(day);
                  const workRecord = workRecords[dateStr];
                  const isLeave = leaveRecords[dateStr];
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b relative ${
                        day ? 'hover:bg-gray-50' : ''
                      } ${isLeave ? 'bg-red-50' : ''}`}
                    >
                      {day && (
                        <>
                          <div className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">{day}</div>
                          
                          {workRecord && (
                            <div className="space-y-1">
                              <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                In: {formatTimeDisplay(workRecord.inTime)}
                              </div>
                              <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                Out: {formatTimeDisplay(workRecord.outTime)}
                              </div>
                              <div className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded flex items-center gap-1">
                                <Minus size={8} />
                                {workRecord.breakTime}m
                              </div>
                              <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                {workRecord.workingHours.toFixed(1)}h
                              </div>
                              <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                {formatCurrency(workRecord.workingHours * salaryPerHour)}
                              </div>
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => editWorkRecord(dateStr)}
                                  className="text-blue-500 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <Clock size={10} />
                                </button>
                                <button
                                  onClick={() => deleteWorkRecord(dateStr)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {isLeave && (
                            <div className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded mb-1">
                              Leave
                            </div>
                          )}
                          
                          {!workRecord && (
                            <div className="absolute bottom-1 right-1 flex gap-1">
                              <button
                                onClick={() => handleLeaveToggle(dateStr)}
                                className={`p-1 rounded text-xs ${
                                  isLeave ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'
                                } hover:bg-opacity-80`}
                                title="Mark Leave"
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