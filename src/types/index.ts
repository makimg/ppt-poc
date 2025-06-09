/**
 * TypeScript 类型定义入口文件
 * 用于导出项目中的各种类型定义
 */

// 通用类型定义
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 用户相关类型
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

// 分页类型
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

// API 响应类型
export interface ApiResponse<T = any> extends BaseResponse<T> {
  success: boolean;
}

// 表单规则类型
export interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: string | string[];
  min?: number;
  max?: number;
  pattern?: RegExp;
}

// 导出其他模块的类型
// export * from './user'
// export * from './api'
