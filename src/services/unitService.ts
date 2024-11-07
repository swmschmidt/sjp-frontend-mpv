import axios from 'axios';
import { Unit } from '../types/Unit';

const API_URL = "https://flask-app-rough-glitter-6700.fly.dev"

export const fetchUnits = async (): Promise<Unit[]> => {
  const response = await axios.get(`${API_URL}/units`);
  return response.data;
};

export const fetchUnitStock = async (id: string) => {
  const response = await axios.get(`${API_URL}/unit/lookup/${id}`);
  return response.data;
};