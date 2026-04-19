// 八年级体质健康测试系统 - 主应用
const App = {
    // 数据存储
    data: {
        classes: [],
        students: [],
        scores: {},
        currentClass: null,
        currentInputMode: 'student', // 'student' 或 'project'
        radarChart: null,
        compareStudents: []
    },

    // 初始化
    init() {
        this.loadData();
        this.bindEvents();
        this.renderClassList();
        this.updateClassSelects();
    },

    // 从localStorage加载数据
    loadData() {
        const saved = localStorage.getItem('fitness_test_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.data.classes = parsed.classes || [];
            this.data.students = parsed.students || [];
            this.data.scores = parsed.scores || {};
        }
    },

    // 保存数据到localStorage
    saveData() {
        const data = {
            classes: this.data.classes,
            students: this.data.students,
            scores: this.data.scores
        };
        localStorage.setItem('fitness_test_data', JSON.stringify(data));
    },

    // 绑定事件
    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });

        // 录入模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.data.currentInputMode = e.target.dataset.mode;
                this.renderInputContainer();
            });
        });

        // 班级选择变化
        ['student-class-select', 'input-class-select', 'record-class-select', 'radar-class-select', 'analysis-class-select'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.data.currentClass = e.target.value;
                    if (id === 'student-class-select') this.renderStudentList();
                    if (id === 'input-class-select') this.renderInputContainer();
                    if (id === 'record-class-select') this.renderRecords();
                    if (id === 'radar-class-select') {
                        this.data.compareStudents = [];
                        this.updateRadarStudentSelect();
                        this.resetRadarView();
                    }
                    if (id === 'analysis-class-select') this.renderAnalysis();
                });
            }
        });

        // 雷达图学生选择变化
        const radarStudentSelect = document.getElementById('radar-student-select');
        if (radarStudentSelect) {
            radarStudentSelect.addEventListener('change', (e) => {
                const studentId = e.target.value;
                if (studentId) {
                    this.data.compareStudents = [studentId];
                    this.renderRadarChart();
                } else {
                    this.resetRadarView();
                }
            });
        }
    },

    // 切换页面
    switchPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`page-${page}`).classList.add('active');
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        if (page === 'students') this.renderStudentList();
        if (page === 'input') this.renderInputContainer();
        if (page === 'records') this.renderRecords();
        if (page === 'radar') this.renderRadarChart();
    },

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 显示提示
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    },

    // 打开弹窗
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    // 关闭弹窗
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    // ========== 班级管理 ==========
    
    renderClassList() {
        const container = document.getElementById('class-list');
        if (this.data.classes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无班级，请点击右上角创建班级</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.data.classes.map(cls => {
            const studentCount = this.data.students.filter(s => s.classId === cls.id).length;
            return `
                <div class="card">
                    <div class="card-info">
                        <h3>${cls.name}</h3>
                        <p>${studentCount} 名学生</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-small btn-secondary" onclick="App.showEditClassModal('${cls.id}')">修改</button>
                        <button class="btn btn-small btn-danger" onclick="App.deleteClass('${cls.id}')">删除</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateClassSelects() {
        const selects = ['student-class-select', 'input-class-select', 'record-class-select', 'radar-class-select', 'analysis-class-select'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">请选择班级</option>' + 
                    this.data.classes.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('');
                select.value = currentValue;
            }
        });
    },

    showCreateClassModal() {
        document.getElementById('class-name-input').value = '';
        this.openModal('create-class-modal');
    },

    createClass() {
        const name = document.getElementById('class-name-input').value.trim();
        if (!name) {
            this.showToast('请输入班级名称');
            return;
        }

        const newClass = {
            id: this.generateId(),
            name: name,
            createdAt: new Date().toISOString()
        };

        this.data.classes.push(newClass);
        this.saveData();
        this.renderClassList();
        this.updateClassSelects();
        this.closeModal('create-class-modal');
        this.showToast('班级创建成功');
    },

    showEditClassModal(classId) {
        const cls = this.data.classes.find(c => c.id === classId);
        if (!cls) return;

        document.getElementById('edit-class-id').value = classId;
        document.getElementById('edit-class-name-input').value = cls.name;
        this.openModal('edit-class-modal');
    },

    updateClass() {
        const id = document.getElementById('edit-class-id').value;
        const name = document.getElementById('edit-class-name-input').value.trim();
        
        if (!name) {
            this.showToast('请输入班级名称');
            return;
        }

        const cls = this.data.classes.find(c => c.id === id);
        if (cls) {
            cls.name = name;
            this.saveData();
            this.renderClassList();
            this.updateClassSelects();
            this.closeModal('edit-class-modal');
            this.showToast('班级修改成功');
        }
    },

    deleteClass(classId) {
        if (!confirm('确定要删除这个班级吗？相关的学生和成绩数据也会被删除。')) return;

        this.data.classes = this.data.classes.filter(c => c.id !== classId);
        this.data.students = this.data.students.filter(s => s.classId !== classId);
        delete this.data.scores[classId];
        
        this.saveData();
        this.renderClassList();
        this.updateClassSelects();
        this.showToast('班级删除成功');
    },

    // ========== 学生管理 ==========

    renderStudentList() {
        const container = document.getElementById('student-list');
        const classId = document.getElementById('student-class-select').value;

        if (!classId) {
            container.innerHTML = '<div class="empty-state"><p>请先选择班级</p></div>';
            return;
        }

        const students = this.data.students.filter(s => s.classId === classId);
        
        if (students.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>该班级暂无学生</p></div>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>序号</th>
                        <th>姓名</th>
                        <th>性别</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map((s, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${s.name}</td>
                            <td>${s.gender}</td>
                            <td>
                                <button class="btn btn-small btn-secondary" onclick="App.showEditStudentModal('${s.id}')">编辑</button>
                                <button class="btn btn-small btn-danger" onclick="App.deleteStudent('${s.id}')">删除</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    showAddStudentModal() {
        const classId = document.getElementById('student-class-select').value;
        if (!classId) {
            this.showToast('请先选择班级');
            return;
        }
        document.getElementById('student-name-input').value = '';
        document.getElementById('student-gender-input').value = '';
        this.openModal('add-student-modal');
    },

    addStudent() {
        const classId = document.getElementById('student-class-select').value;
        const name = document.getElementById('student-name-input').value.trim();
        const gender = document.getElementById('student-gender-input').value;

        if (!name || !gender) {
            this.showToast('请填写完整信息');
            return;
        }

        const newStudent = {
            id: this.generateId(),
            classId: classId,
            name: name,
            gender: gender,
            createdAt: new Date().toISOString()
        };

        this.data.students.push(newStudent);
        this.saveData();
        this.renderStudentList();
        this.renderClassList();
        this.closeModal('add-student-modal');
        this.showToast('学生添加成功');
    },

    showImportModal() {
        const classId = document.getElementById('student-class-select').value;
        if (!classId) {
            this.showToast('请先选择班级');
            return;
        }
        document.getElementById('import-textarea').value = '';
        this.openModal('import-modal');
    },

    importStudents() {
        const classId = document.getElementById('student-class-select').value;
        const text = document.getElementById('import-textarea').value.trim();

        if (!text) {
            this.showToast('请输入学生信息');
            return;
        }

        const lines = text.split('\n');
        let successCount = 0;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // 支持多种分隔符：逗号、中文逗号、空格、制表符
            const parts = line.split(/[,，\s]+/).map(p => p.trim()).filter(p => p);

            if (parts.length >= 2) {
                const name = parts[0];
                const gender = parts[1];

                if (name && (gender === '男' || gender === '女')) {
                    this.data.students.push({
                        id: this.generateId(),
                        classId: classId,
                        name: name,
                        gender: gender,
                        createdAt: new Date().toISOString()
                    });
                    successCount++;
                }
            }
        });

        this.saveData();
        this.renderStudentList();
        this.renderClassList();
        this.closeModal('import-modal');
        this.showToast(`成功导入 ${successCount} 名学生`);
    },

    showEditStudentModal(studentId) {
        const student = this.data.students.find(s => s.id === studentId);
        if (!student) return;

        document.getElementById('edit-student-id').value = studentId;
        document.getElementById('edit-student-name-input').value = student.name;
        document.getElementById('edit-student-gender-input').value = student.gender;
        this.openModal('edit-student-modal');
    },

    updateStudent() {
        const id = document.getElementById('edit-student-id').value;
        const name = document.getElementById('edit-student-name-input').value.trim();
        const gender = document.getElementById('edit-student-gender-input').value;

        if (!name) {
            this.showToast('请输入学生姓名');
            return;
        }

        const student = this.data.students.find(s => s.id === id);
        if (student) {
            student.name = name;
            student.gender = gender;
            this.saveData();
            this.renderStudentList();
            this.closeModal('edit-student-modal');
            this.showToast('学生信息修改成功');
        }
    },

    deleteStudent(studentId) {
        if (!confirm('确定要删除这名学生吗？')) return;

        this.data.students = this.data.students.filter(s => s.id !== studentId);

        // 删除相关成绩
        for (const classId in this.data.scores) {
            delete this.data.scores[classId][studentId];
        }

        this.saveData();
        this.renderStudentList();
        this.renderClassList();
        this.showToast('学生删除成功');
    },

    // ========== 清除成绩功能 ==========

    showClearScoresModal() {
        const classId = document.getElementById('student-class-select').value;
        if (!classId) {
            this.showToast('请先选择班级');
            return;
        }

        // 重置选择
        document.getElementById('clear-scope-select').value = '';
        document.getElementById('clear-project-select').value = '';
        document.getElementById('clear-student-select').value = '';
        document.getElementById('clear-project-select-container').style.display = 'none';
        document.getElementById('clear-student-select-container').style.display = 'none';

        // 加载学生列表
        const students = this.data.students.filter(s => s.classId === classId);
        const studentSelect = document.getElementById('clear-student-select');
        studentSelect.innerHTML = '<option value="">请选择学生</option><option value="all">所有学生</option>' +
            students.map(s => `<option value="${s.id}">${s.name} (${s.gender})</option>`).join('');

        this.openModal('clear-scores-modal');
    },

    onClearScopeChange() {
        const scope = document.getElementById('clear-scope-select').value;
        document.getElementById('clear-project-select-container').style.display = scope === 'project' ? 'block' : 'none';
        document.getElementById('clear-student-select-container').style.display = scope === 'student' ? 'block' : 'none';
    },

    confirmClearScores() {
        const classId = document.getElementById('student-class-select').value;
        if (!classId) {
            this.showToast('请先选择班级');
            return;
        }

        const scope = document.getElementById('clear-scope-select').value;
        if (!scope) {
            this.showToast('请选择清除范围');
            return;
        }

        let confirmMsg = '';
        let clearedCount = 0;

        if (scope === 'all') {
            confirmMsg = '确定要清除该班级所有学生的所有测试成绩吗？此操作不可恢复！';
        } else if (scope === 'project') {
            const project = document.getElementById('clear-project-select').value;
            if (!project) {
                this.showToast('请选择要清除的项目');
                return;
            }
            const projectNames = {
                all: '所有项目',
                bmi: 'BMI（包括身高体重）',
                vitalCapacity: '肺活量',
                run50m: '50米跑',
                sitReach: '坐位体前屈',
                longJump: '立定跳远',
                pullUp: '引体向上',
                sitUp: '仰卧起坐',
                run1000m: '1000米跑',
                run800m: '800米跑'
            };
            confirmMsg = `确定要清除该班级所有学生的"${projectNames[project]}"成绩吗？此操作不可恢复！`;
        } else if (scope === 'student') {
            const studentId = document.getElementById('clear-student-select').value;
            if (!studentId) {
                this.showToast('请选择学生');
                return;
            }
            if (studentId === 'all') {
                confirmMsg = '确定要清除所有学生的全部成绩吗？此操作不可恢复！';
            } else {
                const student = this.data.students.find(s => s.id === studentId);
                confirmMsg = `确定要清除"${student.name}"的所有测试成绩吗？此操作不可恢复！`;
            }
        }

        if (!confirm(confirmMsg)) return;

        // 执行清除
        if (scope === 'all') {
            // 清除该班级所有成绩
            this.data.scores[classId] = {};
            clearedCount = this.data.students.filter(s => s.classId === classId).length;
        } else if (scope === 'project') {
            const project = document.getElementById('clear-project-select').value;
            const students = this.data.students.filter(s => s.classId === classId);

            students.forEach(student => {
                if (!this.data.scores[classId][student.id]) return;

                if (project === 'all') {
                    // 清除该学生所有成绩
                    this.data.scores[classId][student.id] = {};
                } else if (project === 'bmi') {
                    // 清除BMI相关数据
                    delete this.data.scores[classId][student.id].height;
                    delete this.data.scores[classId][student.id].weight;
                    delete this.data.scores[classId][student.id].bmi;
                } else {
                    // 清除指定项目
                    delete this.data.scores[classId][student.id][project];
                }
                clearedCount++;
            });
        } else if (scope === 'student') {
            const studentId = document.getElementById('clear-student-select').value;

            if (studentId === 'all') {
                // 清除所有学生成绩
                const students = this.data.students.filter(s => s.classId === classId);
                students.forEach(student => {
                    this.data.scores[classId][student.id] = {};
                });
                clearedCount = students.length;
            } else {
                // 清除指定学生成绩
                if (this.data.scores[classId]) {
                    this.data.scores[classId][studentId] = {};
                }
                clearedCount = 1;
            }
        }

        this.saveData();
        this.closeModal('clear-scores-modal');
        this.showToast(`已成功清除 ${clearedCount} 名学生的成绩`);
    },

    // ========== 成绩录入 ==========

    renderInputContainer() {
        const container = document.getElementById('input-container');
        const classId = document.getElementById('input-class-select').value;

        if (!classId) {
            container.innerHTML = '<div class="empty-state"><p>请先选择班级</p></div>';
            return;
        }

        const students = this.data.students.filter(s => s.classId === classId);
        if (students.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>该班级暂无学生，请先添加学生</p></div>';
            return;
        }

        if (this.data.currentInputMode === 'student') {
            this.renderStudentInputMode(container, students);
        } else {
            this.renderProjectInputMode(container, students);
        }
    },

    // 按学生录入模式
    renderStudentInputMode(container, students) {
        const maleStudents = students.filter(s => s.gender === '男');
        const femaleStudents = students.filter(s => s.gender === '女');

        let html = '';

        // 渲染男生表格
        if (maleStudents.length > 0) {
            html += this.renderStudentGenderTable(maleStudents, '男');
        }

        // 渲染女生表格
        if (femaleStudents.length > 0) {
            html += this.renderStudentGenderTable(femaleStudents, '女');
        }

        container.innerHTML = html;
    },

    // 渲染按性别分组的学生录入表格
    renderStudentGenderTable(students, gender) {
        const isMale = gender === '男';
        let html = `<div class="project-input-section"><h3>${gender}生</h3>`;
        html += '<div class="table-container"><table class="score-input-table">';
        html += `
            <thead>
                <tr>
                    <th>姓名</th>
                    <th>身高(m)</th>
                    <th>体重(kg)</th>
                    <th>BMI</th>
                    <th>肺活量(ml)</th>
                    <th>50米跑(秒)</th>
                    <th>坐位体前屈(cm)</th>
                    <th>立定跳远(cm)</th>
                    ${isMale ? '<th>引体向上(次)</th>' : '<th>仰卧起坐(次)</th>'}
                    ${isMale ? '<th>1000米跑</th>' : '<th>800米跑</th>'}
                </tr>
            </thead>
            <tbody>
        `;

        students.forEach(student => {
            const scores = this.getStudentScores(student.classId, student.id);

            html += `<tr data-student-id="${student.id}">`;

            // 姓名
            html += `<td>${student.name}</td>`;

            // 身高
            const height = scores.height || '';
            html += `<td><input type="number" step="0.01" data-project="height" data-student-id="${student.id}" value="${height}" placeholder="m" oninput="App.calculateBMIRealtime('${student.id}')"></td>`;

            // 体重
            const weight = scores.weight || '';
            html += `<td><input type="number" step="0.1" data-project="weight" data-student-id="${student.id}" value="${weight}" placeholder="kg" oninput="App.calculateBMIRealtime('${student.id}')"></td>`;

            // BMI（自动计算，只读显示）
            const bmi = scores.bmi || '';
            html += `<td><input type="text" data-project="bmi" data-student-id="${student.id}" value="${bmi}" placeholder="自动计算" readonly style="background:#f5f5f5;"></td>`;

            // 肺活量
            const vitalCapacity = scores.vitalCapacity || '';
            html += `<td><input type="number" data-project="vitalCapacity" value="${vitalCapacity}" placeholder="ml" onchange="App.saveScore('${student.id}', 'vitalCapacity', this.value)"></td>`;

            // 50米跑
            const run50m = scores.run50m || '';
            html += `<td><input type="number" step="0.1" data-project="run50m" value="${run50m}" placeholder="秒" onchange="App.saveScore('${student.id}', 'run50m', this.value)"></td>`;

            // 坐位体前屈
            const sitReach = scores.sitReach || '';
            html += `<td><input type="number" step="0.1" data-project="sitReach" value="${sitReach}" placeholder="cm" onchange="App.saveScore('${student.id}', 'sitReach', this.value)"></td>`;

            // 立定跳远
            const longJump = scores.longJump || '';
            html += `<td><input type="number" data-project="longJump" value="${longJump}" placeholder="cm" onchange="App.saveScore('${student.id}', 'longJump', this.value)"></td>`;

            if (isMale) {
                // 引体向上（男生）
                const pullUp = scores.pullUp || '';
                html += `<td><input type="number" data-project="pullUp" value="${pullUp}" placeholder="次" onchange="App.saveScore('${student.id}', 'pullUp', this.value)"></td>`;

                // 1000米跑（男生）
                const run1000m = scores.run1000m || '';
                html += `<td><input type="text" data-project="run1000m" value="${run1000m}" placeholder="分'秒" onchange="App.saveScore('${student.id}', 'run1000m', this.value)"></td>`;
            } else {
                // 仰卧起坐（女生）
                const sitUp = scores.sitUp || '';
                html += `<td><input type="number" data-project="sitUp" value="${sitUp}" placeholder="次" onchange="App.saveScore('${student.id}', 'sitUp', this.value)"></td>`;

                // 800米跑（女生）
                const run800m = scores.run800m || '';
                html += `<td><input type="text" data-project="run800m" value="${run800m}" placeholder="分'秒" onchange="App.saveScore('${student.id}', 'run800m', this.value)"></td>`;
            }

            html += '</tr>';
        });

        html += '</tbody></table></div></div>';
        return html;
    },

    // 按项目录入模式
    renderProjectInputMode(container, students) {
        const maleStudents = students.filter(s => s.gender === '男');
        const femaleStudents = students.filter(s => s.gender === '女');

        // 保存学生数据供后续使用
        this.data.projectInputStudents = {
            male: maleStudents,
            female: femaleStudents
        };

        // 所有可选项目
        const allProjects = [
            { key: 'bmi', name: 'BMI', needsHW: true },
            { key: 'vitalCapacity', name: '肺活量' },
            { key: 'run50m', name: '50米跑' },
            { key: 'sitReach', name: '坐位体前屈' },
            { key: 'longJump', name: '立定跳远' },
            { key: 'pullUp', name: '引体向上', maleOnly: true },
            { key: 'sitUp', name: '仰卧起坐', femaleOnly: true },
            { key: 'run1000m', name: '1000米跑', isTime: true, maleOnly: true },
            { key: 'run800m', name: '800米跑', isTime: true, femaleOnly: true }
        ];

        let html = '<div class="project-input-section">';

        // 项目选择器
        html += '<div style="margin-bottom: 16px;">';
        html += '<label style="display: block; margin-bottom: 8px; font-weight: 600;">选择测试项目：</label>';
        html += '<select id="project-select" class="select" onchange="App.onProjectSelectChange()" style="width: 100%;">';
        html += '<option value="">请选择项目</option>';
        allProjects.forEach(proj => {
            let label = proj.name;
            if (proj.maleOnly) label += ' (男生)';
            if (proj.femaleOnly) label += ' (女生)';
            html += `<option value="${proj.key}" data-male-only="${proj.maleOnly || false}" data-female-only="${proj.femaleOnly || false}">${label}</option>`;
        });
        html += '</select>';
        html += '</div>';

        // 性别选择器（默认隐藏，选择项目后显示）
        html += '<div id="gender-select-container" style="margin-bottom: 16px; display: none;">';
        html += '<label style="display: block; margin-bottom: 8px; font-weight: 600;">选择性别：</label>';
        html += '<div class="gender-tabs">';
        html += '<button type="button" class="gender-tab" id="gender-male" onclick="App.onGenderSelect(\'male\')">男生</button>';
        html += '<button type="button" class="gender-tab" id="gender-female" onclick="App.onGenderSelect(\'female\')">女生</button>';
        html += '</div>';
        html += '</div>';

        // 学生录入区域
        html += '<div id="project-student-input-container" style="display: none;">';
        html += '<h4 id="selected-project-title" style="margin-bottom: 12px;"></h4>';
        html += '<div id="project-student-list"></div>';
        html += '</div>';

        html += '</div>';

        container.innerHTML = html;

        // 恢复之前的选择状态
        if (this.data.selectedProject) {
            document.getElementById('project-select').value = this.data.selectedProject;
            this.onProjectSelectChange();
        }
    },

    // 项目选择变化
    onProjectSelectChange() {
        const select = document.getElementById('project-select');
        const projectKey = select.value;
        const genderContainer = document.getElementById('gender-select-container');
        const inputContainer = document.getElementById('project-student-input-container');

        this.data.selectedProject = projectKey;

        if (!projectKey) {
            genderContainer.style.display = 'none';
            inputContainer.style.display = 'none';
            this.data.selectedGender = null;
            return;
        }

        const option = select.options[select.selectedIndex];
        const maleOnly = option.dataset.maleOnly === 'true';
        const femaleOnly = option.dataset.femaleOnly === 'true';

        // 显示性别选择
        genderContainer.style.display = 'block';

        // 根据项目限制显示/隐藏性别选项
        const maleBtn = document.getElementById('gender-male');
        const femaleBtn = document.getElementById('gender-female');

        maleBtn.style.display = maleOnly || !femaleOnly ? 'block' : 'none';
        femaleBtn.style.display = femaleOnly || !maleOnly ? 'block' : 'none';

        // 重置性别选择
        document.querySelectorAll('.gender-tab').forEach(btn => btn.classList.remove('active'));
        inputContainer.style.display = 'none';
        this.data.selectedGender = null;

        // 如果只有一个性别可选，自动选择
        if (maleOnly && !femaleOnly) {
            this.onGenderSelect('male');
        } else if (femaleOnly && !maleOnly) {
            this.onGenderSelect('female');
        }
    },

    // 性别选择
    onGenderSelect(gender) {
        this.data.selectedGender = gender;

        // 更新按钮状态
        document.querySelectorAll('.gender-tab').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`gender-${gender}`).classList.add('active');

        // 显示学生录入列表
        this.renderProjectStudentList();
    },

    // 渲染项目学生录入列表
    renderProjectStudentList() {
        const container = document.getElementById('project-student-list');
        const titleEl = document.getElementById('selected-project-title');
        const inputContainer = document.getElementById('project-student-input-container');

        const projectKey = this.data.selectedProject;
        const gender = this.data.selectedGender;

        if (!projectKey || !gender) {
            inputContainer.style.display = 'none';
            return;
        }

        inputContainer.style.display = 'block';

        // 获取项目信息
        const projectInfo = this.getProjectInfo(projectKey);
        titleEl.textContent = `${projectInfo.name} ${projectInfo.needsHW ? '(需输入身高体重)' : ''}`;

        // 获取对应性别的学生
        const students = this.data.projectInputStudents[gender] || [];

        if (students.length === 0) {
            container.innerHTML = '<p class="empty-state">该班级没有' + (gender === 'male' ? '男生' : '女生') + '</p>';
            return;
        }

        let html = '<div class="table-container"><table class="score-input-table">';
        html += '<thead><tr><th>姓名</th>';

        if (projectInfo.needsHW) {
            html += '<th>身高(m)</th><th>体重(kg)</th><th>BMI</th>';
        } else {
            html += '<th>成绩</th>';
        }

        html += '<th>得分</th></tr></thead><tbody>';

        students.forEach(student => {
            const scores = this.getStudentScores(student.classId, student.id);
            html += `<tr data-student-id="${student.id}">`;
            html += `<td>${student.name}</td>`;

            if (projectInfo.needsHW) {
                // BMI项目需要身高体重
                const height = scores.height || '';
                const weight = scores.weight || '';
                const bmi = scores.bmi || '';

                html += `<td><input type="number" step="0.01" data-project="height" data-student-id="${student.id}" value="${height}" placeholder="m" oninput="App.calculateBMIRealtime('${student.id}')"></td>`;
                html += `<td><input type="number" step="0.1" data-project="weight" data-student-id="${student.id}" value="${weight}" placeholder="kg" oninput="App.calculateBMIRealtime('${student.id}')"></td>`;
                html += `<td><input type="text" data-project="bmi" data-student-id="${student.id}" value="${bmi}" placeholder="自动计算" readonly style="background:#f5f5f5;"></td>`;
            } else {
                // 其他项目
                const value = scores[projectKey] || '';
                const placeholder = projectInfo.isTime ? "分'秒" : projectInfo.unit || '';
                html += `<td><input type="text" data-project="${projectKey}" value="${value}" placeholder="${placeholder}" onchange="App.saveProjectScore('${student.id}', '${projectKey}', this.value); App.updateProjectScoreCell('${student.id}', '${student.gender}', '${projectKey}')"></td>`;
            }

            // 显示得分
            const scoreInfo = this.calculateStudentProjectScore(student, projectKey, scores);
            html += `<td class="score-display" data-score-cell="${projectKey}-${student.id}">${scoreInfo}</td>`;
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    },

    // 获取项目信息
    getProjectInfo(projectKey) {
        const projectMap = {
            bmi: { name: 'BMI', needsHW: true },
            vitalCapacity: { name: '肺活量', unit: 'ml' },
            run50m: { name: '50米跑', unit: '秒' },
            sitReach: { name: '坐位体前屈', unit: 'cm' },
            longJump: { name: '立定跳远', unit: 'cm' },
            pullUp: { name: '引体向上', unit: '次' },
            sitUp: { name: '仰卧起坐', unit: '次' },
            run1000m: { name: '1000米跑', isTime: true },
            run800m: { name: '800米跑', isTime: true }
        };
        return projectMap[projectKey] || { name: projectKey };
    },

    // 保存项目成绩
    saveProjectScore(studentId, project, value) {
        this.saveScore(studentId, project, value);
    },

    // 更新项目得分显示
    updateProjectScoreCell(studentId, gender, project) {
        const classId = document.getElementById('input-class-select').value;
        const scores = this.getStudentScores(classId, studentId);
        const scoreInfo = this.calculateStudentProjectScore(
            { id: studentId, gender, classId },
            project,
            scores
        );

        const cell = document.querySelector(`[data-score-cell="${project}-${studentId}"]`);
        if (cell) {
            cell.textContent = scoreInfo;
        }
    },

    calculateBMI(studentId) {
        const classId = document.getElementById('input-class-select').value;
        const scores = this.getStudentScores(classId, studentId);

        if (scores.height && scores.weight) {
            const bmi = (scores.weight / (scores.height * scores.height)).toFixed(1);
            this.saveScore(studentId, 'bmi', bmi);

            // 更新BMI显示
            const student = this.data.students.find(s => s.id === studentId);
            if (student) {
                const result = Standards.calculateScore(student.gender, 'bmi', parseFloat(bmi));
                const cells = document.querySelectorAll(`[data-score-cell="bmi-${studentId}"]`);
                cells.forEach(cell => {
                    cell.textContent = `${result.score}分 (${Standards.getLevelText(result.level)})`;
                });
            }
        }
    },

    // 实时计算BMI（用于按学生录入模式和按项目录入模式）
    calculateBMIRealtime(studentId) {
        const classId = document.getElementById('input-class-select').value;

        // 从DOM获取当前输入的值
        const heightInput = document.querySelector(`input[data-project="height"][data-student-id="${studentId}"]`);
        const weightInput = document.querySelector(`input[data-project="weight"][data-student-id="${studentId}"]`);
        const bmiInput = document.querySelector(`input[data-project="bmi"][data-student-id="${studentId}"]`);

        if (!heightInput || !weightInput || !bmiInput) return;

        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);

        // 保存输入的值
        if (heightInput.value) this.saveScore(studentId, 'height', heightInput.value);
        if (weightInput.value) this.saveScore(studentId, 'weight', weightInput.value);

        // 实时计算并显示BMI
        if (height && weight && height > 0) {
            const bmi = (weight / (height * height)).toFixed(1);
            bmiInput.value = bmi;
            this.saveScore(studentId, 'bmi', bmi);

            // 更新得分显示（用于按项目录入模式）
            const student = this.data.students.find(s => s.id === studentId);
            if (student) {
                const result = Standards.calculateScore(student.gender, 'bmi', parseFloat(bmi));
                const cells = document.querySelectorAll(`[data-score-cell="bmi-${studentId}"]`);
                cells.forEach(cell => {
                    cell.textContent = `${result.score}分 (${Standards.getLevelText(result.level)})`;
                });
            }
        } else {
            bmiInput.value = '';
        }
    },

    updateProjectScore(input, gender, project, studentId) {
        const value = input.value;
        let numValue;
        
        // 处理时间格式
        if (project.includes('run') && project !== 'run50m') {
            numValue = Standards.timeToSeconds(value);
        } else {
            numValue = parseFloat(value);
        }
        
        if (!isNaN(numValue)) {
            const result = Standards.calculateScore(gender, project, numValue);
            const bonus = Standards.calculateBonus(gender, project, numValue);
            const totalScore = result.score + bonus;
            
            let displayText = `${totalScore}分`;
            if (bonus > 0) displayText += ` (+${bonus})`;
            displayText += ` (${Standards.getLevelText(result.level)})`;
            
            const cells = document.querySelectorAll(`[data-score-cell="${project}-${studentId}"]`);
            cells.forEach(cell => {
                cell.textContent = displayText;
            });
        }
    },

    calculateStudentProjectScore(student, project, scores) {
        if (project === 'bmi') {
            if (scores.bmi) {
                const result = Standards.calculateScore(student.gender, 'bmi', parseFloat(scores.bmi));
                return `${result.score}分 (${Standards.getLevelText(result.level)})`;
            }
            return '-';
        }
        
        const value = scores[project];
        if (!value) return '-';
        
        let numValue;
        if (project.includes('run') && project !== 'run50m') {
            numValue = Standards.timeToSeconds(value);
        } else {
            numValue = parseFloat(value);
        }
        
        const result = Standards.calculateScore(student.gender, project, numValue);
        const bonus = Standards.calculateBonus(student.gender, project, numValue);
        const totalScore = result.score + bonus;
        
        let displayText = `${totalScore}分`;
        if (bonus > 0) displayText += ` (+${bonus})`;
        displayText += ` (${Standards.getLevelText(result.level)})`;
        
        return displayText;
    },

    getStudentScores(classId, studentId) {
        if (!this.data.scores[classId]) {
            this.data.scores[classId] = {};
        }
        if (!this.data.scores[classId][studentId]) {
            this.data.scores[classId][studentId] = {};
        }
        return this.data.scores[classId][studentId];
    },

    saveScore(studentId, project, value) {
        const classId = document.getElementById('input-class-select').value;
        const scores = this.getStudentScores(classId, studentId);
        scores[project] = value;
        this.saveData();
    },

    // ========== 测试记录 ==========

    renderRecords() {
        const container = document.getElementById('records-container');
        const classId = document.getElementById('record-class-select').value;

        if (!classId) {
            container.innerHTML = '<div class="empty-state"><p>请先选择班级</p></div>';
            return;
        }

        const students = this.data.students.filter(s => s.classId === classId);
        if (students.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>该班级暂无学生</p></div>';
            return;
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>姓名</th><th>性别</th><th>BMI</th><th>肺活量</th><th>50米跑</th><th>坐位体前屈</th><th>立定跳远</th>';
        html += '<th>引体向上/仰卧起坐</th><th>1000/800米</th><th>总分</th><th>等级</th>';
        html += '</tr></thead><tbody>';

        students.forEach(student => {
            const result = this.calculateTotalScore(student);
            const scores = this.getStudentScores(classId, student.id);
            
            html += '<tr>';
            html += `<td>${student.name}</td>`;
            html += `<td>${student.gender}</td>`;
            html += `<td>${scores.bmi || '-'}</td>`;
            html += `<td>${scores.vitalCapacity || '-'}</td>`;
            html += `<td>${scores.run50m || '-'}</td>`;
            html += `<td>${scores.sitReach || '-'}</td>`;
            html += `<td>${scores.longJump || '-'}</td>`;
            html += `<td>${student.gender === '男' ? (scores.pullUp || '-') : (scores.sitUp || '-')}</td>`;
            html += `<td>${student.gender === '男' ? (scores.run1000m || '-') : (scores.run800m || '-')}</td>`;
            html += `<td><strong>${result.total.toFixed(1)}</strong></td>`;
            html += `<td><span class="score-tag ${result.level}">${Standards.getLevelText(result.level)}</span></td>`;
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    },

    calculateTotalScore(student) {
        const classId = student.classId;
        const scores = this.getStudentScores(classId, student.id);
        const gender = student.gender;
        
        let totalScore = 0;
        let totalBonus = 0;

        // 计算各项目得分
        const projects = Standards.getProjectsByGender(gender);
        projects.forEach(proj => {
            const value = scores[proj.key];
            if (!value) return;

            let numValue;
            if (proj.key.includes('run') && proj.key !== 'run50m') {
                numValue = Standards.timeToSeconds(value);
            } else {
                numValue = parseFloat(value);
            }

            if (isNaN(numValue)) return;

            const result = Standards.calculateScore(gender, proj.key, numValue);
            const weight = Standards.weights[proj.key] || 0;
            totalScore += result.score * weight;

            // 计算加分
            const bonus = Standards.calculateBonus(gender, proj.key, numValue);
            totalBonus += bonus;
        });

        const finalScore = Math.min(totalScore + totalBonus, 120);
        
        return {
            total: finalScore,
            base: totalScore,
            bonus: totalBonus,
            level: Standards.getLevel(finalScore)
        };
    },

    // ========== Excel导出 ==========

    exportToExcel() {
        const classId = document.getElementById('record-class-select').value;
        if (!classId) {
            this.showToast('请先选择班级');
            return;
        }

        const cls = this.data.classes.find(c => c.id === classId);
        const students = this.data.students.filter(s => s.classId === classId);
        
        if (students.length === 0) {
            this.showToast('该班级暂无学生');
            return;
        }

        // 定义统一的列顺序
        const columnOrder = [
            '姓名', '性别', '身高(m)', '体重(kg)', 'BMI',
            '肺活量(ml)', '50米跑(秒)', '坐位体前屈(cm)', '立定跳远(cm)',
            '引体向上(次)', '1000米跑', '仰卧起坐(次)', '800米跑',
            '基础分', '加分', '总分', '等级'
        ];

        const exportData = students.map(student => {
            const scores = this.getStudentScores(classId, student.id);
            const result = this.calculateTotalScore(student);

            // 构建导出数据，所有行都有相同的列
            const row = {};

            // 基本信息
            row['姓名'] = student.name;
            row['性别'] = student.gender;
            row['身高(m)'] = scores.height || '';
            row['体重(kg)'] = scores.weight || '';
            row['BMI'] = scores.bmi || '';

            // 共同项目
            row['肺活量(ml)'] = scores.vitalCapacity || '';
            row['50米跑(秒)'] = scores.run50m || '';
            row['坐位体前屈(cm)'] = scores.sitReach || '';
            row['立定跳远(cm)'] = scores.longJump || '';

            // 男生特有项目（所有行都包含，不对应性别为空）
            row['引体向上(次)'] = student.gender === '男' ? (scores.pullUp || '') : '';
            row['1000米跑'] = student.gender === '男' ? (scores.run1000m || '') : '';

            // 女生特有项目（所有行都包含，不对应性别为空）
            row['仰卧起坐(次)'] = student.gender === '女' ? (scores.sitUp || '') : '';
            row['800米跑'] = student.gender === '女' ? (scores.run800m || '') : '';

            // 分数信息
            row['基础分'] = result.base.toFixed(1);
            row['加分'] = result.bonus.toFixed(0);
            row['总分'] = result.total.toFixed(1);
            row['等级'] = Standards.getLevelText(result.level);

            return row;
        });

        // 使用指定的列顺序创建sheet
        const ws = XLSX.utils.json_to_sheet(exportData, { header: columnOrder });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, cls.name);

        const fileName = `${cls.name}_体质测试成绩_${new Date().toLocaleDateString()}.xlsx`;

        // 生成 Excel 二进制数据
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // 检测是否为移动端
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 检测是否在 WebView 中（APK 环境）
        const isWebView = this._isInWebView();
        
        // 检测是否在 PakePlus 环境中
        const isPakePlus = this._isInPakePlus();

        if (isPakePlus) {
            // PakePlus 环境：使用 PakePlus 文件下载 API
            this._downloadWithPakePlus(blob, fileName, exportData, columnOrder);
        } else if (isMobile && isWebView) {
            // APK WebView 环境：跳转到浏览器下载
            this._openInBrowserForDownload(blob, fileName, exportData, columnOrder);
        } else if (isMobile) {
            // 普通移动端浏览器：显示导出弹窗
            this._showExportModal(exportData, columnOrder, fileName);
        } else {
            // 桌面端：直接下载
            try {
                XLSX.writeFile(wb, fileName);
                this.showToast('导出成功');
            } catch (e) {
                try {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 100);
                    this.showToast('导出成功');
                } catch (err) {
                    console.error('导出失败:', err);
                    this.showToast('导出失败，请重试');
                }
            }
        }
    },

    // 移动端导出弹窗
    _showExportModal(exportData, columnOrder, fileName) {
        const self = this;

        // 移除已有弹窗
        const existing = document.getElementById('download-modal');
        if (existing) existing.remove();

        // ====== 生成 TSV 内容（Tab分隔，粘贴到Excel/WPS自动分列）======
        // 这是最可靠的方案：TSV格式粘贴到Excel会自动分列
        let tsvContent = '';
        if (columnOrder && exportData) {
            tsvContent = columnOrder.join('\t') + '\n';
            exportData.forEach(row => {
                tsvContent += columnOrder.map(col => {
                    return row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
                }).join('\t') + '\n';
            });
        }

        // ====== 生成 CSV 内容（用于尝试系统分享）======
        let csvContent = '';
        if (columnOrder && exportData) {
            csvContent = columnOrder.join(',') + '\n';
            exportData.forEach(row => {
                csvContent += columnOrder.map(col => {
                    let val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
                    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                        val = '"' + val.replace(/"/g, '""') + '"';
                    }
                    return val;
                }).join(',') + '\n';
            });
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'download-modal';

        const escapedTsv = tsvContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        modal.innerHTML = `
            <div class="modal-content" style="max-width:460px;max-height:90vh;overflow-y:auto;">
                <h3 style="margin-bottom:6px;">导出数据</h3>
                <p style="font-size:0.78rem;color:#666;margin-bottom:12px;word-break:break-all;">${fileName}</p>

                <!-- 主推方案：复制到剪贴板 -->
                <div style="background:#e8f5e9;border-radius:8px;padding:12px;margin-bottom:12px;">
                    <div style="font-size:0.85rem;font-weight:600;color:#2e7d32;margin-bottom:8px;">推荐方式：复制 → 粘贴到WPS/Excel</div>
                    <button class="btn btn-success download-option-btn" id="btn-copy-tsv" style="width:100%;padding:14px;font-size:1rem;border-radius:8px;margin-bottom:8px;">
                        复制表格数据
                    </button>
                    <div style="font-size:0.72rem;color:#388E3C;line-height:1.5;">
                        点击上方按钮复制后：<br>
                        1. 打开手机 WPS 或 Excel<br>
                        2. 新建一个空白表格<br>
                        3. 点击第一个单元格 → 粘贴<br>
                        数据会自动分到各列，效果和Excel文件一样
                    </div>
                </div>

                <!-- 数据区域 -->
                <div style="margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:0.78rem;font-weight:600;color:#333;">数据内容（长按可手动复制）：</span>
                        <button class="btn btn-small btn-primary" id="btn-select-all" style="padding:4px 10px;font-size:0.72rem;">全选复制</button>
                    </div>
                    <textarea id="csv-textarea" readonly style="width:100%;height:150px;font-size:0.65rem;padding:8px;border:1px solid #ddd;border-radius:6px;resize:vertical;font-family:monospace;line-height:1.4;">${escapedTsv}</textarea>
                </div>

                <!-- 复制结果提示区 -->
                <div id="export-tip" style="padding:10px;border-radius:6px;font-size:0.75rem;line-height:1.5;display:none;"></div>

                <!-- 尝试性方案：系统分享 -->
                <details style="margin-top:10px;border:1px solid #e0e0e0;border-radius:6px;padding:0;">
                    <summary style="padding:10px 12px;font-size:0.8rem;color:#666;cursor:pointer;user-select:none;">
                        其他导出方式（可能不支持）
                    </summary>
                    <div style="padding:10px 12px;border-top:1px solid #e0e0e0;display:flex;flex-direction:column;gap:8px;">
                        <button class="btn btn-secondary download-option-btn" id="btn-share-intent" style="width:100%;padding:12px;font-size:0.85rem;">
                            尝试系统分享
                        </button>
                        <button class="btn btn-secondary download-option-btn" id="btn-copy-csv" style="width:100%;padding:12px;font-size:0.85rem;">
                            复制CSV文本
                        </button>
                        <div style="font-size:0.7rem;color:#999;line-height:1.4;">
                            "系统分享"依赖手机配置，可能无法弹出分享面板。<br>
                            "CSV文本"粘贴到Excel不会自动分列，需保存为.csv文件后打开。
                        </div>
                    </div>
                </details>

                <div class="modal-actions" style="margin-top:14px;">
                    <button class="btn btn-secondary" id="btn-close-export-modal">关闭</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 关闭
        modal.querySelector('#btn-close-export-modal').addEventListener('click', function() {
            modal.remove();
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });

        var tipEl = modal.querySelector('#export-tip');
        function showTip(msg, type) {
            tipEl.innerHTML = msg;
            if (type === 'error') {
                tipEl.style.background = '#ffebee';
                tipEl.style.color = '#c62828';
            } else if (type === 'warn') {
                tipEl.style.background = '#fff3e0';
                tipEl.style.color = '#e65100';
            } else {
                tipEl.style.background = '#e8f5e9';
                tipEl.style.color = '#2e7d32';
            }
            tipEl.style.display = 'block';
        }

        // ====== 主方案：复制TSV数据 ======
        modal.querySelector('#btn-copy-tsv').addEventListener('click', function() {
            self._copyText(tsvContent, function(ok) {
                if (ok) {
                    showTip('复制成功！现在请打开 WPS/Excel → 新建表格 → 点击第一个单元格 → 粘贴');
                    // 同时尝试把数据也放到可见textarea里方便确认
                    var textarea = modal.querySelector('#csv-textarea');
                    if (textarea) textarea.style.borderColor = '#4CAF50';
                } else {
                    showTip('自动复制失败，请点击上方"全选复制"按钮，然后手动长按文本框复制', 'warn');
                }
            });
        });

        // ====== 全选复制按钮 ======
        modal.querySelector('#btn-select-all').addEventListener('click', function() {
            var textarea = modal.querySelector('#csv-textarea');
            // 让textarea可见并聚焦
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, 99999999);
            // 尝试自动复制
            self._copyText(tsvContent, function(ok) {
                if (ok) {
                    showTip('已全选并复制！现在请打开 WPS/Excel → 新建表格 → 粘贴');
                } else {
                    showTip('已全选，请长按文本框 → 点击"复制"，然后去 WPS/Excel 粘贴', 'warn');
                }
            });
        });

        // ====== 尝试性方案：系统分享 ======
        modal.querySelector('#btn-share-intent').addEventListener('click', function() {
            // 依次尝试：Web Share API → intent:// URL → 提示
            if (navigator.share) {
                navigator.share({
                    title: fileName,
                    text: csvContent
                }).then(function() {
                    self.showToast('分享成功');
                    modal.remove();
                }).catch(function(err) {
                    if (err.name === 'AbortError') return;
                    // Web Share 失败，尝试 intent URL
                    tryIntent();
                });
            } else {
                tryIntent();
            }

            function tryIntent() {
                try {
                    var intentUrl = 'intent:#Intent;action=android.intent.action.SEND;type=text/plain;' +
                        'S.android.intent.extra.TEXT=' + encodeURIComponent(csvContent) + ';end';
                    window.location.href = intentUrl;
                    showTip('如果分享面板未弹出，说明当前环境不支持，请使用上方"复制表格数据"方式', 'warn');
                } catch(e) {
                    showTip('当前环境不支持系统分享，请使用上方"复制表格数据"方式', 'warn');
                }
            }
        });

        // ====== 尝试性方案：复制CSV ======
        modal.querySelector('#btn-copy-csv').addEventListener('click', function() {
            self._copyText(csvContent, function(ok) {
                if (ok) {
                    showTip('CSV已复制！粘贴到备忘录等 → 保存为 .csv 文件 → 用Excel打开');
                } else {
                    showTip('自动复制失败，请长按文本框手动复制', 'warn');
                }
            });
        });
    },

    // 检测是否在 WebView 中（APK环境）
    _isInWebView() {
        const ua = navigator.userAgent || '';
        
        // 必须是 Android 系统
        if (!/Android/.test(ua)) return false;
        
        // 检测 WebView 特征
        // 1. 检查是否有 'wv' 或 'Version/' 等 WebView 标识
        if (/wv/.test(ua) || /Version\//.test(ua)) return true;
        
        // 2. 检查是否在 iframe 或受限环境中
        if (window.parent !== window) return true;
        
        // 3. 某些 APK 打包工具会注入特定标识
        if (window._isAndroidWebView || window.Android || window.WebView) return true;
        
        // 4. 检查是否有原生 Android 接口注入
        try {
            if (window.android !== undefined) return true;
        } catch(e) {}
        
        // 5. 检测是否有 Android DownloadManager 相关接口
        try {
            if (window.DownloadManager || window.downloadManager) return true;
        } catch(e) {}
        
        return false;
    },

    // 在 APK WebView 中打开浏览器下载 Excel
    _openInBrowserForDownload(blob, fileName, exportData, columnOrder) {
        const self = this;
        
        // 将 Blob 转换为 Base64 Data URL
        const reader = new FileReader();
        reader.onloadend = function() {
            try {
                const base64 = reader.result.split(',')[1];
                const dataUrl = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64;
                self._showWebViewDownloadModal(dataUrl, fileName, exportData, columnOrder);
            } catch (e) {
                console.error('Data URL conversion failed:', e);
                self._showExportModal(exportData, columnOrder, fileName);
            }
        };
        reader.onerror = function() {
            console.error('FileReader error');
            self._showExportModal(exportData, columnOrder, fileName);
        };
        reader.readAsDataURL(blob);
    },

    // APK WebView 下载引导弹窗
    _showWebViewDownloadModal(dataUrl, fileName, exportData, columnOrder) {
        const self = this;
        
        // 生成 TSV 内容作为备用
        let tsvContent = '';
        if (columnOrder && exportData) {
            tsvContent = columnOrder.join('\t') + '\n';
            exportData.forEach(row => {
                tsvContent += columnOrder.map(col => {
                    return row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
                }).join('\t') + '\n';
            });
        }

        // 移除已有弹窗
        const existing = document.getElementById('download-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'download-modal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width:460px;max-height:90vh;overflow-y:auto;">
                <h3 style="margin-bottom:6px;">导出Excel文件</h3>
                <p style="font-size:0.78rem;color:#666;margin-bottom:16px;word-break:break-all;">${fileName}</p>

                <!-- 主推方案：打开浏览器下载 -->
                <div style="background:#e8f5e9;border-radius:8px;padding:12px;margin-bottom:12px;">
                    <div style="font-size:0.85rem;font-weight:600;color:#2e7d32;margin-bottom:12px;">
                        方法一：打开浏览器下载（推荐）
                    </div>
                    <button class="btn btn-success download-option-btn" id="btn-open-browser" style="width:100%;padding:14px;font-size:1rem;border-radius:8px;margin-bottom:8px;">
                        打开浏览器
                    </button>
                    <div style="font-size:0.72rem;color:#388E3C;line-height:1.5;">
                        点击后会自动打开浏览器并下载Excel文件<br>
                        如果没反应，请使用方法二
                    </div>
                </div>

                <!-- 备用方案：复制表格数据 -->
                <div style="background:#fff3e0;border-radius:8px;padding:12px;margin-bottom:12px;">
                    <div style="font-size:0.85rem;font-weight:600;color:#e65100;margin-bottom:8px;">方法二：复制表格到WPS/Excel</div>
                    <button class="btn btn-warning download-option-btn" id="btn-copy-tsv" style="width:100%;padding:14px;font-size:1rem;border-radius:8px;margin-bottom:8px;">
                        复制表格数据
                    </button>
                    <div style="font-size:0.72rem;color:#388E3C;line-height:1.5;">
                        复制后打开 WPS 或 Excel → 新建表格 → 粘贴
                    </div>
                </div>

                <div class="modal-actions" style="margin-top:14px;">
                    <button class="btn btn-secondary" id="btn-close-export-modal">关闭</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 打开浏览器按钮
        modal.querySelector('#btn-open-browser').addEventListener('click', function() {
            try {
                // 创建隐藏下载链接
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                
                // 方法1: 尝试直接点击下载
                try {
                    link.click();
                    self.showToast('正在下载，请查看通知栏或文件管理器的下载目录');
                } catch(e1) {
                    console.log('Direct download failed:', e1);
                }
                
                // 方法2: 同时尝试打开外部浏览器（使用 intent:// 协议）
                setTimeout(function() {
                    try {
                        const intentUrl = 'intent:#Intent;action=android.intent.action.VIEW;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;category=android.intent.category.BROWSABLE;end';
                        window.location.href = intentUrl;
                    } catch(e2) {
                        console.log('Intent failed:', e2);
                    }
                    
                    // 方法3: 如果前面都失败，提示用户
                    setTimeout(function() {
                        self.showToast('如果文件未下载，请使用方法二复制表格');
                    }, 1000);
                }, 500);
                
                // 延迟清理
                setTimeout(function() {
                    if (link.parentNode) {
                        document.body.removeChild(link);
                    }
                }, 2000);
                
            } catch (e) {
                console.error('Download failed:', e);
                self.showToast('下载失败，请使用方法二');
            }
        });

        // 复制按钮
        modal.querySelector('#btn-copy-tsv').addEventListener('click', function() {
            self._copyText(tsvContent, function(ok) {
                if (ok) {
                    self.showToast('复制成功！请打开WPS/Excel粘贴');
                } else {
                    self.showToast('复制失败，请长按手动复制');
                }
            });
        });

        // 关闭按钮
        modal.querySelector('#btn-close-export-modal').addEventListener('click', function() {
            modal.remove();
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });
    },

    // 尝试打开外部浏览器
    _tryOpenExternalBrowser(dataUrl, fileName) {
        try {
            // 方案1: 使用 intent:// 协议打开浏览器
            if (/Android/.test(navigator.userAgent)) {
                const intentUrl = `intent:${dataUrl}#Intent;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;action=android.intent.action.VIEW;end`;
                window.location.href = intentUrl;
            } else {
                // 方案2: 直接 window.open
                window.open(dataUrl, '_blank');
            }
        } catch (e) {
            console.error('Open browser failed:', e);
        }
    },

    // 复制文本到剪贴板（兼容 WebView）
    _copyText(text, callback) {
        var appInstance = this;

        // 方法1: clipboard API（部分 WebView 支持）
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                appInstance.showToast('已复制到剪贴板');
                if (callback) callback(true);
            }).catch(function() {
                // clipboard API 失败，尝试方法2
                doFallback();
            });
            return;
        }

        // 方法2: execCommand('copy')
        doFallback();

        function doFallback() {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            var ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (e) {
                ok = false;
            }
            document.body.removeChild(textarea);
            if (ok) {
                appInstance.showToast('已复制到剪贴板');
            } else {
                appInstance.showToast('复制失败，请长按文本框手动复制');
            }
            if (callback) callback(ok);
        }
    },

    // ========== PakePlus 支持 ==========

    // 检测是否在 PakePlus 环境中
    _isInPakePlus() {
        // PakePlus 会注入 __TAURI__ 对象
        return typeof window !== 'undefined' && 
               window.__TAURI__ && 
               window.__TAURI__.core &&
               typeof window.__TAURI__.core.invoke === 'function';
    },

    // 使用 PakePlus 下载文件
    async _downloadWithPakePlus(blob, fileName, exportData, columnOrder) {
        const self = this;
        
        try {
            // 使用 PakePlus 桥接脚本下载文件
            if (window.PakePlusBridge && window.PakePlusBridge.isPakePlus()) {
                const result = await window.PakePlusBridge.downloadFile(blob, fileName);
                if (result.success) {
                    self.showToast('文件已保存到: ' + result.path);
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('PakePlus Bridge not available');
            }
        } catch (e) {
            console.error('PakePlus download failed:', e);
            // 失败时回退到复制方式
            this._showExportModal(exportData, columnOrder, fileName);
        }
    },

    // ========== 雷达图 ==========

    showStudentCompareModal() {
        const classId = document.getElementById('radar-class-select').value;
        if (!classId) {
            this.showToast('请先选择班级');
            return;
        }

        const students = this.data.students.filter(s => s.classId === classId);
        if (students.length === 0) {
            this.showToast('该班级暂无学生');
            return;
        }

        const container = document.getElementById('compare-student-list');
        container.innerHTML = students.map(s => `
            <div class="student-select-item" data-student-id="${s.id}" onclick="App.toggleCompareStudent('${s.id}')">
                <input type="checkbox" ${this.data.compareStudents.includes(s.id) ? 'checked' : ''}>
                <span>${s.name} (${s.gender})</span>
            </div>
        `).join('');

        this.openModal('compare-modal');
    },

    toggleCompareStudent(studentId) {
        const index = this.data.compareStudents.indexOf(studentId);
        if (index > -1) {
            this.data.compareStudents.splice(index, 1);
        } else if (this.data.compareStudents.length < 3) {
            this.data.compareStudents.push(studentId);
        } else {
            this.showToast('最多只能选择3名学生进行对比');
            return;
        }

        // 更新UI
        document.querySelectorAll('#compare-student-list .student-select-item').forEach(item => {
            const id = item.dataset.studentId;
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = this.data.compareStudents.includes(id);
            item.classList.toggle('selected', this.data.compareStudents.includes(id));
        });
    },

    confirmCompare() {
        this.closeModal('compare-modal');
        this.renderRadarChart();
    },

    // 更新雷达图学生选择下拉框
    updateRadarStudentSelect() {
        const classId = document.getElementById('radar-class-select').value;
        const studentSelect = document.getElementById('radar-student-select');
        const compareBtn = document.getElementById('radar-compare-btn');

        if (!classId) {
            studentSelect.style.display = 'none';
            compareBtn.style.display = 'none';
            studentSelect.innerHTML = '<option value="">请选择学生</option>';
            return;
        }

        const students = this.data.students.filter(s => s.classId === classId);
        if (students.length === 0) {
            studentSelect.style.display = 'none';
            compareBtn.style.display = 'none';
            return;
        }

        studentSelect.style.display = 'block';
        compareBtn.style.display = 'inline-flex';

        // 保持当前选中的学生
        const currentValue = studentSelect.value;
        studentSelect.innerHTML = '<option value="">请选择学生</option>' +
            students.map(s => `<option value="${s.id}">${s.name} (${s.gender})</option>`).join('');

        // 如果之前选中的学生还在列表中，保持选中
        if (currentValue && students.find(s => s.id === currentValue)) {
            studentSelect.value = currentValue;
        }
    },

    // 重置雷达图视图
    resetRadarView() {
        const canvas = document.getElementById('radarChart');
        const emptyState = document.getElementById('radar-empty-state');
        const scoreDetails = document.getElementById('radar-score-details');

        if (this.data.radarChart) {
            this.data.radarChart.destroy();
            this.data.radarChart = null;
        }

        canvas.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = '<p>请选择学生查看雷达图</p>';
        scoreDetails.style.display = 'none';
        scoreDetails.innerHTML = '';
    },

    renderRadarChart() {
        const canvas = document.getElementById('radarChart');
        const emptyState = document.getElementById('radar-empty-state');
        const scoreDetails = document.getElementById('radar-score-details');
        const classId = document.getElementById('radar-class-select').value;

        if (!classId || this.data.compareStudents.length === 0) {
            this.resetRadarView();
            return;
        }

        // 显示canvas，隐藏空状态
        canvas.style.display = 'block';
        emptyState.style.display = 'none';
        scoreDetails.style.display = 'block';

        // 准备雷达图数据
        const labels = ['BMI', '肺活量', '50米跑', '坐位体前屈', '立定跳远', '力量/耐力', '长跑'];
        const datasets = [];
        const colors = [
            { border: 'rgba(76, 175, 80, 1)', bg: 'rgba(76, 175, 80, 0.2)' },
            { border: 'rgba(33, 150, 243, 1)', bg: 'rgba(33, 150, 243, 0.2)' },
            { border: 'rgba(255, 152, 0, 1)', bg: 'rgba(255, 152, 0, 0.2)' }
        ];

        // 存储学生成绩详情数据
        const studentsData = [];

        this.data.compareStudents.forEach((studentId, index) => {
            const student = this.data.students.find(s => s.id === studentId);
            if (!student) return;

            const scores = this.getStudentScores(classId, studentId);
            const data = this.getRadarData(student, scores);
            const totalResult = this.calculateTotalScore(student);

            datasets.push({
                label: student.name,
                data: data,
                borderColor: colors[index].border,
                backgroundColor: colors[index].bg,
                borderWidth: 2,
                pointRadius: 4
            });

            // 收集学生成绩详情
            studentsData.push({
                student,
                scores,
                totalResult,
                radarScores: data,
                color: colors[index].border
            });
        });

        if (this.data.radarChart) {
            this.data.radarChart.destroy();
        }

        this.data.radarChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // 渲染成绩详情表格
        this.renderRadarScoreDetails(studentsData);
    },

    // 渲染雷达图成绩详情
    renderRadarScoreDetails(studentsData) {
        const container = document.getElementById('radar-score-details');

        let html = '<div class="project-input-section"><h3>成绩详情</h3>';

        studentsData.forEach(({ student, scores, totalResult, radarScores, color }) => {
            const isMale = student.gender === '男';

            html += `<div class="score-detail-card" style="margin-bottom: 16px; border-left: 4px solid ${color}; padding-left: 12px;">`;
            html += `<h4 style="margin-bottom: 8px;">${student.name} (${student.gender})</h4>`;

            // 总分和等级
            html += `<div style="margin-bottom: 12px;">`;
            html += `<span style="font-size: 1.2rem; font-weight: bold; color: ${color};">总分: ${totalResult.total.toFixed(1)}</span> `;
            html += `<span class="score-tag ${totalResult.level}">${Standards.getLevelText(totalResult.level)}</span>`;
            if (totalResult.bonus > 0) {
                html += `<span style="color: #ff9800; margin-left: 8px;">(+${totalResult.bonus}分)</span>`;
            }
            html += `</div>`;

            // 成绩表格
            html += '<div class="table-container"><table class="score-input-table" style="font-size: 0.8rem;">';
            html += '<thead><tr><th>项目</th><th>成绩</th><th>得分</th></tr></thead><tbody>';

            // BMI
            if (scores.bmi) {
                const bmiResult = Standards.calculateScore(student.gender, 'bmi', parseFloat(scores.bmi));
                html += `<tr><td>BMI</td><td>${scores.bmi}</td><td>${bmiResult.score}分 (${Standards.getLevelText(bmiResult.level)})</td></tr>`;
            }

            // 肺活量
            if (scores.vitalCapacity) {
                const vcResult = Standards.calculateScore(student.gender, 'vitalCapacity', parseFloat(scores.vitalCapacity));
                html += `<tr><td>肺活量</td><td>${scores.vitalCapacity} ml</td><td>${vcResult.score}分</td></tr>`;
            }

            // 50米跑
            if (scores.run50m) {
                const run50Result = Standards.calculateScore(student.gender, 'run50m', parseFloat(scores.run50m));
                html += `<tr><td>50米跑</td><td>${scores.run50m} 秒</td><td>${run50Result.score}分</td></tr>`;
            }

            // 坐位体前屈
            if (scores.sitReach) {
                const srResult = Standards.calculateScore(student.gender, 'sitReach', parseFloat(scores.sitReach));
                html += `<tr><td>坐位体前屈</td><td>${scores.sitReach} cm</td><td>${srResult.score}分</td></tr>`;
            }

            // 立定跳远
            if (scores.longJump) {
                const ljResult = Standards.calculateScore(student.gender, 'longJump', parseFloat(scores.longJump));
                html += `<tr><td>立定跳远</td><td>${scores.longJump} cm</td><td>${ljResult.score}分</td></tr>`;
            }

            // 力量项目
            if (isMale && scores.pullUp) {
                const pullUpResult = Standards.calculateScore('男', 'pullUp', parseFloat(scores.pullUp));
                const pullUpBonus = Standards.calculateBonus('男', 'pullUp', parseFloat(scores.pullUp));
                html += `<tr><td>引体向上</td><td>${scores.pullUp} 次</td><td>${pullUpResult.score}分${pullUpBonus > 0 ? ' (+' + pullUpBonus + ')' : ''}</td></tr>`;
            } else if (!isMale && scores.sitUp) {
                const sitUpResult = Standards.calculateScore('女', 'sitUp', parseFloat(scores.sitUp));
                const sitUpBonus = Standards.calculateBonus('女', 'sitUp', parseFloat(scores.sitUp));
                html += `<tr><td>仰卧起坐</td><td>${scores.sitUp} 次</td><td>${sitUpResult.score}分${sitUpBonus > 0 ? ' (+' + sitUpBonus + ')' : ''}</td></tr>`;
            }

            // 长跑项目
            if (isMale && scores.run1000m) {
                const run1000Result = Standards.calculateScore('男', 'run1000m', Standards.timeToSeconds(scores.run1000m));
                const run1000Bonus = Standards.calculateBonus('男', 'run1000m', Standards.timeToSeconds(scores.run1000m));
                html += `<tr><td>1000米跑</td><td>${scores.run1000m}</td><td>${run1000Result.score}分${run1000Bonus > 0 ? ' (+' + run1000Bonus + ')' : ''}</td></tr>`;
            } else if (!isMale && scores.run800m) {
                const run800Result = Standards.calculateScore('女', 'run800m', Standards.timeToSeconds(scores.run800m));
                const run800Bonus = Standards.calculateBonus('女', 'run800m', Standards.timeToSeconds(scores.run800m));
                html += `<tr><td>800米跑</td><td>${scores.run800m}</td><td>${run800Result.score}分${run800Bonus > 0 ? ' (+' + run800Bonus + ')' : ''}</td></tr>`;
            }

            html += '</tbody></table></div>';
            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
    },

    getRadarData(student, scores) {
        const gender = student.gender;
        const data = [];

        // BMI
        if (scores.bmi) {
            const result = Standards.calculateScore(gender, 'bmi', parseFloat(scores.bmi));
            data.push(result.score);
        } else {
            data.push(0);
        }

        // 肺活量
        if (scores.vitalCapacity) {
            const result = Standards.calculateScore(gender, 'vitalCapacity', parseFloat(scores.vitalCapacity));
            data.push(result.score);
        } else {
            data.push(0);
        }

        // 50米跑
        if (scores.run50m) {
            const result = Standards.calculateScore(gender, 'run50m', parseFloat(scores.run50m));
            data.push(result.score);
        } else {
            data.push(0);
        }

        // 坐位体前屈
        if (scores.sitReach) {
            const result = Standards.calculateScore(gender, 'sitReach', parseFloat(scores.sitReach));
            data.push(result.score);
        } else {
            data.push(0);
        }

        // 立定跳远
        if (scores.longJump) {
            const result = Standards.calculateScore(gender, 'longJump', parseFloat(scores.longJump));
            data.push(result.score);
        } else {
            data.push(0);
        }

        // 力量项目（引体向上/仰卧起坐）
        const strengthProject = gender === '男' ? 'pullUp' : 'sitUp';
        const strengthValue = gender === '男' ? scores.pullUp : scores.sitUp;
        if (strengthValue) {
            const result = Standards.calculateScore(gender, strengthProject, parseFloat(strengthValue));
            data.push(result.score);
        } else {
            data.push(0);
        }

        // 长跑（1000米/800米）
        const runProject = gender === '男' ? 'run1000m' : 'run800m';
        const runValue = gender === '男' ? scores.run1000m : scores.run800m;
        if (runValue) {
            const seconds = Standards.timeToSeconds(runValue);
            const result = Standards.calculateScore(gender, runProject, seconds);
            data.push(result.score);
        } else {
            data.push(0);
        }

        return data;
    },

    // ========== 成绩分析功能 ==========

    renderAnalysis() {
        const classId = document.getElementById('analysis-class-select').value;
        const emptyState = document.getElementById('analysis-empty-state');
        const content = document.getElementById('analysis-content');

        if (!classId) {
            emptyState.style.display = 'block';
            content.style.display = 'none';
            return;
        }

        const students = this.data.students.filter(s => s.classId === classId);
        if (students.length === 0) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = '<p>该班级暂无学生</p>';
            content.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        content.style.display = 'block';

        // 分离男女学生
        const maleStudents = students.filter(s => s.gender === '男');
        const femaleStudents = students.filter(s => s.gender === '女');

        // 渲染总分统计
        this.renderTotalScoreAnalysis(maleStudents, femaleStudents, classId);

        // 渲染男生项目统计
        if (maleStudents.length > 0) {
            document.getElementById('male-analysis-section').style.display = 'block';
            this.renderProjectAnalysis('male', maleStudents, classId);
        } else {
            document.getElementById('male-analysis-section').style.display = 'none';
        }

        // 渲染女生项目统计
        if (femaleStudents.length > 0) {
            document.getElementById('female-analysis-section').style.display = 'block';
            this.renderProjectAnalysis('female', femaleStudents, classId);
        } else {
            document.getElementById('female-analysis-section').style.display = 'none';
        }

        // 渲染图表
        this.renderAnalysisChart(maleStudents, femaleStudents, classId);

        // 渲染满分率统计
        this.renderFullScoreRate(maleStudents, femaleStudents, classId);
    },

    // 渲染满分率统计
    renderFullScoreRate(maleStudents, femaleStudents, classId) {
        const allStudents = [...maleStudents, ...femaleStudents];
        const totalStudents = allStudents.length;  // 班级总人数
        let fullScoreCount = 0;  // 总分>=80的人数

        allStudents.forEach(student => {
            const result = this.calculateTotalScore(student);
            if (result.total >= 80) {
                fullScoreCount++;
            }
        });

        const rateValue = document.getElementById('full-rate-value');
        const fullCount = document.getElementById('full-count');
        const totalCount = document.getElementById('total-count');

        if (totalStudents > 0) {
            const rate = (fullScoreCount / totalStudents * 100).toFixed(1);
            rateValue.textContent = rate + '%';
            fullCount.textContent = fullScoreCount;
            totalCount.textContent = totalStudents;
        } else {
            rateValue.textContent = '--';
            fullCount.textContent = '0';
            totalCount.textContent = '0';
        }
    },

    // 渲染总分统计分析
    renderTotalScoreAnalysis(maleStudents, femaleStudents, classId) {
        const tbody = document.querySelector('#total-score-table tbody');
        let html = '';

        // 统计男生
        if (maleStudents.length > 0) {
            html += this.generateTotalScoreRow('男生', maleStudents, classId);
        }

        // 统计女生
        if (femaleStudents.length > 0) {
            html += this.generateTotalScoreRow('女生', femaleStudents, classId);
        }

        // 统计合计
        const allStudents = [...maleStudents, ...femaleStudents];
        html += this.generateTotalScoreRow('合计', allStudents, classId, true);

        tbody.innerHTML = html;
    },

    generateTotalScoreRow(label, students, classId, isTotal = false) {
        const stats = {
            fail: 0,      // <60
            pass: 0,      // 60-79
            good: 0,      // 80-89
            excellent: 0  // 90-100
        };
        let totalScore = 0;
        let validCount = 0;

        students.forEach(student => {
            const result = this.calculateTotalScore(student);
            if (result.total > 0) {
                totalScore += result.total;
                validCount++;

                if (result.total < 60) stats.fail++;
                else if (result.total < 80) stats.pass++;
                else if (result.total < 90) stats.good++;
                else stats.excellent++;
            }
        });

        const total = validCount;
        const avg = validCount > 0 ? (totalScore / validCount).toFixed(1) : '-';

        return `
            <tr ${isTotal ? 'style="font-weight: bold; background: #f5f5f5;"' : ''}>
                <td>${label}</td>
                <td>${stats.fail}</td>
                <td>${total > 0 ? (stats.fail / total * 100).toFixed(1) + '%' : '-'}</td>
                <td>${stats.pass}</td>
                <td>${total > 0 ? (stats.pass / total * 100).toFixed(1) + '%' : '-'}</td>
                <td>${stats.good}</td>
                <td>${total > 0 ? (stats.good / total * 100).toFixed(1) + '%' : '-'}</td>
                <td>${stats.excellent}</td>
                <td>${total > 0 ? (stats.excellent / total * 100).toFixed(1) + '%' : '-'}</td>
                <td>${avg}</td>
                <td>${validCount}</td>
            </tr>
        `;
    },

    // 渲染项目统计分析
    renderProjectAnalysis(gender, students, classId) {
        const tableId = gender === 'male' ? 'male-project-table' : 'female-project-table';
        const tbody = document.querySelector(`#${tableId} tbody`);

        const projects = gender === 'male'
            ? ['run50m', 'longJump', 'sitReach', 'pullUp', 'run1000m']
            : ['run50m', 'longJump', 'sitReach', 'sitUp', 'run800m'];

        // 统计各项目各分数段人数
        const ranges = [
            { label: '优秀(90-100)', min: 90, max: 100, class: 'score-range-excellent' },
            { label: '良好(80-89)', min: 80, max: 89, class: 'score-range-good' },
            { label: '及格(60-79)', min: 60, max: 79, class: 'score-range-pass' },
            { label: '不及格(<60)', min: 0, max: 59, class: 'score-range-fail' }
        ];

        let html = '';

        ranges.forEach(range => {
            // 第一列是分数段（带颜色），对角线表头已经包含了项目和分数段的标识
            let row = `<tr><td class="${range.class}">${range.label}</td>`;

            projects.forEach(project => {
                let count = 0;
                let total = 0;

                students.forEach(student => {
                    const scores = this.getStudentScores(classId, student.id);
                    const value = scores[project];
                    if (value) {
                        total++;
                        let numValue;
                        if (project.includes('run') && project !== 'run50m') {
                            numValue = Standards.timeToSeconds(value);
                        } else {
                            numValue = parseFloat(value);
                        }

                        if (!isNaN(numValue)) {
                            const result = Standards.calculateScore(student.gender, project, numValue);
                            if (result.score >= range.min && result.score <= range.max) {
                                count++;
                            }
                        }
                    }
                });

                const rate = total > 0 ? (count / total * 100).toFixed(1) + '%' : '-';
                row += `<td>${count}</td><td>${total}</td><td>${rate}</td>`;
            });

            row += '</tr>';
            html += row;
        });

        tbody.innerHTML = html;
    },

    // 渲染分析图表
    renderAnalysisChart(maleStudents, femaleStudents, classId) {
        const canvas = document.getElementById('scoreDistributionChart');

        // 准备数据
        const labels = ['不及格(<60)', '及格(60-79)', '良好(80-89)', '优秀(90-100)'];
        const maleData = [0, 0, 0, 0];
        const femaleData = [0, 0, 0, 0];

        // 统计男生
        maleStudents.forEach(student => {
            const result = this.calculateTotalScore(student);
            if (result.total > 0) {
                if (result.total < 60) maleData[0]++;
                else if (result.total < 80) maleData[1]++;
                else if (result.total < 90) maleData[2]++;
                else maleData[3]++;
            }
        });

        // 统计女生
        femaleStudents.forEach(student => {
            const result = this.calculateTotalScore(student);
            if (result.total > 0) {
                if (result.total < 60) femaleData[0]++;
                else if (result.total < 80) femaleData[1]++;
                else if (result.total < 90) femaleData[2]++;
                else femaleData[3]++;
            }
        });

        // 销毁旧图表
        if (this.data.analysisChart) {
            this.data.analysisChart.destroy();
        }

        // 创建堆叠柱状图
        this.data.analysisChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '男生',
                        data: maleData,
                        backgroundColor: 'rgba(33, 150, 243, 0.7)',
                        borderColor: 'rgba(33, 150, 243, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '女生',
                        data: femaleData,
                        backgroundColor: 'rgba(233, 30, 99, 0.7)',
                        borderColor: 'rgba(233, 30, 99, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '总分等级分布'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
};

// 全局函数供HTML调用
function showCreateClassModal() { App.showCreateClassModal(); }
function createClass() { App.createClass(); }
function showEditClassModal(classId) { App.showEditClassModal(classId); }
function updateClass() { App.updateClass(); }
function deleteClass(classId) { App.deleteClass(classId); }
function showAddStudentModal() { App.showAddStudentModal(); }
function addStudent() { App.addStudent(); }
function showImportModal() { App.showImportModal(); }
function importStudents() { App.importStudents(); }
function showEditStudentModal(studentId) { App.showEditStudentModal(studentId); }
function updateStudent() { App.updateStudent(); }
function deleteStudent(studentId) { App.deleteStudent(studentId); }
function closeModal(modalId) { App.closeModal(modalId); }
function saveScore(studentId, project, value) { App.saveScore(studentId, project, value); }
function calculateBMI(studentId) { App.calculateBMI(studentId); }
function updateProjectScore(input, gender, project, studentId) { App.updateProjectScore(input, gender, project, studentId); }
function exportToExcel() { App.exportToExcel(); }
function showStudentCompareModal() { App.showStudentCompareModal(); }
function toggleCompareStudent(studentId) { App.toggleCompareStudent(studentId); }
function confirmCompare() { App.confirmCompare(); }
function showClearScoresModal() { App.showClearScoresModal(); }
function onClearScopeChange() { App.onClearScopeChange(); }
function confirmClearScores() { App.confirmClearScores(); }
function renderAnalysis() { App.renderAnalysis(); }

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
