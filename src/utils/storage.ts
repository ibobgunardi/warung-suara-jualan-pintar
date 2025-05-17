
// This is a mock implementation for web preview
// In a real React Native app, we would use AsyncStorage instead
// To simulate persistent storage, we'll use localStorage for the web version

interface SalesItem {
  barang: string;
  jumlah: number;
  harga: number;
}

interface SalesEntry {
  date: string;
  items: SalesItem[];
  total: number;
}

const STORAGE_KEY = 'waras_sales_history';

// Save sales data
export const saveSalesData = async (data: SalesEntry): Promise<void> => {
  try {
    // Get existing data
    const existingDataStr = localStorage.getItem(STORAGE_KEY);
    let existingData: SalesEntry[] = [];
    
    if (existingDataStr) {
      existingData = JSON.parse(existingDataStr);
    }
    
    // Add new data at the beginning
    const updatedData = [data, ...existingData];
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error saving sales data:', error);
    return Promise.reject(error);
  }
};

// Get all sales data
export const getAllSalesData = async (): Promise<SalesEntry[]> => {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) {
      return [];
    }
    
    return JSON.parse(dataStr);
  } catch (error) {
    console.error('Error getting sales data:', error);
    return Promise.reject(error);
  }
};

// Clear all sales data
export const clearAllSalesData = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve();
  } catch (error) {
    console.error('Error clearing sales data:', error);
    return Promise.reject(error);
  }
};

// In a real React Native application, we would implement these functions using AsyncStorage:
/*
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveSalesData = async (data: SalesEntry): Promise<void> => {
  try {
    const existingDataStr = await AsyncStorage.getItem(STORAGE_KEY);
    let existingData: SalesEntry[] = [];
    
    if (existingDataStr) {
      existingData = JSON.parse(existingDataStr);
    }
    
    const updatedData = [data, ...existingData];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving sales data:', error);
    throw error;
  }
};

export const getAllSalesData = async (): Promise<SalesEntry[]> => {
  try {
    const dataStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!dataStr) {
      return [];
    }
    
    return JSON.parse(dataStr);
  } catch (error) {
    console.error('Error getting sales data:', error);
    throw error;
  }
};

export const clearAllSalesData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing sales data:', error);
    throw error;
  }
};
*/
