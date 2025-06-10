/**
 * Field Processing Core Logic
 *
 * Main data processing logic for field selection and transformation.
 * Extracted from main.ts as part of the field processing module refactor.
 */
import { getValueByPath } from './utils.js';
// Main utility function to select and transform fields from data
export function selectFieldsFromData(data, requestedFields, toolDefaultFields, toolSpecificRules) {
    const effectiveFields = (requestedFields && requestedFields.length > 0)
        ? requestedFields
        : (toolDefaultFields && toolDefaultFields.length > 0 ? toolDefaultFields : []);
    const isDefaultMode = !(requestedFields && requestedFields.length > 0);
    if (effectiveFields.length === 0 || data === null || data === undefined) {
        return Array.isArray(data) ? [] : {};
    }
    if (Array.isArray(data)) {
        return data.map(item => _processSingleObjectInternal(item, effectiveFields, toolSpecificRules, isDefaultMode));
    }
    else {
        return _processSingleObjectInternal(data, effectiveFields, toolSpecificRules, isDefaultMode);
    }
}
// Helper function to process a single object based on specified fields and rules
export function _processSingleObjectInternal(obj, fieldsToSelect, 
// toolSpecificRules will be used in later subtasks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
toolSpecificRules, isDefaultMode // Added for Subtask 1.3
) {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return {}; // Or null, depending on desired behavior for non-objects
    }
    const result = {};
    for (const fieldPath of fieldsToSelect) {
        let currentValue;
        let isValidField = false;
        // MODIFICATION FOR SUBTASK 1.2:
        if (fieldPath.includes('.')) {
            const { value, found } = getValueByPath(obj, fieldPath);
            if (found) {
                currentValue = value; // Store for further processing
                isValidField = true;
            }
            else {
                // Optionally set to null if not found, or omit. PRD implies omitting or standard error later.
                // For now, let's omit if not found to keep responses clean.
                isValidField = false;
            }
        }
        else if (Object.prototype.hasOwnProperty.call(obj, fieldPath)) {
            currentValue = obj[fieldPath]; // Store for further processing
            isValidField = true;
        }
        else {
            isValidField = false;
        }
        if (isValidField) {
            if (Array.isArray(currentValue)) {
                const itemSimplificationRule = toolSpecificRules?.[fieldPath]?.defaultItemSimplification;
                // Apply itemSimplificationRule if it exists, regardless of isDefaultMode, 
                // when the array field itself (fieldPath) is being processed.
                // This handles cases like PRD 2.3's "simplified optional" for assignees.
                if (typeof itemSimplificationRule === 'function') {
                    try {
                        result[fieldPath] = currentValue.map(itemSimplificationRule);
                    }
                    catch (e) {
                        console.error(`Error applying itemSimplificationRule for field '${fieldPath}':`, e);
                        result[fieldPath] = currentValue; // Fallback to full array on rule error
                    }
                }
                else {
                    // No specific simplification rule for this array field (or it was handled by fields like array[].property).
                    // If !isDefaultMode, PRD 1.3.3 (return full array) applies unless a rule handled it.
                    // If isDefaultMode and no rule, also return full array (e.g. array of primitives).
                    result[fieldPath] = currentValue;
                }
            }
            else if (typeof currentValue === 'object' && currentValue !== null && !isDefaultMode) {
                // Optional Mode for an object field, check for container simplification (PRD 1.3.1)
                const containerRule = toolSpecificRules?.[fieldPath]?.optionalContainerSimplification;
                if (typeof containerRule === 'function') {
                    try {
                        const simplifiedObject = containerRule(currentValue);
                        Object.assign(result, simplifiedObject); // Merge properties from rule output
                    }
                    catch (e) {
                        console.error(`Error applying optionalContainerSimplification for field '${fieldPath}':`, e);
                        // If rule fails, the original object might still be added if fieldPath was directly requested
                        // and no other rule applies. This part handles the rule itself failing.
                        // If fieldPath was a direct request (e.g. fields:["manager"]) and rule fails,
                        // it will fall through to the general 'else' block below if not already handled.
                        // To ensure it doesn't get added again by the generic logic if the rule was the SOLE source for these fields:
                        // We can check if result[fieldPath] was already set OR if the rule was supposed to be the exclusive handler for this fieldPath.
                        // For now, the Object.assign is simply skipped. If the fieldPath itself was requested, it might be added by the generic handler later.
                        // This behavior might need refinement based on how strictly PRD 1.3.1 should be interpreted on rule failure.
                    }
                }
                else {
                    // Optional mode, object, but no specific container simplification rule.
                    result[fieldPath] = currentValue;
                }
            }
            else {
                // Primitive value, or an object in default mode (no special container simplification for objects in default mode by default)
                result[fieldPath] = currentValue;
            }
        }
    }
    // Apply post-processing rules after all fields are initially populated
    for (const fieldKey in result) {
        if (Object.prototype.hasOwnProperty.call(result, fieldKey)) {
            const postProcessRule = toolSpecificRules?.[fieldKey]?.postProcessField;
            if (typeof postProcessRule === 'function') {
                try {
                    result[fieldKey] = postProcessRule(result[fieldKey]);
                }
                catch (e) {
                    console.error(`Error applying postProcessField for field '${fieldKey}':`, e);
                    // On error, leave the original selected value in place
                }
            }
        }
    }
    return result;
}
