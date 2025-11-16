import { createMMKV } from 'react-native-mmkv';

export default class Storage {
  constructor(dbName) {
    this.storage = createMMKV({
      id: dbName
    });
  }

  async getItem(k) {
    const value = this.storage.getString(k);
    return value === undefined ? null : value;
  }

  async setItem(k, v) {
    this.storage.set(k, v);
  }
}