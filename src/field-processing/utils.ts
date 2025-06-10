/**
 * Field Processing Utilities
 * 
 * Core utility functions for field selection and data transformation.
 * Extracted from main.ts as part of the field processing module refactor.
 */

// Helper function to retrieve a value from an object using a dot-notation path
export function getValueByPath(obj: any, path: string): { value: any; found: boolean } {
  if (obj === null || obj === undefined || typeof obj !== 'object' || !path) {
    return { value: undefined, found: false };
  }
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, part)) {
      return { value: undefined, found: false };
    }
    current = current[part];
  }
  return { value: current, found: true };
}

// Utility function to format a date string to YYYY-MM-DD
// Returns original string if parsing fails or input is invalid, or null if input is null/undefined.
export function formatDateToYYYYMMDD(dateString: string | null | undefined): string | null {
  if (dateString === null || dateString === undefined) {
    return null;
  }
  try {
    // Check if it's already in YYYY-MM-DD format to avoid re-processing
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    const date = new Date(dateString);
    // Check if date is valid after parsing
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid date string
    }
    return date.toISOString().split('T')[0];
  } catch (e) {
    // In case of any other error during parsing or processing
    return dateString; // Return original string on error as per PRD nuance
  }
}

// Utility function to format specific date fields within an object to YYYY-MM-DD
// Modifies the object in place if a field is found and validly formatted, 
// otherwise leaves it as is or as formatted by formatDateToYYYYMMDD (which can return original on error).
export function formatObjectDates(obj: any, dateFieldPaths: string[]): void {
  if (!obj || typeof obj !== 'object' || !dateFieldPaths || dateFieldPaths.length === 0) {
    return; // No object or no fields to process
  }

  for (const path of dateFieldPaths) {
    let current = obj;
    const parts = path.split('.');
    const lastPart = parts.pop(); // Get the actual field name and remove it from parts

    if (!lastPart) continue; // Should not happen with valid paths

    // Navigate to the parent of the target field
    let parent = obj;
    for (const part of parts) {
      if (parent && typeof parent === 'object' && Object.prototype.hasOwnProperty.call(parent, part)) {
        parent = parent[part];
      } else {
        parent = null; // Path is invalid or part not found
        break;
      }
    }

    // If parent is valid and has the target field, format it
    if (parent && typeof parent === 'object' && Object.prototype.hasOwnProperty.call(parent, lastPart)) {
      const originalValue = parent[lastPart];
      const formattedDate = formatDateToYYYYMMDD(originalValue);
      // formatDateToYYYYMMDD returns original on error/invalid, or null if input was null.
      // We only update if it makes sense (e.g. if formatDateToYYYYMMDD actually changed it or it was null)
      if (formattedDate !== originalValue || originalValue === null) { 
        parent[lastPart] = formattedDate;
      }
    }
  }
}


