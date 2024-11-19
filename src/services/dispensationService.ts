import axios from "axios";

const API_URL = "https://flask-app-rough-glitter-6700.fly.dev";

export const fetchDispensationByHour = async (
  unitId: string,
  itemId: string,
  date: string
) => {
  const response = await axios.get(
    `${API_URL}/dispensation/by_hour/unit_item/${unitId}/${itemId}/${date}`
  );
  return response.data;
};

export const fetchDispensationByDay = async (unitId: string, date: string) => {
  const response = await axios.get(
    `${API_URL}/dispensation/by_day/unit/${unitId}/${date}`
  );
  return response.data;
};
