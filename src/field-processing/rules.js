/**
 * Tool-Specific Field Selection Rules
 *
 * All tool-specific field selection rules and processing logic.
 * Extracted from main.ts as part of the field processing module refactor.
 */
import { formatDateToYYYYMMDD } from './utils.js';
// PRD 2.1: Tool specific rules for get_projects
export const GET_PROJECTS_TOOL_SPECIFIC_RULES = {
    'dueDate': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'completedTime': { postProcessField: (value) => value ? formatDateToYYYYMMDD(value) : null },
    'manager': {
        optionalContainerSimplification: (managerObj) => managerObj ? { 'manager.name': managerObj.name } : { 'manager.name': null }
    }
};
// PRD 2.2: Tool specific rules for get_projects_by_projectId
export const GET_PROJECT_BY_ID_TOOL_SPECIFIC_RULES = {
    'dueDate': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'startDate': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'completedTime': { postProcessField: (value) => value ? formatDateToYYYYMMDD(value) : null },
    // PRD 2.2: Optional Field Simplification Default for manager
    'manager': {
        optionalContainerSimplification: (managerObj) => managerObj && managerObj.name ? { 'manager.name': managerObj.name } : { 'manager.name': null }
    }
};
// PRD 2.3: Tool specific rules for get_tasks_by_taskId
export const GET_TASK_BY_ID_TOOL_SPECIFIC_RULES = {
    'dueDate': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    // PRD 2.3: Optional Field Simplification Defaults
    'creator': {
        optionalContainerSimplification: (creatorObj) => creatorObj && creatorObj.name ? { 'creator.name': creatorObj.name } : { 'creator.name': null }
    },
    'workspace': {
        optionalContainerSimplification: (workspaceObj) => workspaceObj && workspaceObj.name ? { 'workspace.name': workspaceObj.name } : { 'workspace.name': null }
    },
    'project': {
        optionalContainerSimplification: (projectObj) => projectObj && projectObj.name ? { 'project.name': projectObj.name } : { 'project.name': null }
    }
    // Assignees array simplification will be added in Subtask 4.4
};
// Task 13.2: Tool specific rules for get_tasks
export const GET_TASKS_TOOL_SPECIFIC_RULES = {
    // Date formatting rules for relevant fields present in a task object
    'dueDate': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'completedTime': { postProcessField: (value) => value ? formatDateToYYYYMMDD(value) : null },
    'startOn': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'scheduledStart': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'scheduledEnd': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'createdTime': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'updatedTime': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    'lastInteractedTime': { postProcessField: (value) => formatDateToYYYYMMDD(value) },
    // Optional container simplification rules (as per PRD 1.3.1 and 2.3)
    'creator': {
        optionalContainerSimplification: (creatorObj) => creatorObj && creatorObj.name ? { 'creator.name': creatorObj.name } : { 'creator.name': null }
    },
    'workspace': {
        optionalContainerSimplification: (workspaceObj) => workspaceObj && workspaceObj.name ? { 'workspace.name': workspaceObj.name } : { 'workspace.name': null }
    },
    'project': {
        optionalContainerSimplification: (projectObj) => projectObj && projectObj.name ? { 'project.name': projectObj.name } : { 'project.name': null }
    },
    // Default/Optional item simplification for arrays (PRD 1.2.2, 2.3)
    'assignees': {
        defaultItemSimplification: (assignee) => assignee && assignee.name ? { name: assignee.name } : {}
    },
    'chunks': {
        defaultItemSimplification: (chunk) => {
            if (!chunk)
                return {};
            // Return all original properties of the chunk, but format dates within it
            return {
                ...chunk,
                scheduledStart: formatDateToYYYYMMDD(chunk.scheduledStart),
                scheduledEnd: formatDateToYYYYMMDD(chunk.scheduledEnd),
                completedTime: chunk.completedTime ? formatDateToYYYYMMDD(chunk.completedTime) : null
            };
        }
    }
    // `labels` is an array of strings, so no item simplification needed.
};
