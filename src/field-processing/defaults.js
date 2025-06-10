/**
 * Default Field Constants
 *
 * All default field arrays and configurations for different tools.
 * Extracted from main.ts as part of the field processing module refactor.
 */
// PRD 2.1: Default fields for get_projects
export const GET_PROJECTS_DEFAULT_FIELDS = [
    'id',
    'name',
    'description',
    'priorityLevel',
    'dueDate', // Date formatting to be handled in Subtask 2.2
    'status.name',
    'completedTime', // Date formatting to be handled in Subtask 2.2
    'taskCount'
];
// PRD 2.2: Recommended Default Fields for get_projects_by_projectId
export const GET_PROJECT_BY_ID_DEFAULT_FIELDS = [
    'id',
    'name',
    'description',
    'workspaceId',
    'priorityLevel',
    'dueDate',
    'startDate',
    'completedTime'
];
// PRD 2.3: Recommended Default Fields for get_tasks_by_taskId
export const GET_TASK_BY_ID_DEFAULT_FIELDS = [
    'id',
    'name',
    'status.name', // Assuming status is an object with a name property
    'priority',
    'dueDate',
    'scheduledStart',
    'scheduledEnd',
    'duration',
    'completed',
    'project.name' // Assuming project is an object with a name property
];
// PRD 2.4: Fixed fields for get_statuses
export const GET_STATUSES_FIXED_FIELDS = [
    'name',
    'isDefaultStatus',
    'isResolvedStatus'
];
// PRD 2.5: Fixed fields for get_users_me
export const GET_USERS_ME_FIXED_FIELDS = [
    'id',
    'name',
    'email'
];
// PRD 2.6: Fixed fields for get_users
export const GET_USERS_FIXED_FIELDS = [
    'id',
    'name',
    'email'
];
// PRD 2.7: Default fields for get_workspaces
export const GET_WORKSPACES_DEFAULT_FIELDS = [
    'id',
    'name'
];
// PRD 2.3 / Task 13.1: Default fields for get_tasks, aligning with get_tasks_by_taskId
export const GET_TASKS_DEFAULT_FIELDS = [
    'id',
    'name',
    'status.name',
    'priority',
    'dueDate',
    'scheduledStart',
    'scheduledEnd',
    'duration',
    'completed',
    'project.name'
];
