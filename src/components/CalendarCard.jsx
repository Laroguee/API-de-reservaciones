import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CalendarCard.css';

const CalendarCard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null
  });

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setSelectedRange({ start, end });
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <h3>Calendario de Disponibilidad</h3>
        <div className="date-range-display">
          {selectedRange.start && selectedRange.end ? (
            <span>
              {selectedRange.start.toLocaleDateString()} - {selectedRange.end.toLocaleDateString()}
            </span>
          ) : (
            <span>Selecciona un rango de fechas</span>
          )}
        </div>
      </div>
      
      <div className="calendar-container">
        <DatePicker
          selected={selectedRange.start}
          onChange={handleDateChange}
          startDate={selectedRange.start}
          endDate={selectedRange.end}
          selectsRange
          inline
          minDate={new Date()}
          calendarClassName="custom-calendar"
          showMonthYearPicker={false}
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="calendar-header-custom">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                type="button"
                className="nav-arrow"
              >
                &lt;
              </button>
              <div className="month-year">
                {date.toLocaleString('es-ES', { month: 'long' })} {date.getFullYear()}
              </div>
              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                type="button"
                className="nav-arrow"
              >
                &gt;
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default CalendarCard;
