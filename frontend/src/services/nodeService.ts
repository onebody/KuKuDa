import api from './api';
import { NodeData, ConnectionData } from '../types/node';
import { NodeType, NodeConfig } from '../types/node';

export const addNode = (workflowId, data) => {
  return api.post('/api/workflows/' + workflowId + '/nodes', data).then(res => res.data.data);
};

export const getWorkflowNodes = (workflowId) => {
  return api.get('/api/workflows/' + workflowId + '/nodes').then(res => res.data.data);
};

export const updateNode = (id, data) => {
  return api.put('/api/nodes/' + id, data).then(res => res.data.data);
};

export const deleteNode = (id) => {
  return api.delete('/api/nodes/' + id).then(() => undefined);
};

export const addConnection = (workflowId, data) => {
  return api.post('/api/workflows/' + workflowId + '/connections', data).then(res => res.data.data);
};

export const getWorkflowConnections = (workflowId) => {
  return api.get('/api/workflows/' + workflowId + '/connections').then(res => res.data.data);
};

export const deleteConnection = (id) => {
  return api.delete('/api/connections/' + id).then(() => undefined);
};

export const saveWorkflow = (workflowId, data) => {
  return api.put('/api/workflows/' + workflowId + '/save', data).then(res => res.data.data);
};
