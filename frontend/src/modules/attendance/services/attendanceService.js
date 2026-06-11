const BASE_URL = 'http://localhost:4000/api'; // Matched with NestJS backend port and prefix

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

class AttendanceService {
  async markAttendance(data) {
    const response = await fetch(`${BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to mark attendance');
    return response.json();
  }

  async getStudentAttendance() {
    const response = await fetch(`${BASE_URL}/attendance/student/me`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return response.json();
  }

  async getClassAttendance(classId, date) {
    const response = await fetch(`${BASE_URL}/attendance/class/${classId}?date=${date}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch class attendance');
    return response.json();
  }

  async updateAttendance(id, data) {
    const response = await fetch(`${BASE_URL}/attendance/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update attendance');
    return response.json();
  }

  async getTeacherClasses() {
    // Mock classes for now until we have real API
    return [
      { id: 'class_1', name: 'Class 10A' },
      { id: 'class_2', name: 'Class 10B' }
    ];
  }

  async getStudentsByClass(classId) {
    const response = await fetch(`${BASE_URL}/students/class/${classId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
