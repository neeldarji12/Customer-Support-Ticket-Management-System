import initialData from '../data/db.json' with { type: 'json' };
import { apiRequest } from './apiClient.js';

const STORAGE_KEY = 'cstms_agents';

function getStoredAgents() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return initialData.agents || [];
  }
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData.agents || []));
    return initialData.agents || [];
  }
  try {
    const parsed = JSON.parse(local);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : (initialData.agents || []);
  } catch {
    return initialData.agents || [];
  }
}

function saveStoredAgents(agents) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  }
}

export const agentApi = {
  // GET /agents
  async getAgents() {
    try {
      const data = await apiRequest('/agents');
      if (Array.isArray(data) && data.length > 0) {
        saveStoredAgents(data);
        return data;
      }
    } catch {
      // JSON Server stopped or network unreachable: seamlessly fall back to local mock
    }
    return [...getStoredAgents()];
  },

  // GET /agents/:id
  async getAgentById(id) {
    try {
      const data = await apiRequest(`/agents/${id}`);
      if (data && data.id) {
        return data;
      }
    } catch (err) {
      if (err.status === 404) {
        throw new Error(`Agent with ID ${id} not found`);
      }
      // JSON Server stopped: fall back to local mock
    }

    const agent = getStoredAgents().find(a => a.id === id);
    if (agent) return { ...agent };
    throw new Error(`Agent with ID ${id} not found`);
  }
};
