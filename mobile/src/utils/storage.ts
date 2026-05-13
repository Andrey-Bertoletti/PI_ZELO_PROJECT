import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const useSecure = Platform.OS === 'ios' || Platform.OS === 'android';

export async function get(key: string): Promise<string | null> {
  if (useSecure) return SecureStore.getItemAsync(key);
  return AsyncStorage.getItem(key);
}

export async function set(key: string, value: string): Promise<void> {
  if (useSecure) return SecureStore.setItemAsync(key, value);
  return AsyncStorage.setItem(key, value);
}

export async function remove(key: string): Promise<void> {
  if (useSecure) return SecureStore.deleteItemAsync(key);
  return AsyncStorage.removeItem(key);
}
