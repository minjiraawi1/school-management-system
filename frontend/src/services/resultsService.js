import api from './api';

export const getPendingApprovals = async () => {
  const response = await api.get('/results/approvals/pending');
  return response.data.data;
};

export const approveResult = async (id, notes) => {
  const response = await api.put(`/results/approve/${id}`, { notes });
  return response.data;
};

export const rejectResult = async (id, notes) => {
  const response = await api.put(`/results/reject/${id}`, { notes });
  return response.data;
};
