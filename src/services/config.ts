import axios from "axios";
import { ElMessage } from "element-plus";

/**
 * 创建axios实例
 * 配置基础URL和超时时间
 */
const instance = axios.create({
  baseURL: import.meta.env.BASE_URL,
  timeout: 1000 * 300,
});

instance.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 400) {
      return Promise.resolve(response.data);
    }

    ElMessage.error("未知的请求错误！");
    return Promise.reject(response);
  },
  (error) => {
    if (error && error.response) {
      if (error.response.status >= 400 && error.response.status < 500) {
        return Promise.reject(error.message);
      } else if (error.response.status >= 500) {
        return Promise.reject(error.message);
      }

      ElMessage.error("服务器遇到未知错误！");
      return Promise.reject(error.message);
    }

    ElMessage.error("连接到服务器失败 或 服务器响应超时！");
    return Promise.reject(error);
  }
);

export default instance;
