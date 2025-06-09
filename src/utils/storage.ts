/**
 * 本地存储工具函数
 * 包含 localStorage 和 sessionStorage 的封装
 */

/**
 * localStorage 操作类
 */
export class LocalStorage {
  /**
   * 设置本地存储
   * @param {string} key 存储键
   * @param {any} value 存储值
   * @returns {boolean} 是否设置成功
   * @example
   * LocalStorage.set('user', { name: 'John', age: 30 })
   */
  static set(key: string, value: any): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error("LocalStorage set error:", error);
      return false;
    }
  }

  /**
   * 获取本地存储
   * @param {string} key 存储键
   * @param {any} defaultValue 默认值
   * @returns {any} 存储值
   * @example
   * const user = LocalStorage.get('user', {})
   */
  static get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error("LocalStorage get error:", error);
      return defaultValue ?? null;
    }
  }

  /**
   * 删除本地存储
   * @param {string} key 存储键
   * @returns {boolean} 是否删除成功
   * @example
   * LocalStorage.remove('user')
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("LocalStorage remove error:", error);
      return false;
    }
  }

  /**
   * 清空本地存储
   * @returns {boolean} 是否清空成功
   * @example
   * LocalStorage.clear()
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("LocalStorage clear error:", error);
      return false;
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key 存储键
   * @returns {boolean} 是否存在
   * @example
   * const hasUser = LocalStorage.has('user')
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * sessionStorage 操作类
 */
export class SessionStorage {
  /**
   * 设置会话存储
   * @param {string} key 存储键
   * @param {any} value 存储值
   * @returns {boolean} 是否设置成功
   * @example
   * SessionStorage.set('temp', { data: 'temporary' })
   */
  static set(key: string, value: any): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error("SessionStorage set error:", error);
      return false;
    }
  }

  /**
   * 获取会话存储
   * @param {string} key 存储键
   * @param {any} defaultValue 默认值
   * @returns {any} 存储值
   * @example
   * const temp = SessionStorage.get('temp', {})
   */
  static get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error("SessionStorage get error:", error);
      return defaultValue ?? null;
    }
  }

  /**
   * 删除会话存储
   * @param {string} key 存储键
   * @returns {boolean} 是否删除成功
   * @example
   * SessionStorage.remove('temp')
   */
  static remove(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("SessionStorage remove error:", error);
      return false;
    }
  }

  /**
   * 清空会话存储
   * @returns {boolean} 是否清空成功
   * @example
   * SessionStorage.clear()
   */
  static clear(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("SessionStorage clear error:", error);
      return false;
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key 存储键
   * @returns {boolean} 是否存在
   * @example
   * const hasTemp = SessionStorage.has('temp')
   */
  static has(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }
}

// 默认导出 localStorage 操作
export default LocalStorage;
