import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

function mapFromApi(t) {
  return {
    id: t.id,
    name: t.name,
    shortName: t.shortName || '',
    subject: t.subject?.name || t.subjectNames?.[0] || '',
    subjectId: t.subjectId || '',
    classes: t.gradeLevel || [],
    phone: t.phone || '',
    email: t.email || '',
    employeeCode: t.employeeCode || '',
    isClassTeacher: t.isClassTeacher || false,
    classTeacherClassId: t.classTeacherClassId || null,
  };
}

export async function getTeachers() {
  const list = await apiRequest(API_ENDPOINTS.teachers.list);
  return list.map(mapFromApi);
}

export async function getSubjects() {
  return apiRequest(API_ENDPOINTS.subjects.list);
}

export async function addTeacher(teacher) {
  const payload = {
    name: teacher.name,
    shortName: teacher.shortName || '',
    email: teacher.email,
    password: teacher.password,
    phone: teacher.phone || '',
    subjectId: teacher.subjectId,
    // Keep backward compatibility
    subjectIds: teacher.subjectId ? [teacher.subjectId] : [],
    subjectNames: teacher.subjectName ? [teacher.subjectName] : [],
    gradeLevel: teacher.classes || [],
    isClassTeacher: teacher.isClassTeacher || false,
    ...(teacher.isClassTeacher && teacher.classTeacherClassId ? { classTeacherClassId: teacher.classTeacherClassId } : {}),
  };
  const result = await apiRequest(API_ENDPOINTS.teachers.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapFromApi(result);
}

export async function updateTeacher(id, updates) {
  const payload = {
    name: updates.name,
    shortName: updates.shortName,
    phone: updates.phone,
    subjectId: updates.subjectId,
    // Keep backward compatibility
    subjectIds: updates.subjectId ? [updates.subjectId] : [],
    subjectNames: updates.subjectName ? [updates.subjectName] : [],
    gradeLevel: updates.classes || [],
    isClassTeacher: updates.isClassTeacher !== undefined ? updates.isClassTeacher : false,
    classTeacherClassId: updates.isClassTeacher ? updates.classTeacherClassId : null,
  };
  const result = await apiRequest(API_ENDPOINTS.teachers.update(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapFromApi(result);
}

export async function deleteTeacher(id) {
  await apiRequest(API_ENDPOINTS.teachers.remove(id), { method: 'DELETE' });
}

export async function cloneTeacher(teacher) {
  const payload = {
    name: `${teacher.name} (Copy)`,
    shortName: teacher.shortName ? `${teacher.shortName}-2` : '',
    email: teacher.cloneEmail,
    password: teacher.clonePassword,
    phone: teacher.phone || '',
    subjectId: teacher.subjectId,
    subjectIds: teacher.subjectId ? [teacher.subjectId] : [],
    subjectNames: teacher.subjectName ? [teacher.subjectName] : [],
    gradeLevel: teacher.classes || [],
  };
  const result = await apiRequest(API_ENDPOINTS.teachers.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapFromApi(result);
}
