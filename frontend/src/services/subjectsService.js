import api from './api';

export const listSubjects = async () => {
  const res = await api.get('/subjects');
  return res.data.data;
};

export const createSubject = async (payload) => {
  const res = await api.post('/subjects', payload);
  return res.data;
};

export const updateSubject = async (id, payload) => {
  const res = await api.put(`/subjects/${id}`, payload);
  return res.data;
};

export const deleteSubject = async (id) => {
  const res = await api.delete(`/subjects/${id}`);
  return res.data;
};

export default {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
