// PakePlus 桥接脚本 - 用于在 PakePlus 环境中支持文件下载和 URL 打开
// 需要在 PakePlus 的"更多配置"中开启"全局 TauriApi"才能生效

(function() {
    'use strict';

    // 检测是否在 PakePlus 环境中
    function isPakePlus() {
        return typeof window !== 'undefined' && 
               window.__TAURI__ && 
               window.__TAURI__.core &&
               typeof window.__TAURI__.core.invoke === 'function';
    }

    // 等待 PakePlus 环境就绪
    function waitForPakePlus(callback, maxAttempts = 50) {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (isPakePlus()) {
                clearInterval(interval);
                callback(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                callback(false);
            }
        }, 100);
    }

    // 初始化 PakePlus 桥接
    window.PakePlusBridge = {
        // 检测是否在 PakePlus 环境
        isPakePlus: isPakePlus,

        // 等待 PakePlus 就绪
        ready: function(callback) {
            if (isPakePlus()) {
                callback(true);
            } else {
                waitForPakePlus(callback);
            }
        },

        // 下载文件到系统下载目录
        downloadFile: async function(blob, fileName) {
            if (!isPakePlus()) {
                throw new Error('Not in PakePlus environment');
            }

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = async function() {
                    try {
                        const base64Data = reader.result.split(',')[1];
                        
                        // 调用 PakePlus 的文件系统 API
                        // 注意：需要在 PakePlus 中开启全局 TauriApi
                        const { invoke } = window.__TAURI__.core;
                        
                        // 尝试使用 PakePlus 的文件保存功能
                        // 先获取下载目录路径
                        const { downloadDir } = window.__TAURI__.path;
                        const downloadPath = await downloadDir();
                        
                        // 写入文件
                        await invoke('plugin:fs|write_binary_file', {
                            path: downloadPath + '/' + fileName,
                            contents: base64Data
                        });
                        
                        resolve({
                            success: true,
                            path: downloadPath + '/' + fileName,
                            message: '文件已保存到下载目录'
                        });
                    } catch (e) {
                        console.error('PakePlus download failed:', e);
                        reject(e);
                    }
                };
                reader.onerror = function() {
                    reject(new Error('FileReader error'));
                };
                reader.readAsDataURL(blob);
            });
        },

        // 显示文件保存对话框
        saveFileWithDialog: async function(blob, fileName) {
            if (!isPakePlus()) {
                throw new Error('Not in PakePlus environment');
            }

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = async function() {
                    try {
                        const base64Data = reader.result.split(',')[1];
                        const { invoke } = window.__TAURI__.core;
                        
                        // 使用保存对话框
                        const result = await invoke('plugin:dialog|save', {
                            filters: [{
                                name: 'Excel Files',
                                extensions: ['xlsx']
                            }],
                            defaultPath: fileName
                        });
                        
                        if (result) {
                            await invoke('plugin:fs|write_binary_file', {
                                path: result,
                                contents: base64Data
                            });
                            resolve({
                                success: true,
                                path: result,
                                message: '文件保存成功'
                            });
                        } else {
                            resolve({
                                success: false,
                                message: '用户取消保存'
                            });
                        }
                    } catch (e) {
                        console.error('PakePlus save dialog failed:', e);
                        reject(e);
                    }
                };
                reader.onerror = function() {
                    reject(new Error('FileReader error'));
                };
                reader.readAsDataURL(blob);
            });
        },

        // 在默认浏览器中打开 URL
        openInBrowser: async function(url) {
            if (!isPakePlus()) {
                // 非 PakePlus 环境，使用普通方式打开
                window.open(url, '_blank');
                return;
            }

            try {
                const { invoke } = window.__TAURI__.core;
                await invoke('open_url', { url: url });
            } catch (e) {
                console.error('Open URL failed:', e);
                // 失败时回退到普通方式
                window.open(url, '_blank');
            }
        },

        // 拦截外部链接点击，在默认浏览器中打开
        hookExternalLinks: function() {
            const hookClick = (e) => {
                const origin = e.target.closest('a');
                const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');
                if (
                    (origin && origin.href && origin.target === '_blank') ||
                    (origin && origin.href && isBaseTargetBlank)
                ) {
                    e.preventDefault();
                    this.openInBrowser(origin.href);
                }
            };

            // 重写 window.open
            window.open = (url, target, features) => {
                this.openInBrowser(url);
            };

            document.addEventListener('click', hookClick, { capture: true });
        }
    };

    // 自动初始化（如果检测到 PakePlus 环境）
    if (isPakePlus()) {
        console.log('PakePlus environment detected, initializing bridge...');
        window.PakePlusBridge.hookExternalLinks();
    }

})();
