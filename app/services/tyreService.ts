import { api } from "@/lib/api/api-client";

export interface Option {
  label: string;
  value: string;
}

// ✅ Width API
export const getWidth = async (): Promise<Option[]> => {
  try {
    const data = await api.get("/kleverapi/tyre-size/width");
    if (!Array.isArray(data)) return [];
    return data.map(item => ({ label: item, value: item }));
  } catch (error) {
    console.log("Width API Error:", error);
    return [];
  }
};

// ✅ Height API
export const getHeight = async (width: string): Promise<Option[]> => {
  try {
    const data = await api.get(`/kleverapi/tyre-size/height?width=${width}`);
    if (!Array.isArray(data)) return [];
    return data.map(item => ({ label: item, value: item }));
  } catch (error) {
    console.log("Height API Error:", error);
    return [];
  }
};

// ✅ Rim API
export const getRim = async (width: string, height: string): Promise<Option[]> => {
  try {
    const data = await api.get(`/kleverapi/tyre-size/rim?width=${width}&height=${height}`);
    if (!Array.isArray(data)) return [];
    return data.map(item => ({ label: item, value: item }));
  } catch (error) {
    console.log("Rim API Error:", error);
    return [];
  }
};