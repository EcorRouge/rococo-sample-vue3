import { format, parseISO } from 'date-fns'

/**
 * Format a date string to a human-readable format
 * @param {string} dateString - ISO date string
 * @param {string} formatStr - Format string for date-fns
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, formatStr = 'MMM d, yyyy') {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), formatStr)
  } catch (e) {
    console.error('Error formatting date:', e)
    return dateString
  }
}

/**
 * Format a date string with time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string with time
 */
export function formatDateWithTime(dateString) {
  return formatDate(dateString, 'MMM d, yyyy h:mm a')
}