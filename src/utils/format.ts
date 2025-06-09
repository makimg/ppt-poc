/**
 * 格式化工具函数
 * 包含日期、数字、文本等格式化功能
 */

/**
 * 格式化日期
 * @param {Date | string | number} date 日期
 * @param {string} format 格式化模式
 * @returns {string} 格式化后的日期字符串
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // '2023-12-01'
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') // '2023-12-01 10:30:00'
 */
export const formatDate = (
  date: Date | string | number,
  format: string = "YYYY-MM-DD"
): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * 格式化数字，添加千分位分隔符
 * @param {number | string} num 数字
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的数字字符串
 * @example
 * formatNumber(1234567.89) // '1,234,567.89'
 * formatNumber(1234567.89, 0) // '1,234,568'
 */
export const formatNumber = (
  num: number | string,
  decimals?: number
): string => {
  const n = Number(num);

  if (isNaN(n)) {
    return "";
  }

  const options: Intl.NumberFormatOptions = {};

  if (typeof decimals === "number") {
    options.minimumFractionDigits = decimals;
    options.maximumFractionDigits = decimals;
  }

  return new Intl.NumberFormat("zh-CN", options).format(n);
};

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的文件大小字符串
 * @example
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1048576) // '1 MB'
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
};

/**
 * 格式化电话号码
 * @param {string} phone 电话号码
 * @returns {string} 格式化后的电话号码
 * @example
 * formatPhone('13812345678') // '138 1234 5678'
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
  }

  return phone;
};

/**
 * 格式化银行卡号
 * @param {string} cardNumber 银行卡号
 * @returns {string} 格式化后的银行卡号
 * @example
 * formatBankCard('6217003810012345678') // '6217 0038 1001 2345 678'
 */
export const formatBankCard = (cardNumber: string): string => {
  if (!cardNumber) return "";

  const cleaned = cardNumber.replace(/\D/g, "");
  return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
};
