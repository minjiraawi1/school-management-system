import api from './api';

export const listAssignments = async () => {
  const res = await api.get('/assignments');
  return res.data.data;
};

export const getTeacherAssignments = async (teacherId) => {
  const res = await api.get(`/assignments/teacher/${teacherId}`);
  return res.data.data;
};

export const createAssignment = async (payload) => {
  const res = await api.post('/assignments', payload);
  return res.data;
};

export const deleteAssignment = async (id) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};

export default {
  listAssignments,
  getTeacherAssignments,
  createAssignment,
  deleteAssignment,
};
