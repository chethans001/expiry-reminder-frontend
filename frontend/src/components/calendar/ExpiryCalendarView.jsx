import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin
} from 'lucide-react';
import ExpiryBadge from '../common/ExpiryBadge';
import CategoryIcon from '../items/CategoryIcon';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function ExpiryCalendarView({ items = [], onViewItem }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Helper to match items on a given YYYY-MM-DD
  const getItemsForDate = (y, m, d) => {
    return items.filter((item) => {
      const itemDate = new Date(item.expiryDate);
      return (
        itemDate.getFullYear() === y &&
        itemDate.getMonth() === m &&
        itemDate.getDate() === d
      );
    });
  };

  // Items for currently selected date
  const selectedDateItems = selectedDate
    ? getItemsForDate(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
    : [];

  // Build calendar matrix
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      date: new Date(year, month - 1, dayNum),
      items: getItemsForDate(year, month - 1, dayNum)
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
      items: getItemsForDate(year, month, i)
    });
  }

  // Next month leading days to complete 42 or 35 cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
      items: getItemsForDate(year, month + 1, i)
    });
  }

  const today = new Date();
  const isToday = (d) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isSelected = (d) =>
    selectedDate &&
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: The Monthly Calendar Grid */}
      <div className="lg:col-span-2 glass-card p-6">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month Day Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell, idx) => {
            const hasItems = cell.items.length > 0;
            const todayMatch = isToday(cell.date);
            const selectedMatch = isSelected(cell.date);

            // Determine pill colors for items
            const hasExpired = cell.items.some((i) => i.daysRemaining < 0);
            const hasToday = cell.items.some((i) => i.daysRemaining === 0);
            const hasSoon = cell.items.some(
              (i) => i.daysRemaining > 0 && i.daysRemaining <= 30
            );

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(cell.date)}
                className={`min-h-[75px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'opacity-30 bg-slate-50/50 dark:bg-slate-900/30 border-transparent'
                    : selectedMatch
                    ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : todayMatch
                    ? 'border-indigo-300 bg-indigo-50/20 dark:bg-slate-800'
                    : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      todayMatch
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : selectedMatch
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {hasItems && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {cell.items.length}
                    </span>
                  )}
                </div>

                {/* Status Dot Indicators */}
                <div className="mt-1 space-y-1">
                  {hasItems && (
                    <div className="flex flex-wrap gap-1">
                      {hasExpired && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" title="Expired items" />
                      )}
                      {hasToday && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Expiring today" />
                      )}
                      {hasSoon && (
                        <span className="w-2 h-2 rounded-full bg-orange-400" title="Expiring soon" />
                      )}
                      {!hasExpired && !hasToday && !hasSoon && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Safe items" />
                      )}
                    </div>
                  )}

                  {/* Desktop Preview of First Item */}
                  {cell.items.slice(0, 1).map((item) => (
                    <p
                      key={item.id}
                      className="hidden md:block text-[10px] truncate font-medium text-slate-600 dark:text-slate-400 leading-tight"
                    >
                      {item.name}
                    </p>
                  ))}
                  {cell.items.length > 1 && (
                    <p className="hidden md:block text-[9px] text-slate-400">
                      +{cell.items.length - 1} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 1 Col: Selected Date Details Pane */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Selected Date
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {formatDisplayDate(selectedDate)}
          </h3>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Items Expiring on this Date
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                {selectedDateItems.length}
              </span>
            </div>

            {selectedDateItems.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p>No products expiring on this date.</p>
                <p className="text-[11px] text-slate-400 mt-1">Select another day or add an item.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {selectedDateItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onViewItem(item)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                      <ExpiryBadge
                        status={item.status}
                        label={item.label}
                        daysRemaining={item.daysRemaining}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.storageLocation || 'Kitchen'}</span>
                      <span>•</span>
                      <span>
                        {item.quantity} {item.unit || 'pcs'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-500">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">
            Status Indicators
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Red: Expired</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Amber: Expiring Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span>Orange: Expiring Soon (1-30d)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Green: Safe (30+ days)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
