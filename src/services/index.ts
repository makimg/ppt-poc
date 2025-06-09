import axios from "./config";

export default {
  /**
   * 获取指定版本的mock数据
   * @param {string} version 版本号
   * @returns {Promise<any>} 返回mock数据
   */
  getMockData(version: string): Promise<any> {
    return axios.get(`/mocks/v${version}/data.json`);
  },

  /**
   * 获取指定版本和文件名的PDF文件数据
   * @param {string} version 版本号
   * @param {string} filename 文件名（不包含扩展名）
   * @returns {Promise<string>} 返回文件的完整URL路径
   * @example
   * // 获取v1版本的2.pdf文件
   * api.getFileData('1', '2').then(url => {
   *   console.log(url); // 输出完整的文件URL
   * });
   */
  async getFileData(version: string, filename: string): Promise<any> {
    const filePath = `/mocks/v${version}/${filename}.pdf`;

    try {
      // 验证文件是否存在 (需要加上/web前缀用于实际访问)
      const fullPath = `/web${filePath}`;
      const response = await fetch(fullPath, { method: "HEAD" });
      if (response.ok) {
        // 返回可直接访问的完整URL
        return {
          data: {
            filePath: new URL(fullPath, window.location.origin).href,
          },
        };
      } else {
        throw new Error(`文件不存在: ${filePath}`);
      }
    } catch (error) {
      console.error("获取文件数据失败:", error);
      throw new Error(`无法获取文件: ${filePath}`);
    }
  },
};
