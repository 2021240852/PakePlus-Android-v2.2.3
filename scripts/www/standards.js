// 八年级体质健康测试评分标准
const Standards = {
    // 男生标准
    male: {
        // BMI指数 (kg/m²)
        bmi: {
            type: 'range',
            normal: { min: 15.7, max: 22.5, score: 100 },
            low: { max: 15.6, score: 80 },
            overweight: { min: 22.6, max: 25.2, score: 80 },
            obese: { min: 25.3, score: 60 }
        },
        // 肺活量 (ml)
        vitalCapacity: {
            type: 'desc',
            scores: [
                { value: 3940, score: 100 },
                { value: 3820, score: 95 },
                { value: 3700, score: 90 },
                { value: 3450, score: 85 },
                { value: 3200, score: 80 },
                { value: 3080, score: 78 },
                { value: 2960, score: 76 },
                { value: 2840, score: 74 },
                { value: 2720, score: 72 },
                { value: 2600, score: 70 },
                { value: 2480, score: 68 },
                { value: 2360, score: 66 },
                { value: 2240, score: 64 },
                { value: 2120, score: 62 },
                { value: 2000, score: 60 },
                { value: 1890, score: 50 },
                { value: 1780, score: 40 },
                { value: 1670, score: 30 },
                { value: 1560, score: 20 },
                { value: 1450, score: 10 }
            ]
        },
        // 50米跑 (秒) - 越小越好
        run50m: {
            type: 'asc',
            scores: [
                { value: 7.5, score: 100 },
                { value: 7.6, score: 95 },
                { value: 7.7, score: 90 },
                { value: 7.8, score: 85 },
                { value: 7.9, score: 80 },
                { value: 8.1, score: 78 },
                { value: 8.3, score: 76 },
                { value: 8.5, score: 74 },
                { value: 8.7, score: 72 },
                { value: 8.9, score: 70 },
                { value: 9.1, score: 68 },
                { value: 9.3, score: 66 },
                { value: 9.5, score: 64 },
                { value: 9.7, score: 62 },
                { value: 9.9, score: 60 },
                { value: 10.1, score: 50 },
                { value: 10.3, score: 40 },
                { value: 10.5, score: 30 },
                { value: 10.7, score: 20 },
                { value: 10.9, score: 10 }
            ]
        },
        // 坐位体前屈 (cm)
        sitReach: {
            type: 'desc',
            scores: [
                { value: 19.6, score: 100 },
                { value: 17.7, score: 95 },
                { value: 15.8, score: 90 },
                { value: 13.7, score: 85 },
                { value: 11.6, score: 80 },
                { value: 10.3, score: 78 },
                { value: 9.0, score: 76 },
                { value: 7.7, score: 74 },
                { value: 6.4, score: 72 },
                { value: 5.1, score: 70 },
                { value: 3.8, score: 68 },
                { value: 2.5, score: 66 },
                { value: 1.2, score: 64 },
                { value: -0.1, score: 62 },
                { value: -1.4, score: 60 },
                { value: -2.6, score: 50 },
                { value: -3.8, score: 40 },
                { value: -5.0, score: 30 },
                { value: -6.2, score: 20 },
                { value: -7.4, score: 10 }
            ]
        },
        // 立定跳远 (cm)
        longJump: {
            type: 'desc',
            scores: [
                { value: 240, score: 100 },
                { value: 233, score: 95 },
                { value: 226, score: 90 },
                { value: 218, score: 85 },
                { value: 210, score: 80 },
                { value: 206, score: 78 },
                { value: 202, score: 76 },
                { value: 198, score: 74 },
                { value: 194, score: 72 },
                { value: 190, score: 70 },
                { value: 186, score: 68 },
                { value: 182, score: 66 },
                { value: 178, score: 64 },
                { value: 174, score: 62 },
                { value: 170, score: 60 },
                { value: 165, score: 50 },
                { value: 160, score: 40 },
                { value: 155, score: 30 },
                { value: 150, score: 20 },
                { value: 145, score: 10 }
            ]
        },
        // 引体向上 (次)
        pullUp: {
            type: 'desc',
            scores: [
                { value: 14, score: 100 },
                { value: 13, score: 95 },
                { value: 12, score: 90 },
                { value: 11, score: 85 },
                { value: 10, score: 80 },
                { value: 9, score: 76 },
                { value: 8, score: 72 },
                { value: 7, score: 68 },
                { value: 6, score: 64 },
                { value: 5, score: 60 },
                { value: 4, score: 50 },
                { value: 3, score: 40 },
                { value: 2, score: 30 },
                { value: 1, score: 20 },
                { value: 0, score: 10 }
            ],
            bonus: {
                base: 14,
                perUnit: 1,
                maxBonus: 10,
                unitLabel: '次'
            }
        },
        // 1000米跑 (分·秒) - 转换为秒计算
        run1000m: {
            type: 'asc',
            timeFormat: true,
            scores: [
                { value: 230, score: 100 },  // 3'50"
                { value: 235, score: 95 },   // 3'55"
                { value: 240, score: 90 },   // 4'00"
                { value: 247, score: 85 },   // 4'07"
                { value: 255, score: 80 },   // 4'15"
                { value: 260, score: 78 },   // 4'20"
                { value: 265, score: 76 },   // 4'25"
                { value: 270, score: 74 },   // 4'30"
                { value: 275, score: 72 },   // 4'35"
                { value: 280, score: 70 },   // 4'40"
                { value: 285, score: 68 },   // 4'45"
                { value: 290, score: 66 },   // 4'50"
                { value: 295, score: 64 },   // 4'55"
                { value: 300, score: 62 },   // 5'00"
                { value: 305, score: 60 },   // 5'05"
                { value: 325, score: 50 },   // 5'25"
                { value: 345, score: 40 },   // 5'45"
                { value: 365, score: 30 },   // 6'05"
                { value: 385, score: 20 },   // 6'25"
                { value: 405, score: 10 }    // 6'45"
            ],
            bonus: {
                base: 230,  // 3'50"
                maxBonus: 10,
                rules: [
                    { threshold: 210, perSeconds: 4 },  // 3'30"-3'50" 每快4秒加1分
                    { threshold: 195, perSeconds: 3 }   // 3'15"-3'30" 每快3秒加1分
                ],
                minTime: 195  // 3'15"
            }
        }
    },
    
    // 女生标准
    female: {
        // BMI指数 (kg/m²)
        bmi: {
            type: 'range',
            normal: { min: 15.3, max: 22.2, score: 100 },
            low: { max: 15.2, score: 80 },
            overweight: { min: 22.3, max: 24.8, score: 80 },
            obese: { min: 24.9, score: 60 }
        },
        // 肺活量 (ml)
        vitalCapacity: {
            type: 'desc',
            scores: [
                { value: 2900, score: 100 },
                { value: 2850, score: 95 },
                { value: 2800, score: 90 },
                { value: 2650, score: 85 },
                { value: 2500, score: 80 },
                { value: 2400, score: 78 },
                { value: 2300, score: 76 },
                { value: 2200, score: 74 },
                { value: 2100, score: 72 },
                { value: 2000, score: 70 },
                { value: 1900, score: 68 },
                { value: 1800, score: 66 },
                { value: 1700, score: 64 },
                { value: 1600, score: 62 },
                { value: 1500, score: 60 },
                { value: 1460, score: 50 },
                { value: 1420, score: 40 },
                { value: 1380, score: 30 },
                { value: 1340, score: 20 },
                { value: 1300, score: 10 }
            ]
        },
        // 50米跑 (秒)
        run50m: {
            type: 'asc',
            scores: [
                { value: 8.0, score: 100 },
                { value: 8.1, score: 95 },
                { value: 8.2, score: 90 },
                { value: 8.5, score: 85 },
                { value: 8.8, score: 80 },
                { value: 9.0, score: 78 },
                { value: 9.2, score: 76 },
                { value: 9.4, score: 74 },
                { value: 9.6, score: 72 },
                { value: 9.8, score: 70 },
                { value: 10.0, score: 68 },
                { value: 10.2, score: 66 },
                { value: 10.4, score: 64 },
                { value: 10.6, score: 62 },
                { value: 10.8, score: 60 },
                { value: 11.0, score: 50 },
                { value: 11.2, score: 40 },
                { value: 11.4, score: 30 },
                { value: 11.6, score: 20 },
                { value: 11.8, score: 10 }
            ]
        },
        // 坐位体前屈 (cm)
        sitReach: {
            type: 'desc',
            scores: [
                { value: 22.7, score: 100 },
                { value: 21.0, score: 95 },
                { value: 19.3, score: 90 },
                { value: 17.6, score: 85 },
                { value: 15.9, score: 80 },
                { value: 14.6, score: 78 },
                { value: 13.3, score: 76 },
                { value: 12.0, score: 74 },
                { value: 10.7, score: 72 },
                { value: 9.4, score: 70 },
                { value: 8.1, score: 68 },
                { value: 6.8, score: 66 },
                { value: 5.5, score: 64 },
                { value: 4.2, score: 62 },
                { value: 2.9, score: 60 },
                { value: 2.1, score: 50 },
                { value: 1.3, score: 40 },
                { value: 0.5, score: 30 },
                { value: -0.3, score: 20 },
                { value: -1.1, score: 10 }
            ]
        },
        // 立定跳远 (cm)
        longJump: {
            type: 'desc',
            scores: [
                { value: 200, score: 100 },
                { value: 194, score: 95 },
                { value: 188, score: 90 },
                { value: 181, score: 85 },
                { value: 174, score: 80 },
                { value: 171, score: 78 },
                { value: 168, score: 76 },
                { value: 165, score: 74 },
                { value: 162, score: 72 },
                { value: 159, score: 70 },
                { value: 156, score: 68 },
                { value: 153, score: 66 },
                { value: 150, score: 64 },
                { value: 147, score: 62 },
                { value: 144, score: 60 },
                { value: 139, score: 50 },
                { value: 134, score: 40 },
                { value: 129, score: 30 },
                { value: 124, score: 20 },
                { value: 119, score: 10 }
            ]
        },
        // 一分钟仰卧起坐 (次)
        sitUp: {
            type: 'desc',
            scores: [
                { value: 51, score: 100 },
                { value: 49, score: 95 },
                { value: 47, score: 90 },
                { value: 44, score: 85 },
                { value: 41, score: 80 },
                { value: 39, score: 78 },
                { value: 37, score: 76 },
                { value: 35, score: 74 },
                { value: 33, score: 72 },
                { value: 31, score: 70 },
                { value: 29, score: 68 },
                { value: 27, score: 66 },
                { value: 25, score: 64 },
                { value: 23, score: 62 },
                { value: 21, score: 60 },
                { value: 19, score: 50 },
                { value: 17, score: 40 },
                { value: 15, score: 30 },
                { value: 13, score: 20 },
                { value: 11, score: 10 }
            ],
            bonus: {
                base: 51,
                maxBonus: 10,
                rules: [
                    { threshold: 52, perUnit: 2, max: 62 },  // 52-62次每多2次加1分
                    { threshold: 63, perUnit: 1 }             // 63次以上每多1次加1分
                ]
            }
        },
        // 800米跑 (分·秒)
        run800m: {
            type: 'asc',
            timeFormat: true,
            scores: [
                { value: 210, score: 100 },  // 3'30"
                { value: 217, score: 95 },   // 3'37"
                { value: 224, score: 90 },   // 3'44"
                { value: 232, score: 85 },   // 3'52"
                { value: 240, score: 80 },   // 4'00"
                { value: 245, score: 78 },   // 4'05"
                { value: 250, score: 76 },   // 4'10"
                { value: 255, score: 74 },   // 4'15"
                { value: 260, score: 72 },   // 4'20"
                { value: 265, score: 70 },   // 4'25"
                { value: 270, score: 68 },   // 4'30"
                { value: 275, score: 66 },   // 4'35"
                { value: 280, score: 64 },   // 4'40"
                { value: 285, score: 62 },   // 4'45"
                { value: 290, score: 60 },   // 4'50"
                { value: 300, score: 50 },   // 5'00"
                { value: 310, score: 40 },   // 5'10"
                { value: 320, score: 30 },   // 5'20"
                { value: 330, score: 20 },   // 5'30"
                { value: 340, score: 10 }    // 5'40"
            ],
            bonus: {
                base: 210,  // 3'30"
                perSeconds: 5,
                maxBonus: 10,
                minTime: 160  // 2'40"
            }
        }
    },
    
    // 项目权重
    weights: {
        bmi: 0.15,
        vitalCapacity: 0.15,
        run50m: 0.20,
        run1000m: 0.20,
        run800m: 0.20,
        sitReach: 0.10,
        longJump: 0.10,
        pullUp: 0.10,
        sitUp: 0.10
    },
    
    // 项目配置
    projects: {
        bmi: { name: 'BMI', unit: 'kg/m²', icon: '⚖️' },
        vitalCapacity: { name: '肺活量', unit: 'ml', icon: '🫁' },
        run50m: { name: '50米跑', unit: '秒', icon: '🏃' },
        sitReach: { name: '坐位体前屈', unit: 'cm', icon: '🤸' },
        longJump: { name: '立定跳远', unit: 'cm', icon: '⬆️' },
        pullUp: { name: '引体向上', unit: '次', icon: '💪', maleOnly: true },
        sitUp: { name: '仰卧起坐', unit: '次', icon: '🏋️', femaleOnly: true },
        run1000m: { name: '1000米跑', unit: '分·秒', icon: '🏃‍♂️', maleOnly: true },
        run800m: { name: '800米跑', unit: '分·秒', icon: '🏃‍♀️', femaleOnly: true }
    },
    
    // 获取性别对应的项目列表
    getProjectsByGender(gender) {
        const projects = [];
        for (const [key, config] of Object.entries(this.projects)) {
            if (gender === '男' && config.femaleOnly) continue;
            if (gender === '女' && config.maleOnly) continue;
            projects.push({ key, ...config });
        }
        return projects;
    },
    
    // 计算单项得分
    calculateScore(gender, project, value) {
        const std = this[gender === '男' ? 'male' : 'female'][project];
        if (!std) return 0;
        
        if (std.type === 'range') {
            // BMI特殊处理
            if (value >= std.normal.min && value <= std.normal.max) {
                return { score: std.normal.score, level: 'normal' };
            } else if (value <= std.low.max) {
                return { score: std.low.score, level: 'low' };
            } else if (value >= std.overweight.min && value <= std.overweight.max) {
                return { score: std.overweight.score, level: 'overweight' };
            } else {
                return { score: std.obese.score, level: 'obese' };
            }
        } else if (std.type === 'desc') {
            // 数值越大越好
            for (const item of std.scores) {
                if (value >= item.value) {
                    return { score: item.score, level: this.getLevel(item.score) };
                }
            }
            return { score: 0, level: 'fail' };
        } else if (std.type === 'asc') {
            // 数值越小越好
            for (const item of std.scores) {
                if (value <= item.value) {
                    return { score: item.score, level: this.getLevel(item.score) };
                }
            }
            return { score: 0, level: 'fail' };
        }
        return { score: 0, level: 'fail' };
    },
    
    // 计算加分
    calculateBonus(gender, project, value) {
        const std = this[gender === '男' ? 'male' : 'female'][project];
        if (!std || !std.bonus) return 0;
        
        const bonus = std.bonus;
        let bonusScore = 0;
        
        if (project === 'pullUp') {
            // 引体向上加分
            if (value > bonus.base) {
                bonusScore = Math.min((value - bonus.base) * bonus.perUnit, bonus.maxBonus);
            }
        } else if (project === 'run1000m') {
            // 1000米跑加分
            if (value < bonus.base) {
                let remaining = bonus.base - value;
                for (const rule of bonus.rules) {
                    if (value >= rule.threshold) {
                        bonusScore = Math.min(Math.floor(remaining / rule.perSeconds), bonus.maxBonus);
                        break;
                    }
                }
            }
        } else if (project === 'sitUp') {
            // 仰卧起坐加分
            if (value > bonus.base) {
                for (const rule of bonus.rules) {
                    if (value >= rule.threshold) {
                        if (rule.max && value <= rule.max) {
                            bonusScore = Math.floor((value - bonus.base) / rule.perUnit);
                        } else if (!rule.max) {
                            let baseBonus = 5; // 52-62次部分
                            if (value > 62) {
                                baseBonus += value - 62;
                            }
                            bonusScore = Math.min(baseBonus, bonus.maxBonus);
                        }
                        break;
                    }
                }
            }
        } else if (project === 'run800m') {
            // 800米跑加分
            if (value < bonus.base) {
                const diff = bonus.base - value;
                bonusScore = Math.min(Math.floor(diff / bonus.perSeconds), bonus.maxBonus);
            }
        }
        
        return Math.min(bonusScore, bonus.maxBonus || 10);
    },
    
    // 获取等级
    getLevel(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 60) return 'pass';
        return 'fail';
    },
    
    // 获取等级文字
    getLevelText(level) {
        const texts = {
            excellent: '优秀',
            good: '良好',
            pass: '及格',
            fail: '不及格',
            normal: '正常',
            low: '低体重',
            overweight: '超重',
            obese: '肥胖'
        };
        return texts[level] || level;
    },
    
    // 时间字符串转秒
    timeToSeconds(timeStr) {
        if (typeof timeStr === 'number') return timeStr;
        if (!timeStr) return 0;
        
        // 处理格式: 3'50" 或 3:50 或 3.50
        const match = timeStr.match(/(\d+)[\'\:](\d+)/);
        if (match) {
            return parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return parseFloat(timeStr) || 0;
    },
    
    // 秒转时间字符串
    secondsToTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}'${sec.toString().padStart(2, '0')}"`;
    }
};

// 导出标准
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Standards;
}
