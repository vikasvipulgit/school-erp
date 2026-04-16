/**
 * Validate subject frequency for a class/section.
 */
export function validateSubjectFrequency(classId, sectionId, state) {
  const issues = [];
  const requirements = state.subjectRequirements?.[classId]?.[sectionId] || {};

  Object.entries(requirements).forEach(([subjectId, req]) => {
    const subjectName = state.indexes.subjectsById[subjectId]?.name || 'Subject';

    if (req.filled < req.required) {
      issues.push({
        type: 'UNDER_SCHEDULED',
        subjectId,
        required: req.required,
        filled: req.filled,
        gap: req.required - req.filled,
        message: `${subjectName} needs ${req.required} periods/week — only ${req.filled} assigned`,
      });
    }

    if (req.filled > req.required) {
      issues.push({
        type: 'OVER_SCHEDULED',
        subjectId,
        message: `${subjectName} has ${req.filled} periods — exceeds required ${req.required}`,
      });
    }
  });

  return issues;
}
