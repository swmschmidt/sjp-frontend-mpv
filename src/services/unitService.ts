import axios from 'axios';
import { Unit } from '../types/Unit';

export const fetchUnits = async (): Promise<Unit[]> => {
  const response = await axios.get('api/units');
  return response.data;
};

export const fetchUnitStock = async (id: string) => {
  const response = await axios.get(`api/unit/lookup/${id}`);
  return response.data;
};