import api from './api';

export const listTeachers = async () => {
  const res = await api.get('/teachers');
  return res.data.data;
};

export const getTeacher = async (id) => {
  const res = await api.get(`/teachers/${id}`);
  return res.data.data;
};

export const createTeacher = async (payload) => {
  const res = await api.post('/teachers', payload);
  return res.data;
};

export const updateTeacher = async (id, payload) => {
  const res = await api.put(`/teachers/${id}`, payload);
  return res.data;
};

export const deleteTeacher = async (id) => {
  const res = await api.delete(`/teachers/${id}`);
  return res.data;
};

export default {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
