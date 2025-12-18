// 全局变量
let currentView = 'panorama';
let currentPriority = 'stability';
let currentMode = 'auto';
let currentTemp = 22;
let currentLevel = 5;
let chart = null;
let updateInterval = null;

// 模拟数据
const mockData = {
    areas: [
        {
            id: 1,
            name: '商业中心A',
            type: 'commercial',
            icon: 'fas fa-shopping-cart',
            status: '正常',
            capacity: '45 MW',
            loadRate: '78%',
            position: { top: '20%', left: '30%' }
        },
        {
            id: 2,
            name: '住宅小区B',
            type: 'residential',
            icon: 'fas fa-home',
            status: '正常',
            capacity: '32 MW',
            loadRate: '65%',
            position: { top: '40%', left: '60%' }
        },
        {
            id: 3,
            name: '工业园区C',
            type: 'industrial',
            icon: 'fas fa-industry',
            status: '高负荷',
            capacity: '68 MW',
            loadRate: '92%',
            position: { top: '70%', left: '20%' }
        },
        {
            id: 4,
            name: '写字楼D',
            type: 'commercial',
            icon: 'fas fa-building',
            status: '正常',
            capacity: '28 MW',
            loadRate: '71%',
            position: { top: '30%', left: '70%' }
        },
        {
            id: 5,
            name: '住宅区E',
            type: 'residential',
            icon: 'fas fa-city',
            status: '正常',
            capacity: '35 MW',
            loadRate: '58%',
            position: { top: '60%', left: '45%' }
        }
    ],
    faults: [
        {
            id: 1,
            location: '商业中心A',
            temp: 38,
            type: 'high',
            description: '变压器过热'
        },
        {
            id: 2,
            location: '工业园区C',
            temp: 35,
            type: 'medium',
            description: '线路负载过高'
        },
        {
            id: 3,
            location: '住宅小区B',
            temp: 32,
            type: 'low',
            description: '设备老化'
        }
    ],
    recoveryPlans: [
        {
            id: 1,
            title: '快速恢复方案',
            temp: '适配35°C',
            steps: [
                '启动备用冷却系统',
                '降低非关键设备功率',
                '优化负载分配',
                '监控温度变化'
            ]
        },
        {
            id: 2,
            title: '经济恢复方案',
            temp: '适配32°C',
            steps: [
                '调整运行时段',
                '启用储能系统',
                '实施错峰用电',
                '成本控制优化'
            ]
        },
        {
            id: 3,
            title: '标准恢复方案',
            temp: '适配38°C',
            steps: [
                '检查设备状态',
                '执行标准程序',
                '记录处理过程',
                '验证恢复效果'
            ]
        }
    ]
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMap();
    initializePrioritySystem();
    initializeTemperatureControl();
    initializePriorityIndicator();
    initializeChart();
    initializeFaultList();
    initializeRecoveryPlans();
    startDataUpdate();
    showNotification('系统初始化完成', 'success');
});

// 导航功能
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // 平滑滚动
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // 更新活跃链接
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 移动端关闭菜单
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // 滚动时更新导航
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 移动端菜单切换
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// 地图初始化
function initializeMap() {
    const mapContainer = document.getElementById('interactiveMap');
    const viewButtons = document.querySelectorAll('.view-btn');

    // 创建地图区域
    function createMapAreas() {
        mapContainer.innerHTML = '';
        mockData.areas.forEach(area => {
            const areaElement = document.createElement('div');
            areaElement.className = `map-area ${area.type}`;
            areaElement.style.top = area.position.top;
            areaElement.style.left = area.position.left;
            areaElement.innerHTML = `
                <div class="area-icon">
                    <i class="${area.icon}"></i>
                </div>
                <div class="area-name">${area.name}</div>
                <div class="area-status">状态: ${area.status}</div>
                <div class="area-capacity">容量: ${area.capacity}</div>
                <div class="area-load">负载率: ${area.loadRate}</div>
            `;
            
            areaElement.addEventListener('click', function() {
                showAreaDetails(area);
            });
            
            mapContainer.appendChild(areaElement);
        });
    }

    // 视图切换
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            filterMapAreas(currentView);
        });
    });

    // 过滤地图区域
    function filterMapAreas(view) {
        const areas = document.querySelectorAll('.map-area');
        areas.forEach(area => {
            if (view === 'panorama') {
                area.style.display = 'block';
            } else {
                const areaType = area.classList[1];
                if (view === 'commercial' && areaType === 'commercial' ||
                    view === 'residential' && areaType === 'residential' ||
                    view === 'industrial' && areaType === 'industrial') {
                    area.style.display = 'block';
                } else {
                    area.style.display = 'none';
                }
            }
        });
    }

    createMapAreas();
}

// 显示区域详情
function showAreaDetails(area) {
    showNotification(`查看 ${area.name} 详情`, 'info');
    // 这里可以添加更多详情展示逻辑
}

// 优先级系统
function initializePrioritySystem() {
    const priorityCards = document.querySelectorAll('.priority-card');
    
    priorityCards.forEach(card => {
        card.addEventListener('click', function() {
            priorityCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentPriority = this.dataset.priority;
            showNotification(`已选择${this.querySelector('h4').textContent}模式`, 'success');
        });
    });
}

// 温度控制
function initializeTemperatureControl() {
    const tempSlider = document.getElementById('tempSlider');
    const modeButtons = document.querySelectorAll('.mode-btn');

    // 温度滑块
    tempSlider.addEventListener('input', function() {
        currentTemp = parseInt(this.value);
        document.getElementById('currentTemp').textContent = currentTemp;
    });

    // 模式选择
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.dataset.mode;
            updateTemperatureMode(currentMode);
        });
    });
}

// 调整温度
function adjustTemp(delta) {
    const tempSlider = document.getElementById('tempSlider');
    const newTemp = parseInt(tempSlider.value) + delta;
    
    if (newTemp >= 16 && newTemp <= 30) {
        tempSlider.value = newTemp;
        currentTemp = newTemp;
        document.getElementById('currentTemp').textContent = currentTemp;
        showNotification(`温度已调整至 ${currentTemp}°C`, 'info');
    }
}

// 更新温度模式
function updateTemperatureMode(mode) {
    const modeSettings = {
        auto: { temp: 22, efficiency: 85 },
        eco: { temp: 26, efficiency: 95 },
        comfort: { temp: 20, efficiency: 75 }
    };
    
    const settings = modeSettings[mode];
    const tempSlider = document.getElementById('tempSlider');
    tempSlider.value = settings.temp;
    currentTemp = settings.temp;
    document.getElementById('currentTemp').textContent = currentTemp;
    
    showNotification(`已切换到${mode === 'auto' ? '自动' : mode === 'eco' ? '节能' : '舒适'}模式`, 'success');
}

// 优先级指示器
function initializePriorityIndicator() {
    const levels = document.querySelectorAll('.level');
    
    levels.forEach(level => {
        level.addEventListener('click', function() {
            levels.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentLevel = parseInt(this.dataset.level);
            showNotification(`优先级已设置为 ${currentLevel} 级`, 'info');
        });
    });
}

// 图表初始化
function initializeChart()