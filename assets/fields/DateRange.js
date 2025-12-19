import { useCallback } from 'react';
import clsx from 'clsx';
import { checkValidityDateRangeType } from '@/helpers/validators';

export function DateRange ({
  id,
  htmlId,
  onChange,
  value,
  attributes = {},
  min,
  max,
  disabled = false,
  className,
}) {
  // Normalize value to array format internally
  const normalizedValue = Array.isArray(value) ? value : [null, null];
  const startDate = normalizedValue[0] || '';
  const endDate = normalizedValue[1] || '';

  // Calculate dynamic min/max constraints
  // Start date max: the lesser of endDate and max
  const startMax = endDate && max ? (endDate < max ? endDate : max) : (endDate || max);
  // End date min: the greater of startDate and min
  const endMin = startDate && min ? (startDate > min ? startDate : min) : (startDate || min);

  const handleStartChange = useCallback(event => {
    const newStart = event.target.value || null;
    const newEnd = normalizedValue[1] || null;

    // If both are empty, set value to null
    if (!newStart && !newEnd) {
      onChange(null);
    } else {
      onChange([newStart, newEnd]);
    }
  }, [onChange, normalizedValue]);

  const handleEndChange = useCallback(event => {
    const newStart = normalizedValue[0] || null;
    const newEnd = event.target.value || null;

    // If both are empty, set value to null
    if (!newStart && !newEnd) {
      onChange(null);
    } else {
      onChange([newStart, newEnd]);
    }
  }, [onChange, normalizedValue]);

  return (
    <div className={clsx('wpifycf-field-date-range', `wpifycf-field-date-range--${id}`, attributes.class, className)}>
      <input
        type="date"
        id={`${htmlId}-start`}
        onChange={handleStartChange}
        value={startDate}
        className="wpifycf-field-date-range__start"
        min={min}
        max={startMax}
        disabled={disabled}
        {...attributes}
      />
      <span>—</span>
      <input
        type="date"
        id={`${htmlId}-end`}
        onChange={handleEndChange}
        value={endDate}
        className="wpifycf-field-date-range__end"
        min={endMin}
        max={max}
        disabled={disabled}
        {...attributes}
      />
    </div>
  );
}

DateRange.checkValidity = checkValidityDateRangeType;

export default DateRange;
