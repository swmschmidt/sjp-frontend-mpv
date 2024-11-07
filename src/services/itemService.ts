import axios from 'axios';
import { Item } from '../types/Item';

const API_URL = "https://flask-app-rough-glitter-6700.fly.dev"

export const fetchItems = async (): Promise<Item[]> => {
  const response = await axios.get(`${API_URL}/items`);
  return response.data;
};

export const fetchItemStock = async (id: string) => {
  const response = await axios.get(`${API_URL}/item/lookup/${id}`);
  return response.data;
};