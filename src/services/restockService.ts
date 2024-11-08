import axios from 'axios';

const API_URL = "https://flask-app-rough-glitter-6700.fly.dev";

export const fetchUnitRestockStatus = async (unitId: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/restock/cache/${unitId}`);
    return response.status === 200;
  } catch (error) {
    console.error('Error fetching restock status:', error);
    return false;
  }
};

export const fetchUnitRestockDetails = async (unitId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/restock/cache/${unitId}`);
    if (response.status === 200) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching restock details:', error);
    return [];
  }
};

export const fetchUniqueRestockUnits = async (): Promise<string[]> => {
    try {
      const response = await axios.get(`${API_URL}/restock/cache/unique-units`);
      return response.data.unique_unit_ids || [];
    } catch (error) {
      console.error('Error fetching unique restock units:', error);
      return [];
    }
  };