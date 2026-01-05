// 神机妙算安卓APP - 主逻辑
(function() {
    'use strict';
    
    // 应用状态
    const AppState = {
        currentScreen: 'home',
        difficulty: 'medium',
        practiceMode: 'normal',
        isRecording: false,
        testData: {
            questions: [],
            currentQuestion: 0,
            score: 0,
            startTime: null,
            timer: null,
            answers: []
        },
        userStats: {
            totalQuestions: 0,
            totalCorrect: 0,
            totalTime: 0,
            streakDays: 0,
            lastPractice: null,
            achievements: []
        },
        settings: {
            voiceFeedback: true,
            soundEffects: true,
            studentName: '学生',
            dailyGoal: 10,
            theme: 'light',
            primaryColor: '#4b6cb7'
        }
    };
    
    // 中文数字转换
    const ChineseNumbers = {
        '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
        '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
        '十': 10, '十一': 11, '十二': 12, '十三': 13, '十四': 14,
        '十五': 15, '十六': 16, '十七': 17, '十八': 18, '十九': 19,
        '二十': 20, '二十一': 21, '二十二': 22, '二十三': 23, '二十四': 24,
        '二十五': 25, '二十六': 26, '二十七': 27, '二十八': 28, '二十九': 29,
        '三十': 30, '三十一': 31, '三十二': 32, '三十三': 33, '三十四': 34,
        '三十五': 35, '三十六': 36, '三十七': 37, '三十八': 38, '三十九': 39,
        '四十': 40, '四十一': 41, '四十二': 42, '四十三': 43, '四十四': 44,
        '四十五': 45, '四十六': 46, '四十七': 47, '四十八': 48, '四十九': 49,
        '五十': 50, '五十一': 51, '五十二': 52, '五十三': 53, '五十四': 54,
        '五十五': 55, '五十六': 56, '五十七': 57, '五十八': 58, '五十九': 59,
        '六十': 60, '六十一': 61, '六十二': 62, '六十三': 63, '六十四': 64,
        '六十五': 65, '六十六': 66, '六十七': 67, '六十八': 68, '六十九': 69,
        '七十': 70, '七十一': 71, '七十二': 72, '七十三': 73, '七十四': 74,
        '七十五': 75, '七十六': 76, '七十七': 77, '七十八': 78, '七十九': 79,
        '八十': 80, '八十一': 81, '八十二': 82, '八十三': 83, '八十四': 84,
        '八十五': 85, '八十六': 86, '八十七': 87, '八十八': 88, '八十九': 89,
        '九十': 90, '九十一': 91, '九十二': 92, '九十三': 93, '九十四': 94,
        '九十五': 95, '九十六': 96, '九十七': 97, '九十八': 98, '九十九': 99
    };
    
    // 乘法口诀表
    const MultiplicationTable = [
        ['一一', 1], ['一二', 2], ['一三', 3], ['一四', 4], ['一五', 5], ['一六', 6], ['一七', 7], ['一八', 8], ['一九', 9],
        ['二一', 2], ['二二', 4], ['二三', 6], ['二四', 8], ['二五', 10], ['二六', 12], ['二七', 14], ['二八', 16], ['二九', 18],
        ['三一', 3], ['三二', 6], ['三三', 9], ['三四', 12], ['三五', 15], ['三六', 18], ['三七', 21], ['三八', 24], ['三九', 27],
        ['四一', 4], ['四二', 8], ['四三', 12], ['四四', 16], ['四五', 20], ['四六', 24], ['四七', 28], ['四八', 32], ['四九', 36],
        ['五一', 5], ['五二', 10], ['五三', 15], ['五四', 20], ['五五', 25], ['五六', 30], ['五七', 35], ['五八', 40], ['五九', 45],
        ['六一', 6], ['六二', 12], ['六三', 18], ['六四', 24], ['六五', 30], ['六六', 36], ['六七', 42], ['六八', 48], ['六九', 54],
        ['七一', 7], ['七二', 14], ['七三', 21], ['七四', 28], ['七五', 35], ['七六', 42], ['七七', 49], ['七八', 56], ['七九', 63],
        ['八一', 8], ['八二', 16], ['八三', 24], ['八四', 32], ['八五', 40], ['八六', 48], ['八七', 56], ['八八', 64], ['八九', 72],
        ['九一', 9], ['九二', 18], ['九三', 27], ['九四', 36], ['九五', 45], ['九六', 54], ['九七', 63], ['九八', 72], ['九九', 81]
    ];
    
    // 语音识别对象
    let speechRecognition = null;
    
    // 初始化应用
    function initApp() {
        console.log('初始化神机妙算APP...');
        
        // 隐藏加载界面，显示主应用
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        
        // 加载保存的数据
        loadSavedData();
        
        // 初始化语音识别
        initSpeechRecognition();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 更新UI
        updateUI();
        
        // 检查网络状态
        checkNetworkStatus();
        
        // 检查是否今天第一次使用
        checkDailyFirstUse();
        
        console.log('应用初始化完成');
    }
    
    // 加载保存的数据
    function loadSavedData() {
        try {
            // 加载用户统计
            const savedStats = localStorage.getItem('shenji_user_stats');
            if (savedStats) {
                AppState.userStats = JSON.parse(savedStats);
            }
            
            // 加载设置
            const savedSettings = localStorage.getItem('shenji_settings');
            if (savedSettings) {
                const loadedSettings = JSON.parse(savedSettings);
                AppState.settings = { ...AppState.settings, ...loadedSettings };
            }
            
            // 应用主题
            applyTheme();
            
            console.log('数据加载成功');
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    }
    
    // 保存数据
    function saveData() {
        try {
            localStorage.setItem('shenji_user_stats', JSON.stringify(AppState.userStats));
            localStorage.setItem('shenji_settings', JSON.stringify(AppState.settings));
            console.log('数据保存成功');
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }
    
    // 应用主题
    function applyTheme() {
        const { theme, primaryColor } = AppState.settings;
        
        // 设置主题
        document.documentElement.setAttribute('data-theme', theme);
        
        // 设置主颜色
        if (primaryColor) {
            document.documentElement.style.setProperty('--primary-color', primaryColor);
            
            // 生成渐变色
            const secondaryColor = lightenColor(primaryColor, 30);
            document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        }
    }
    
    // 颜色工具函数
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
    
    // 初始化语音识别
    function initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            speechRecognition = new SpeechRecognition();
            speechRecognition.lang = 'zh-CN';
            speechRecognition.continuous = false;
            speechRecognition.interimResults = false;
            speechRecognition.maxAlternatives = 1;
            
            speechRecognition.onstart = function() {
                console.log('语音识别开始');
                showVoiceIndicator(true);
                updateVoiceStatus('正在聆听...');
            };
            
            speechRecognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                console.log('识别结果:', transcript);
                
                // 处理答案
                processAnswer(transcript);
                
                // 更新UI
                updateRecognitionDisplay(transcript);
                showVoiceIndicator(false);
                updateVoiceStatus('识别完成');
            };
            
            speechRecognition.onerror = function(event) {
                console.error('语音识别错误:', event.error);
                showVoiceIndicator(false);
                
                if (event.error === 'not-allowed') {
                    showAlert('麦克风权限被拒绝', '请在浏览器设置中允许使用麦克风');
                    updateVoiceStatus('麦克风权限不足');
                } else {
                    updateVoiceStatus('识别出错，请重试');
                }
            };
            
            speechRecognition.onend = function() {
                console.log('语音识别结束');
                AppState.isRecording = false;
                showVoiceIndicator(false);
            };
            
            console.log('语音识别初始化成功');
        } else {
            console.warn('浏览器不支持语音识别');
            showAlert('语音识别不支持', '您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器');
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 菜单切换
        document.getElementById('menuToggle').addEventListener('click', toggleSideMenu);
        document.getElementById('closeMenu').addEventListener('click', toggleSideMenu);
        
        // 侧边菜单项
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const screen = this.getAttribute('data-screen');
                switchScreen(screen);
                toggleSideMenu();
            });
        });
        
        // 底部导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const screen = this.getAttribute('data-screen');
                switchScreen(screen);
                
                // 更新导航状态
                updateNavigation(screen);
            });
        });
        
        // 首页快速操作
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleQuickAction(action);
            });
        });
        
        // 练习模式选择
        document.querySelectorAll('.mode-start-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const mode = this.getAttribute('data-mode');
                startPractice(mode);
            });
        });
        
        // 难度选择
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', function() {
                const difficulty = this.getAttribute('data-difficulty');
                selectDifficulty(difficulty);
            });
        });
        
        // 语音控制按钮
        document.getElementById('startRecording').addEventListener('click', startRecording);
        document.getElementById('skipQuestion').addEventListener('click', skipQuestion);
        document.getElementById('endTest').addEventListener('click', endTest);
        
        // 结果页面按钮
        document.getElementById('reviewAnswers').addEventListener('click', reviewAnswers);
        document.getElementById('nextPractice').addEventListener('click', nextPractice);
        document.getElementById('backToHome').addEventListener('click', () => switchScreen('home'));
        
        // 设置页面
        document.getElementById('studentName').addEventListener('change', updateStudentName);
        document.getElementById('dailyGoal').addEventListener('change', updateDailyGoal);
        document.getElementById('voiceFeedback').addEventListener('change', toggleVoiceFeedback);
        document.getElementById('soundEffects').addEventListener('change', toggleSoundEffects);
        document.getElementById('darkMode').addEventListener('change', toggleDarkMode);
        
        // 主题颜色选择
        document.querySelectorAll('.theme-color').forEach(color => {
            color.addEventListener('click', function() {
                const newColor = this.getAttribute('data-color');
                changeThemeColor(newColor);
            });
        });
        
        // 数据管理
        document.getElementById('exportData').addEventListener('click', exportData);
        document.getElementById('clearData').addEventListener('click', clearData);
        
        // 全屏切换
        document.getElementById('fullscreenToggle').addEventListener('click', toggleFullscreen);
        
        // 网络状态监听
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        
        // 防止页面滚动
        document.addEventListener('touchmove', function(e) {
            if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // 切换屏幕
    function switchScreen(screenName) {
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 显示目标屏幕
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
            AppState.currentScreen = screenName;
            
            // 屏幕特定初始化
            switch(screenName) {
                case 'home':
                    updateHomeScreen();
                    break;
                case 'practice':
                    updatePracticeScreen();
                    break;
                case 'test':
                    updateTestScreen();
                    break;
                case 'history':
                    loadHistory();
                    break;
                case 'settings':
                    updateSettingsScreen();
                    break;
            }
        }
        
        console.log('切换到屏幕:', screenName);
    }
    
    // 更新导航状态
    function updateNavigation(activeScreen) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-screen') === activeScreen) {
                item.classList.add('active');
            }
        });
    }
    
    // 切换侧边菜单
    function toggleSideMenu() {
        const sideMenu = document.getElementById('sideMenu');
        sideMenu.classList.toggle('active');
    }
    
    // 更新首页
    function updateHomeScreen() {
        // 更新统计信息
        const totalQuestions = AppState.userStats.totalQuestions || 0;
        const totalCorrect = AppState.userStats.totalCorrect || 0;
        const totalAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        const totalTime = AppState.userStats.totalTime || 0;
        const streakDays = AppState.userStats.streakDays || 0;
        
        document.getElementById('totalAccuracy').textContent = totalAccuracy + '%';
        document.getElementById('totalTime').textContent = Math.floor(totalTime / 60) + '分钟';
        document.getElementById('currentStreak').textContent = streakDays + '天';
        document.getElementById('todayPoints').textContent = (totalCorrect * 10) || 0;
        document.getElementById('streakDays').textContent = streakDays;
        
        // 更新目标进度
        const dailyGoal = AppState.settings.dailyGoal || 10;
        const todayCompleted = AppState.userStats.todayCompleted || 0;
        const goalProgress = Math.min((todayCompleted / dailyGoal) * 100, 100);
        
        document.getElementById('goalProgress').style.width = goalProgress + '%';
        document.getElementById('goalText').textContent = todayCompleted + '/' + dailyGoal + '题';
    }
    
    // 处理快速操作
    function handleQuickAction(action) {
        switch(action) {
            case 'practice':
                switchScreen('practice');
                break;
            case 'challenge':
                AppState.practiceMode = 'challenge';
                startPractice('challenge');
                break;
            case 'review':
                // 显示错题复习
                showAlert('功能开发中', '错题复习功能正在开发中...');
                break;
        }
    }
    
    // 开始练习
    function startPractice(mode) {
        AppState.practiceMode = mode;
        
        // 根据模式设置题目数量
        let questionCount = 9;
        if (mode === 'exam') questionCount = 20;
        if (mode === 'challenge') questionCount = 15;
        
        // 生成题目
        generateQuestions(questionCount);
        
        // 重置测试数据
        AppState.testData = {
            questions: AppState.testData.questions,
            currentQuestion: 0,
            score: 0,
            startTime: Date.now(),
            timer: null,
            answers: []
        };
        
        // 启动计时器
        startTestTimer();
        
        // 切换到测试屏幕
        switchScreen('test');
        
        // 更新UI
        updateTestScreen();
        
        // 播放开始音效
        playSound('correct');
    }
    
    // 生成题目
    function generateQuestions(count) {
        const questions = [];
        const difficulty = AppState.difficulty;
        
        // 根据难度确定数字范围
        let maxNum = 9;
        if (difficulty === 'easy') maxNum = 6;
        if (difficulty === 'hard') maxNum = 12;
        
        // 题目类型分布
        const typeCounts = {
            '口诀填空': Math.floor(count * 0.4),
            '乘法计算': Math.floor(count * 0.3),
            '除法计算': Math.floor(count * 0.3)
        };
        
        // 生成口诀填空
        for (let i = 0; i < typeCounts['口诀填空']; i++) {
            let suitableItems = MultiplicationTable;
            
            // 根据难度筛选
            if (difficulty === 'easy') {
                suitableItems = MultiplicationTable.filter(item => item[1] <= 36);
            }
            
            const randomItem = suitableItems[Math.floor(Math.random() * suitableItems.length)];
            const [text, answer] = randomItem;
            
            questions.push({
                type: '口诀填空',
                text: `${text.slice(0, 1)}${text.slice(1, 2)}（  ）`,
                answer: answer,
                userAnswer: null,
                isCorrect: null
            });
        }
        
        // 生成乘法计算
        for (let i = 0; i < typeCounts['乘法计算']; i++) {
            const a = Math.floor(Math.random() * (maxNum - 1)) + 1;
            const b = Math.floor(Math.random() * (maxNum - 1)) + 1;
            
            questions.push({
                type: '乘法计算',
                text: `${a}×${b}＝`,
                answer: a * b,
                userAnswer: null,
                isCorrect: null
            });
        }
        
        // 生成除法计算
        for (let i = 0; i < typeCounts['除法计算']; i++) {
            const divisor = Math.floor(Math.random() * (maxNum - 1)) + 1;
            const quotient = Math.floor(Math.random() * (maxNum - 1)) + 1;
            const dividend = divisor * quotient;
            
            questions.push({
                type: '除法计算',
                text: `${dividend}÷${divisor}＝`,
                answer: quotient,
                userAnswer: null,
                isCorrect: null
            });
        }
        
        // 打乱顺序
        shuffleArray(questions);
        AppState.testData.questions = questions;
    }
    
    // 更新测试屏幕
    function updateTestScreen() {
        const testData = AppState.testData;
        const currentQuestion = testData.questions[testData.currentQuestion];
        
        if (!currentQuestion) return;
        
        // 更新题目显示
        document.getElementById('questionDisplay').textContent = currentQuestion.text;
        document.getElementById('currentQuestionNum').textContent = testData.currentQuestion + 1;
        document.getElementById('totalQuestions').textContent = testData.questions.length;
        document.getElementById('testScore').textContent = testData.score;
        document.getElementById('currentMode').textContent = 
            AppState.practiceMode === 'normal' ? '普通练习' : 
            AppState.practiceMode === 'challenge' ? '挑战模式' : '模拟考试';
        
        // 更新进度条
        const progress = ((testData.currentQuestion + 1) / testData.questions.length) * 100;
        document.getElementById('questionProgress').style.width = progress + '%';
        
        // 重置反馈显示
        document.getElementById('feedbackCorrect').style.display = 'none';
        document.getElementById('feedbackIncorrect').style.display = 'none';
        document.getElementById('recognitionDisplay').textContent = '准备识别语音...';
        document.getElementById('voiceStatus').querySelector('.status-text').textContent = '点击按钮开始答题';
        
        // 更新导航
        updateNavigation('test');
    }
    
    // 启动测试计时器
    function startTestTimer() {
        if (AppState.testData.timer) {
            clearInterval(AppState.testData.timer);
        }
        
        AppState.testData.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - AppState.testData.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('testTimer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    // 开始录音
    function startRecording() {
        if (!speechRecognition) {
            showAlert('语音识别不可用', '请检查浏览器是否支持语音识别');
            return;
        }
        
        if (AppState.isRecording) {
            stopRecording();
            return;
        }
        
        try {
            AppState.isRecording = true;
            speechRecognition.start();
        } catch (error) {
            console.error('启动录音失败:', error);
            AppState.isRecording = false;
            showAlert('录音失败', '无法启动录音，请重试');
        }
    }
    
    // 停止录音
    function stopRecording() {
        if (speechRecognition && AppState.isRecording) {
            speechRecognition.stop();
        }
    }
    
    // 显示语音指示器
    function showVoiceIndicator(show) {
        const indicator = document.getElementById('voiceIndicator');
        if (show) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }
    
    // 更新语音状态
    function updateVoiceStatus(text) {
        const statusElement = document.getElementById('voiceStatus').querySelector('.status-text');
        if (statusElement) {
            statusElement.textContent = text;
        }
    }
    
    // 更新识别显示
    function updateRecognitionDisplay(text) {
        document.getElementById('recognitionDisplay').textContent = `你说的是: "${text}"`;
    }
    
    // 处理答案
    function processAnswer(answerText) {
        const testData = AppState.testData;
        const currentIndex = testData.currentQuestion;
        const currentQuestion = testData.questions[currentIndex];
        
        if (!currentQuestion) return;
        
        // 解析答案
        const userAnswer = parseChineseNumber(answerText);
        
        if (userAnswer === null) {
            showFeedback(false, currentQuestion.answer);
            speakText('无法识别，请重试');
            return;
        }
        
        // 记录答案
        currentQuestion.userAnswer = userAnswer;
        currentQuestion.isCorrect = userAnswer === currentQuestion.answer;
        
        // 更新得分
        if (currentQuestion.isCorrect) {
            testData.score++;
            showFeedback(true);
            playSound('correct');
            
            // 语音反馈
            if (AppState.settings.voiceFeedback) {
                const praises = ['太棒了！', '回答正确！', '真聪明！', '好厉害！'];
                const randomPraise = praises[Math.floor(Math.random() * praises.length)];
                speakText(randomPraise);
            }
            
            // 更新统计
            AppState.userStats.totalQuestions = (AppState.userStats.totalQuestions || 0) + 1;
            AppState.userStats.totalCorrect = (AppState.userStats.totalCorrect || 0) + 1;
            AppState.userStats.todayCompleted = (AppState.userStats.todayCompleted || 0) + 1;
        } else {
            showFeedback(false, currentQuestion.answer);
            playSound('incorrect');
            
            if (AppState.settings.voiceFeedback) {
                speakText('不对哦，再想想');
            }
            
            // 更新统计
            AppState.userStats.totalQuestions = (AppState.userStats.totalQuestions || 0) + 1;
            AppState.userStats.todayCompleted = (AppState.userStats.todayCompleted || 0) + 1;
        }
        
        // 保存统计数据
        saveData();
        
        // 自动进入下一题（延迟1.5秒）
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    }
    
    // 解析中文数字
    function parseChineseNumber(text) {
        // 清理文本
        const cleanText = text.replace(/\s+/g, '').replace(/[，。！？]/g, '');
        
        // 直接数字
        const numberMatch = cleanText.match(/\d+/);
        if (numberMatch) {
            return parseInt(numberMatch[0], 10);
        }
        
        // 中文数字
        if (ChineseNumbers[cleanText] !== undefined) {
            return ChineseNumbers[cleanText];
        }
        
        // 处理"几十几"格式
        if (cleanText.includes('十')) {
            const parts = cleanText.split('十');
            if (parts.length === 2) {
                const tens = ChineseNumbers[parts[0]] || 0;
                const ones = ChineseNumbers[parts[1]] || 0;
                return (tens > 0 ? tens : 1) * 10 + ones;
            }
        }
        
        return null;
    }
    
    // 显示反馈
    function showFeedback(isCorrect, correctAnswer = null) {
        if (isCorrect) {
            document.getElementById('feedbackCorrect').style.display = 'flex';
            document.getElementById('feedbackIncorrect').style.display = 'none';
        } else {
            document.getElementById('feedbackCorrect').style.display = 'none';
            document.getElementById('feedbackIncorrect').style.display = 'flex';
            if (correctAnswer !== null) {
                document.getElementById('correctAnswerDisplay').textContent = correctAnswer;
            }
        }
    }
    
    // 下一题
    function nextQuestion() {
        const testData = AppState.testData;
        
        if (testData.currentQuestion < testData.questions.length - 1) {
            testData.currentQuestion++;
            updateTestScreen();
        } else {
            // 所有题目完成
            finishTest();
        }
    }
    
    // 跳过题目
    function skipQuestion() {
        const testData = AppState.testData;
        
        if (testData.currentQuestion < testData.questions.length - 1) {
            // 记录跳过
            const currentQuestion = testData.questions[testData.currentQuestion];
            currentQuestion.userAnswer = null;
            currentQuestion.isCorrect = false;
            
            testData.currentQuestion++;
            updateTestScreen();
            speakText('题目已跳过');
        } else {
            finishTest();
        }
    }
    
    // 结束测试
    function endTest() {
        if (confirm('确定要结束测试吗？未完成的题目将不计分。')) {
            finishTest();
        }
    }
    
    // 完成测试
    function finishTest() {
        // 停止计时器
        if (AppState.testData.timer) {
            clearInterval(AppState.testData.timer);
        }
        
        // 停止录音
        stopRecording();
        
        // 计算用时
        const elapsedTime = Math.floor((Date.now() - AppState.testData.startTime) / 1000);
        AppState.userStats.totalTime = (AppState.userStats.totalTime || 0) + elapsedTime;
        
        // 保存数据
        saveData();
        
        // 显示结果
        showResults();
        
        // 切换到结果屏幕
        switchScreen('result');
    }
    
    // 显示结果
    function showResults() {
        const testData = AppState.testData;
        const totalQuestions = testData.questions.length;
        const score = testData.score;
        const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
        const elapsedTime = Math.floor((Date.now() - testData.startTime) / 1000);
        const speed = elapsedTime > 0 ? Math.round((totalQuestions / elapsedTime) * 60) : 0;
        
        // 更新显示
        document.getElementById('finalScoreDisplay').textContent = score;
        document.getElementById('totalScoreDisplay').textContent = totalQuestions;
        document.getElementById('accuracyRate').textContent = accuracy + '%';
        
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        document.getElementById('timeUsed').textContent = `${minutes}:${seconds}`;
        document.getElementById('speedRate').textContent = speed + '题/分';
        
        // 评价
        let evaluation = '';
        if (accuracy === 100) {
            evaluation = '太厉害了！全部答对！你是数学小天才！';
        } else if (accuracy >= 80) {
            evaluation = '真不错！继续努力！';
        } else if (accuracy >= 60) {
            evaluation = '还不错，继续加油！';
        } else {
            evaluation = '要多多练习哦，下次会更好！';
        }
        document.getElementById('evaluationText').textContent = evaluation;
        
        // 语音播报结果
        if (AppState.settings.voiceFeedback) {
            setTimeout(() => {
                speakText(`测试完成，你的得分是${score}分，正确率${accuracy}%。${evaluation}`);
            }, 500);
        }
        
        // 检查成就
        checkAchievements(score, accuracy);
    }
    
    // 检查成就
    function checkAchievements(score, accuracy) {
        const achievements = AppState.userStats.achievements || [];
        
        // 满分成就
        if (score === AppState.testData.questions.length && !achievements.includes('perfect_score')) {
            achievements.push('perfect_score');
            showAchievement('满分成就', '太棒了！获得了一次满分！');
        }
        
        // 高准确率成就
        if (accuracy >= 90 && !achievements.includes('high_accuracy')) {
            achievements.push('high_accuracy');
            showAchievement('高准确率成就', '正确率达到90%以上！');
        }
        
        AppState.userStats.achievements = achievements;
        saveData();
    }
    
    // 显示成就
    function showAchievement(title, message) {
        // 创建成就弹窗
        const achievementPopup = document.createElement('div');
        achievementPopup.className = 'achievement-popup';
        achievementPopup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(achievementPopup);
        
        // 3秒后移除
        setTimeout(() => {
            achievementPopup.remove();
        }, 3000);
    }
    
    // 复习答案
    function reviewAnswers() {
        const testData = AppState.testData;
        let reviewText = '题目回顾:\n\n';
        
        testData.questions.forEach((q, index) => {
            reviewText += `${index + 1}. ${q.text} `;
            if (q.isCorrect) {
                reviewText += `✓ 正确 (你的答案: ${q.userAnswer})\n`;
            } else {
                reviewText += `✗ 错误 (你的答案: ${q.userAnswer || '未答'}, 正确答案: ${q.answer})\n`;
            }
        });
        
        alert(reviewText);
    }
    
    // 继续练习
    function nextPractice() {
        // 重置测试数据
        AppState.testData = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            startTime: null,
            timer: null,
            answers: []
        };
        
        // 切换到练习选择
        switchScreen('practice');
    }
    
    // 选择难度
    function selectDifficulty(difficulty) {
        AppState.difficulty = difficulty;
        
        // 更新UI
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-difficulty') === difficulty) {
                option.classList.add('active');
            }
        });
        
        console.log('难度设置为:', difficulty);
    }
    
    // 语音合成
    function speakText(text) {
        if (!AppState.settings.voiceFeedback) return;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // 播放音效
    function playSound(type) {
        if (!AppState.settings.soundEffects) return;
        
        const audio = document.getElementById(type + 'Sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('播放音效失败:', e));
        }
    }
    
    // 检查网络状态
    function checkNetworkStatus() {
        updateNetworkStatus();
    }
    
    // 更新网络状态
    function updateNetworkStatus() {
        const offlineAlert = document.getElementById('offlineAlert');
        if (!navigator.onLine) {
            offlineAlert.style.display = 'flex';
        } else {
            offlineAlert.style.display = 'none';
        }
    }
    
    // 检查是否今天第一次使用
    function checkDailyFirstUse() {
        const today = new Date().toDateString();
        const lastPractice = AppState.userStats.lastPractice;
        
        if (!lastPractice || new Date(lastPractice).toDateString() !== today) {
            // 今天第一次使用
            AppState.userStats.todayCompleted = 0;
            
            // 更新连续天数
            if (lastPractice) {
                const lastDate = new Date(lastPractice);
                const todayDate = new Date();
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    // 连续练习
                    AppState.userStats.streakDays = (AppState.userStats.streakDays || 0) + 1;
                } else if (diffDays > 1) {
                    // 中断，重置连续天数
                    AppState.userStats.streakDays = 1;
                }
            } else {
                // 第一次使用
                AppState.userStats.streakDays = 1;
            }
            
            AppState.userStats.lastPractice = new Date().toISOString();
            saveData();
            
            // 显示欢迎消息
            speakText(`欢迎回来，${AppState.settings.studentName}！今天也要加油哦！`);
        }
    }
    
    // 更新学生姓名
    function updateStudentName() {
        const nameInput = document.getElementById('studentName');
        AppState.settings.studentName = nameInput.value || '学生';
        saveData();
    }
    
    // 更新每日目标
    function updateDailyGoal() {
        const goalSelect = document.getElementById('dailyGoal');
        AppState.settings.dailyGoal = parseInt(goalSelect.value) || 10;
        saveData();
    }
    
    // 切换语音反馈
    function toggleVoiceFeedback() {
        const checkbox = document.getElementById('voiceFeedback');
        AppState.settings.voiceFeedback = checkbox.checked;
        saveData();
    }
    
    // 切换音效
    function toggleSoundEffects() {
        const checkbox = document.getElementById('soundEffects');
        AppState.settings.soundEffects = checkbox.checked;
        saveData();
    }
    
    // 切换深色模式
    function toggleDarkMode() {
        const checkbox = document.getElementById('darkMode');
        AppState.settings.theme = checkbox.checked ? 'dark' : 'light';
        applyTheme();
        saveData();
    }
    
    // 更改主题颜色
    function changeThemeColor(color) {
        AppState.settings.primaryColor = color;
        applyTheme();
        saveData();
    }
    
    // 导出数据
    function exportData() {
        const data = {
            userStats: AppState.userStats,
            settings: AppState.settings
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `神机妙算数据_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        
        showAlert('导出成功', '数据已导出为JSON文件');
    }
    
    // 清除数据
    function clearData() {
        if (confirm('确定要清除所有数据吗？此操作不可撤销。')) {
            localStorage.clear();
            location.reload();
        }
    }
    
    // 切换全屏
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('全屏请求失败:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    // 加载历史记录
    function loadHistory() {
        // 这里可以加载练习历史记录
        // 暂时显示空状态
    }
    
    // 更新设置屏幕
    function updateSettingsScreen() {
        document.getElementById('studentName').value = AppState.settings.studentName;
        document.getElementById('dailyGoal').value = AppState.settings.dailyGoal;
        document.getElementById('voiceFeedback').checked = AppState.settings.voiceFeedback;
        document.getElementById('soundEffects').checked = AppState.settings.soundEffects;
        document.getElementById('darkMode').checked = AppState.settings.theme === 'dark';
    }
    
    // 显示警告
    function showAlert(title, message) {
        // 使用浏览器原生alert
        alert(`${title}\n\n${message}`);
    }
    
    // 辅助函数：打乱数组
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 辅助函数：更新UI
    function updateUI() {
        // 更新学生姓名显示
        const studentNameElements = document.querySelectorAll('.student-name');
        studentNameElements.forEach(el => {
            el.textContent = AppState.settings.studentName;
        });
    }
    
    // 暴露全局函数
    window.initApp = initApp;
    
    // 添加CSS样式
    const additionalStyles = `
        .achievement-popup {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #333;
            padding: 15px 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
        }
        
        .achievement-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .achievement-icon {
            font-size: 2rem;
            color: #333;
        }
        
        @keyframes fadeOut {
            to { opacity: 0; transform: translateX(100%); }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
    
})();