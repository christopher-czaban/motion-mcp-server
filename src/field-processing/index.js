/**
 * Field Processing Module
 *
 * Central export point for all field processing utilities, defaults, rules, and processors.
 * This module provides a clean interface for field selection and data transformation.
 */
// Export utility functions
export { getValueByPath, formatDateToYYYYMMDD, formatObjectDates } from './utils.js';
// Export processing functions
export { selectFieldsFromData, _processSingleObjectInternal } from './processor.js';
// Export default field constants
export { GET_PROJECTS_DEFAULT_FIELDS, GET_PROJECT_BY_ID_DEFAULT_FIELDS, GET_TASK_BY_ID_DEFAULT_FIELDS, GET_STATUSES_FIXED_FIELDS, GET_USERS_ME_FIXED_FIELDS, GET_USERS_FIXED_FIELDS, GET_WORKSPACES_DEFAULT_FIELDS, GET_TASKS_DEFAULT_FIELDS } from './defaults.js';
// Export tool-specific rules
export { GET_PROJECTS_TOOL_SPECIFIC_RULES, GET_PROJECT_BY_ID_TOOL_SPECIFIC_RULES, GET_TASK_BY_ID_TOOL_SPECIFIC_RULES, GET_TASKS_TOOL_SPECIFIC_RULES } from './rules.js';
