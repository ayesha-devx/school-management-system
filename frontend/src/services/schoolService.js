import API from './api';

/**
 * Fetch the school metadata and nested class/student structures
 * GET /api/school
 */
export const getSchoolData = async () => {
  const response = await API.get('/school');
  return response.data;
};

/**
 * Fetch all classes
 * GET /api/classes
 */
export const getClassesData = async () => {
  const response = await API.get('/classes');
  return response.data;
};

/**
 * Fetch a single class by identifier
 * GET /api/classes/:classId
 */
export const getClassById = async (classId) => {
  const response = await API.get(`/classes/${classId}`);
  return response.data;
};

/**
 * Fetch students belonging to a class
 * GET /api/classes/:classId/students
 */
export const getClassStudents = async (classId) => {
  const response = await API.get(`/classes/${classId}/students`);
  return response.data;
};

/**
 * Enroll a student in a class
 * POST /api/students
 */
export const enrollStudent = async (studentData) => {
  const response = await API.post('/students', studentData);
  return response.data;
};

/**
 * Unenroll a student from a specific class
 * DELETE /api/classes/:classId/students/:studentId
 */
export const unenrollStudent = async (classId, studentId) => {
  const response = await API.delete(`/classes/${classId}/students/${studentId}`);
  return response.data;
};

/**
 * Update student record details
 * PUT /api/students/:studentCode
 */
export const updateStudent = async (studentCode, updateData) => {
  const response = await API.put(`/students/${studentCode}`, updateData);
  return response.data;
};
