# PakePlus 打包说明

## 项目简介
本项目是一个八年级体质健康测试系统，使用 PakePlus 可以打包成 Android APK 在手机上使用。

## PakePlus 打包步骤

### 1. 下载并安装 PakePlus
- 访问 https://pakeplus.com 下载 PakePlus
- 安装并打开 PakePlus

### 2. 创建新项目
1. 点击"新建项目"
2. 选择项目类型：**Android APK**
3. 填写项目信息：
   - 项目名称：`体质健康测试系统`
   - 应用标识：`com.yourname.fitnesstest`（建议使用反向域名格式）
   - 版本号：`1.0.0`

### 3. 配置项目
在 PakePlus 中配置以下选项：

#### 基本配置
- **入口文件**：选择本文件夹中的 `index.html`
- **应用名称**：体质健康测试系统
- **窗口大小**：建议设置为 1200x800（桌面端）或自适应（移动端）

#### 重要：开启全局 TauriApi（必须）
⚠️ **这一步非常关键！**

1. 在 PakePlus 中找到"更多配置"或"高级配置"
2. 找到 **"全局 TauriApi"** 选项
3. **务必开启（勾选）此选项**

如果不开启此选项，以下功能将无法使用：
- ❌ Excel 文件下载保存
- ❌ 在默认浏览器中打开链接
- ❌ 文件系统操作

### 4. 添加的文件说明

#### pakeplus-bridge.js（新增）
这个文件提供了 PakePlus 环境的桥接功能：

| 功能 | 说明 |
|------|------|
| `PakePlusBridge.isPakePlus()` | 检测是否在 PakePlus 环境中 |
| `PakePlusBridge.downloadFile(blob, filename)` | 下载文件到系统下载目录 |
| `PakePlusBridge.saveFileWithDialog(blob, filename)` | 显示保存对话框下载文件 |
| `PakePlusBridge.openInBrowser(url)` | 在默认浏览器中打开 URL |
| `PakePlusBridge.hookExternalLinks()` | 自动拦截外部链接在浏览器打开 |

### 5. 修改的文件说明

#### app.js
- 添加了 `_isInPakePlus()` 方法检测 PakePlus 环境
- 添加了 `_downloadWithPakePlus()` 方法处理文件下载
- 修改了 `exportToExcel()` 方法，优先使用 PakePlus API

#### index.html
- 引入了 `pakeplus-bridge.js` 脚本

### 6. 打包发布

1. 在 PakePlus 中点击"打包"或"构建"
2. 等待构建完成
3. 下载生成的 APK 文件
4. 将 APK 安装到 Android 手机

## 使用说明

### 导出 Excel 文件
1. 在 APP 中选择"测试记录"页面
2. 选择要导出的班级
3. 点击"导出Excel"按钮
4. 文件将自动保存到手机的**下载目录**

### 注意事项
- 首次使用导出功能时，可能需要授予存储权限
- 如果 PakePlus 下载失败，会自动回退到复制数据的方式
- 导出的文件名为：`班级名称_体质测试成绩_日期.xlsx`

## 故障排除

### 问题1：点击导出没有反应
**解决方案**：
1. 检查是否在 PakePlus 中开启了"全局 TauriApi"
2. 检查手机是否授予了存储权限
3. 查看控制台是否有错误信息

### 问题2：文件没有保存到下载目录
**解决方案**：
1. 使用文件管理器检查下载目录
2. 尝试使用"复制表格数据"方式手动粘贴到 WPS/Excel
3. 检查文件名是否包含特殊字符

### 问题3：在 PakePlus 中无法检测到环境
**解决方案**：
1. 确保在 PakePlus 中开启了"全局 TauriApi"
2. 重新打包 APK
3. 清除 APP 缓存后重试

## 技术细节

### PakePlus API 使用
本项目使用了以下 PakePlus/Tauri API：

```javascript
// 核心 API
window.__TAURI__.core.invoke()

// 路径 API
window.__TAURI__.path.downloadDir()

// 文件系统 API
invoke('plugin:fs|write_binary_file', {...})

// 对话框 API
invoke('plugin:dialog|save', {...})
```

### 浏览器打开链接
项目已自动配置拦截外部链接，在 PakePlus 环境中会调用系统浏览器打开。

## 联系支持
如有问题，可以：
1. 查看 PakePlus 官方文档：https://pakeplus.com/zh/guide/
2. 在 PakePlus 社区寻求帮助
