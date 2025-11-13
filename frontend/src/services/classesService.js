import api from './api';

export const listClasses = async () => {
  const res = await api.get('/classes');
  return res.data.data || res.data;
};

export const createClass = async (payload) => {
  const res = await api.post('/classes', payload);
  return res.data;
};

export const updateClass = async (id, payload) => {
  const res = await api.put(`/classes/${id}`, payload);
  return res.data;
};

export const deleteClass = async (id) => {
  const res = await api.delete(`/classes/${id}`);
  return res.data;
};

export default {
  listClasses,
  createClass,
  updateClass,
  deleteClass,
};
