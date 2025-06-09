/**
 * HTTP 请求工具
 * 基于 axios 封装的请求工具
 */

import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiResponse } from "@/types";

/**
 * 创建 axios 实例
 * @returns {AxiosInstance} axios 实例
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 在请求发送前可以添加token等认证信息
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const { data } = response;

      // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
      if (response.status === 200) {
        return response;
      }

      // 否则的话抛出错误
      return Promise.reject(new Error(data.message || "请求失败"));
    },
    (error) => {
      // 对响应错误做处理
      console.error("请求错误:", error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// 导出 axios 实例
export const http = createAxiosInstance();

/**
 * GET 请求
 * @param {string} url 请求地址
 * @param {AxiosRequestConfig} config 请求配置
 * @returns {Promise<T>} 返回请求结果
 * @example
 * const result = await get<UserInfo>('/user/info')
 */
export const get = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return http.get(url, config);
};

/**
 * POST 请求
 * @param {string} url 请求地址
 * @param {any} data 请求数据
 * @param {AxiosRequestConfig} config 请求配置
 * @returns {Promise<T>} 返回请求结果
 * @example
 * const result = await post<ApiResponse>('/user/login', { username, password })
 */
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return http.post(url, data, config);
};

/**
 * PUT 请求
 * @param {string} url 请求地址
 * @param {any} data 请求数据
 * @param {AxiosRequestConfig} config 请求配置
 * @returns {Promise<T>} 返回请求结果
 * @example
 * const result = await put<ApiResponse>('/user/update', userData)
 */
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return http.put(url, data, config);
};

/**
 * DELETE 请求
 * @param {string} url 请求地址
 * @param {AxiosRequestConfig} config 请求配置
 * @returns {Promise<T>} 返回请求结果
 * @example
 * const result = await del<ApiResponse>('/user/delete/1')
 */
export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return http.delete(url, config);
};

export default http;
