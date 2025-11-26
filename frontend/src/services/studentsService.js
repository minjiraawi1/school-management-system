import api from './api';

export const listStudents = async () => {
  const res = await api.get('/students');
  return res.data.data;
};

export const listStudentsByClass = async (classId) => {
  const res = await api.get(`/students/class/${classId}`);
  return res.data.data;
};

export const getStudent = async (id) => {
  const res = await api.get(`/students/${id}`);
  return res.data.data;
};

export const createStudent = async (payload) => {
  const res = await api.post('/students', payload);
  return res.data;
};

export const updateStudent = async (id, payload) => {
  const res = await api.put(`/students/${id}`, payload);
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
};

export default {
  listStudents,
  listStudentsByClass,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
