/**
 * TeacherService - Handles teacher data operations.
 *
 * This service abstracts data access for teachers. It uses local JSON for now,
 * but can be easily switched to backend API in the future. All methods are async and return Promises.
 *
 * To integrate with backend, replace the local logic with API calls and add error handling as shown in comments.
 */

import teachersData from '@/data/teachers.json';

// Simulate network delay for local operations
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let teachers = [...teachersData];

/**
 * Get all teachers
 * @returns {Promise<Array>} List of teachers
 */
export async function getTeachers() {
  // For backend: return await apiRequest(API_ENDPOINTS.teachers.list)
  await delay(200); // Simulate latency
  return [...teachers];
}

/**
 * Add a new teacher
 * @param {Object} teacher - Teacher object
 * @returns {Promise<Object>} Added teacher
 */
export async function addTeacher(teacher) {
  // For backend: try { return await apiRequest(API_ENDPOINTS.teachers.add, { method: 'POST', body: teacher }) } catch (e) { handle error }
  await delay(200);
  const next = { ...teacher, id: `T-${String(teachers.length + 1).padStart(3, '0')}` };
  teachers = [next, ...teachers];
  return next;
}

/**
 * Update a teacher
 * @param {string} id - Teacher ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated teacher
 */
export async function updateTeacher(id, updates) {
  // For backend: try { return await apiRequest(API_ENDPOINTS.teachers.update(id), { method: 'PUT', body: updates }) } catch (e) { handle error }
  await delay(200);
  teachers = teachers.map((t) => (t.id === id ? { ...t, ...updates } : t));
  return teachers.find((t) => t.id === id);
}

/**
 * Delete a teacher
 * @param {string} id - Teacher ID
 * @returns {Promise<void>}
 */
export async function deleteTeacher(id) {
  // For backend: try { await apiRequest(API_ENDPOINTS.teachers.delete(id), { method: 'DELETE' }) } catch (e) { handle error }
  await delay(200);
  teachers = teachers.filter((t) => t.id !== id);
}

/**
 * Clone a teacher
 * @param {Object} teacher - Teacher object to clone
 * @returns {Promise<Object>} Cloned teacher
 */
export async function cloneTeacher(teacher) {
  await delay(200);
  const next = {
    ...teacher,
    id: `T-${String(teachers.length + 1).padStart(3, '0')}`,
    name: `${teacher.name} (Copy)`,
    shortName: teacher.shortName ? `${teacher.shortName}-2` : teacher.name,
  };
  teachers = [next, ...teachers];
  return next;
}

// For testing/demo: Add more teachers if needed
export function seedMoreTeachers(extra = 5) {
  for (let i = 0; i < extra; i++) {
    teachers.push({
      id: `T-${String(teachers.length + 1).padStart(3, '0')}`,
      name: `Demo Teacher ${teachers.length + 1}`,
      shortName: `D.T${teachers.length + 1}`,
      subject: 'Demo Subject',
      phone: '',
      classes: [],
    });
  }
}
