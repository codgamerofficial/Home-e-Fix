import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export interface DatePickerProps {
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function DatePicker({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  maxDate,
  disabledDates = [],
  label,
  placeholder = "Select date",
  error,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate || new Date()
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Calendar matrix math
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2?: Date | null) => {
    if (!d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateDisabled = (date: Date) => {
    // Strip time for clean comparison
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const min = minDate
      ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      : null;
    const max = maxDate
      ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
      : null;

    if (min && target < min) return true;
    if (max && target > max) return true;

    return disabledDates.some((d) => isSameDay(d, date));
  };

  const handleSelectDay = (day: number) => {
    const date = new Date(year, month, day);
    if (isDateDisabled(date)) return;
    onSelectDate?.(date);
    setIsOpen(false);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div ref={containerRef} className={cn("relative w-full space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-sm",
          "transition-colors duration-200 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          error
            ? "border-error focus:ring-error"
            : isOpen
            ? "border-accent ring-2 ring-accent/20"
            : "border-border hover:border-foreground-muted"
        )}
      >
        <span
          className={cn(
            selectedDate ? "text-foreground font-medium" : "text-muted-foreground"
          )}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full z-(--z-popover) mt-2 w-72 rounded-2xl border border-border bg-surface p-4 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-foreground-secondary hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-heading font-semibold text-sm text-primary">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-1.5 text-foreground-secondary hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dayNames.map((d) => (
              <span
                key={d}
                className="text-[11px] font-semibold text-foreground-muted uppercase"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const disabled = isDateDisabled(date);
              const selected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
                    selected
                      ? "bg-accent text-white font-bold shadow-xs"
                      : isToday
                      ? "border border-accent text-accent font-semibold"
                      : "text-foreground hover:bg-muted",
                    disabled && "cursor-not-allowed text-foreground-muted opacity-30 hover:bg-transparent"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
