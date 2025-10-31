import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface EntitySummary {
  id: string;
  name: string;
  type: string;
}

export interface InfluenceNode {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
}

export interface InfluenceGraph {
  center: InfluenceNode;
  influenced_by: InfluenceNode[];
  influences: InfluenceNode[];
}

export const searchEntities = async (
  query: string,
  limit: number = 10
): Promise<EntitySummary[]> => {
  const response = await api.get("/api/search", {
    params: { q: query, limit },
  });
  return response.data;
};

export const getInfluenceGraph = async (
  id: string
): Promise<InfluenceGraph> => {
  const response = await api.get(`/api/entities/${id}/influences`);
  return response.data;
};
