
export function formatToNYTime(date: string | Date, options: Intl.DateTimeFormatOptions = {}): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    
    return d.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      ...options,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
}

export function formatToNYDate(date: string | Date): string {
  return formatToNYTime(date, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatToNYShortTime(date: string | Date): string {
  return formatToNYTime(date, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
}
