export interface Option {
  label: string;
  value: string;
}

// ✅ Width API — calls local server-side route
export const getWidth = async (): Promise<Option[]> => {
  try {
    const res = await fetch("/api/tyre-size/width");
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: string) => ({ label: item, value: item }));
  } catch (error) {
    console.log("Width API Error:", error);
    return [];
  }
};

// ✅ Height API
export const getHeight = async (width: string): Promise<Option[]> => {
  try {
    const res = await fetch(`/api/tyre-size/height?width=${width}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: string) => ({ label: item, value: item }));
  } catch (error) {
    console.log("Height API Error:", error);
    return [];
  }
};

// ✅ Rim API
export const getRim = async (width: string, height: string): Promise<Option[]> => {
  try {
    const res = await fetch(`/api/tyre-size/rim?width=${width}&height=${height}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: string) => ({ label: item, value: item }));
  } catch (error) {
    console.log("Rim API Error:", error);
    return [];
  }
};