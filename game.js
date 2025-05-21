// 遊戲變數
let score = 0;
let isGameOver = false;
let gameSpeed = 5;
let obstacleInterval = 2000; // 障礙物產生的間隔時間（毫秒）
let lastObstacleTime = 0;
let animationId;
let gameStartTime;
let isJumping = false; // 跟踪粽子是否正在跳躍
let lastFrameTime = 0; // 上一幀的時間戳
let deltaTime = 0;     // 幀間隔時間
let selectedZongzi = "zongzi"; // 預設選擇南部粽
let currentObstacleSet = "common"; // 預設障礙物集合
let wittyEndMessageDisplay; // For the witty end message
let speedMultiplier = 1; // Speed multiplier for special characters

// Witty end messages categorized by score
const wittyMessages = {
    low: [
        "屈原表示：『這分數...比我投江還慘烈。』",
        "我阿罵都比你會包粽子",
        "你的粽子解體啦！糯米灑滿地"
    ],
    medium: [
        "別難過，至少魚蝦們今日有肉粽吃。",
        "頭殼裝糯米，包不出好粽子",
        "是不是太久沒吃粽子，手滑了？再來一顆吧！"
    ],
    high: [
        "聽說屈原在江底點了吳柏毅",
        "屈原說：『你很有潛力，但這次先這樣。』"
    ]
};

// 圖片資源路徑
const IMAGE_PATHS = {
    // 粽子圖片
    "zongzi": 'assets/images/zongzi.png',          // 南部粽
    "zongzi 02": 'assets/images/zongzi 02.png',    // 北部粽
    "zongzi 03": 'assets/images/zongzi 03.png',    // 裸粽
    "zongzi 04": 'assets/images/zongzi 04.png',    // 中部粽
    
    // 障礙物
    common_obstacle1: 'assets/images/obstacle1.png',    // 障礙物1，尺寸：16x30px
    common_obstacle2: 'assets/images/obstacle2.png',     // 障礙物2，尺寸：16x20px
    central_obstacle1: 'assets/images/central_obstacle1.png', // New Central Zongzi Obstacle 1
    central_obstacle2: 'assets/images/central_obstacle2.png'  // New Central Zongzi Obstacle 2
};

// DOM 元素
let game;
let zongzi;
let scoreDisplay;
let finalScoreDisplay;
let gameOverDisplay;
let characterSelect;
let gameScreen;
let characterOptions;
let menuToggle;
let closeSelect;
let restartGameBtn;
let changeZongziBtn;
let jumpButton; // 新增跳躍按鈕元素

// 等待DOM加載完成
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM 已加載");
    
    // 獲取DOM元素
    game = document.getElementById('game');
    zongzi = document.getElementById('zongzi');
    scoreDisplay = document.getElementById('score');
    finalScoreDisplay = document.getElementById('final-score');
    wittyEndMessageDisplay = document.getElementById('witty-end-message'); // Get the new element
    gameOverDisplay = document.getElementById('game-over');
    characterSelect = document.getElementById('character-select');
    gameScreen = document.getElementById('game-screen');
    characterOptions = document.querySelectorAll('.character-option');
    menuToggle = document.getElementById('menu-toggle');
    closeSelect = document.getElementById('close-select');
    restartGameBtn = document.getElementById('restart-game');
    changeZongziBtn = document.getElementById('change-zongzi');
    jumpButton = document.getElementById('jump-btn'); // 獲取跳躍按鈕
    
    // 設置粽子選擇監聽器
    setupCharacterSelection();
    
    // 設置漢堡選單
    setupMenuToggle();
    
    // 設置遊戲結束按鈕
    setupGameOverButtons();
    
    // 設置跳躍按鈕
    setupJumpButton();
    
    // 載入預設粽子
    loadSelectedZongzi();
    
    // 添加旋轉動畫
    zongzi.classList.add('rolling');
    
    // 添加事件監聽器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleGameClick);
    document.addEventListener('touchstart', handleTouch, {passive: false});
    
    // 檢測是否為移動設備並更新指示文字
    updateInstructions();
    
    // 初始化遊戲
    initGame();
});

// 設置漢堡選單
function setupMenuToggle() {
    menuToggle.addEventListener('click', function(event) {
        // 防止事件冒泡到遊戲區域
        event.stopPropagation();
        // 顯示角色選擇面板
        characterSelect.classList.remove('hidden');
    });
    
    closeSelect.addEventListener('click', function() {
        // 關閉角色選擇面板
        characterSelect.classList.add('hidden');
    });
}

// 設置粽子選擇
function setupCharacterSelection() {
    // 為每個粽子選項添加點擊事件
    characterOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除其他選項的選中狀態
            characterOptions.forEach(opt => opt.classList.remove('selected'));
            
            // 添加當前選項的選中狀態
            this.classList.add('selected');
            
            // 獲取選中的粽子類型
            selectedZongzi = this.getAttribute('data-zongzi');
            
            // 獲取對應的障礙物集合
            currentObstacleSet = this.getAttribute('data-obstacle-set') || "common";
            
            // 延遲後關閉選擇面板並更新粽子
            setTimeout(function() {
                characterSelect.classList.add('hidden');
                loadSelectedZongzi();
                
                // 顯示漢堡選單
                if (menuToggle) {
                    menuToggle.style.display = '';
                }
                
                // 如果當前是遊戲結束狀態，直接開始新遊戲
                if (isGameOver) {
                    initGame();
                }
            }, 300);
        });
    });
}

// 設置遊戲結束按鈕
function setupGameOverButtons() {
    // 重新開始按鈕
    restartGameBtn.addEventListener('click', function(event) {
        // 防止事件冒泡
        event.stopPropagation();
        
        // 確保popup被隱藏
        gameOverDisplay.classList.add('hidden');
        
        // 重置遊戲狀態
        isGameOver = false;
        
        // 顯示漢堡選單
        if (menuToggle) {
            menuToggle.style.display = '';
        }
        
        // 延遲一下再初始化，確保UI更新
        setTimeout(function() {
            initGame();
        }, 50);
    });
    
    // 更換粽子按鈕
    changeZongziBtn.addEventListener('click', function(event) {
        // 防止事件冒泡
        event.stopPropagation();
        
        // 確保遊戲結束界面被隱藏
        gameOverDisplay.classList.add('hidden');
        
        // 延遲一下再顯示選擇界面，確保UI更新
        setTimeout(function() {
            // 顯示角色選擇面板
            characterSelect.classList.remove('hidden');
        }, 50);
    });
}

// 加載選中的粽子圖片
function loadSelectedZongzi() {
    // 檢查選中的粽子圖片是否存在
    if (selectedZongzi && IMAGE_PATHS[selectedZongzi] && imageExists(IMAGE_PATHS[selectedZongzi])) {
        zongzi.style.backgroundImage = `url('${IMAGE_PATHS[selectedZongzi]}')`;
        zongzi.style.backgroundColor = 'transparent'; // 移除背景色
    } else {
        // 如果沒有選擇或找不到圖片，使用預設粽子
        console.log(`找不到粽子圖片: ${selectedZongzi}，使用預設粽子`);
        
        // 嘗試使用其他可用的粽子
        if (imageExists(IMAGE_PATHS.zongzi)) {
            selectedZongzi = "zongzi";
            zongzi.style.backgroundImage = `url('${IMAGE_PATHS.zongzi}')`;
        } else if (imageExists(IMAGE_PATHS["zongzi 02"])) {
            selectedZongzi = "zongzi 02";
            zongzi.style.backgroundImage = `url('${IMAGE_PATHS["zongzi 02"]}')`;
        } else if (imageExists(IMAGE_PATHS["zongzi 03"])) {
            selectedZongzi = "zongzi 03";
            zongzi.style.backgroundImage = `url('${IMAGE_PATHS["zongzi 03"]}')`;
        } else {
            // 如果所有圖片都找不到，使用預設背景色
            selectedZongzi = "zongzi";
            zongzi.style.backgroundImage = '';
            zongzi.style.backgroundColor = '#535353';
        }
    }
}

// 處理點擊事件 (區分遊戲點擊和UI點擊)
function handleGameClick(event) {
    // 檢查是否為移動設備
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 如果點擊的是遊戲區域以外的元素，不觸發跳躍
    if (event.target.closest('.popup') || 
        event.target === menuToggle || 
        event.target === jumpButton) {
        return;
    }
    
    // 在移動設備上，只通過JUMP按鈕跳躍，不響應其他點擊
    if (isMobile) {
        return;
    }
    
    // 在桌面版本，點擊遊戲區域可以跳躍
    jumpZongzi();
}

// 檢查圖片是否存在
function imageExists(url) {
    // 檢查是否指定了URL
    if (!url) {
        return false;
    }
    
    // 檢查常見圖片，確認其是否存在
    const commonImages = [
        'assets/images/zongzi.png',
        'assets/images/zongzi 02.png',
        'assets/images/zongzi 03.png',
        'assets/images/zongzi 04.png',
        'assets/images/obstacle1.png',
        'assets/images/obstacle2.png',
        'assets/images/central_obstacle1.png', // Added central obstacle 1
        'assets/images/central_obstacle2.png'  // Added central obstacle 2
    ];
    
    return commonImages.includes(url);
}

// 初始化遊戲
function initGame() {
    console.log("初始化遊戲");
    
    // Reset speed multiplier
    speedMultiplier = 1;
    if (selectedZongzi === "zongzi 04") { // If Central Zongzi is selected
        speedMultiplier = 1.3;
        console.log("中部粽加速模式啟動!");
    }

    // 重設遊戲變數
    score = 0;
    isGameOver = false;
    gameSpeed = 5 * speedMultiplier; // Apply speed multiplier to base speed
    obstacleInterval = 2000 / speedMultiplier; // Obstacles appear faster
    isJumping = false;
    lastFrameTime = 0;
    
    // 更新界面
    scoreDisplay.textContent = `SCORE: ${score}`;
    if (wittyEndMessageDisplay) {
        wittyEndMessageDisplay.textContent = ''; // Clear witty message on new game
    }
    
    // 確保漢堡選單顯示
    if (menuToggle) {
        menuToggle.style.display = '';
    }
    
    // 清除所有障礙物
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => {
        obstacle.remove();
    });
    
    // 設置粽子初始狀態
    zongzi.style.transform = 'translateY(0)';
    zongzi.classList.remove('jumping');
    zongzi.classList.add('rolling');  // 確保添加旋轉動畫
    
    // 記錄開始時間
    gameStartTime = Date.now();
    lastObstacleTime = gameStartTime;
    
    // 開始遊戲循環
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    animationId = requestAnimationFrame(gameLoop);
}

// 處理鍵盤事件
function handleKeyDown(event) {
    console.log("鍵盤事件:", event.code);
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        jumpZongzi();
    }
}

// 處理觸摸事件
function handleTouch(event) {
    console.log("觸摸事件");
    
    // 如果是彈出窗口或菜單，允許觸摸
    if (event.target.closest('.popup') || 
        event.target === menuToggle || 
        event.target === jumpButton) {
        return;
    }
    
    // 在移動設備上阻止默認滾動行為，但不觸發跳躍
    event.preventDefault();
    
    // 檢查是否為移動設備
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 在移動設備上，只通過JUMP按鈕跳躍
    if (isMobile) {
        return;
    }
    
    // 在桌面設備上，觸摸可以觸發跳躍
    jumpZongzi();
}

// 粽子跳躍
function jumpZongzi() {
    console.log("嘗試跳躍, isJumping:", isJumping, "isGameOver:", isGameOver);
    
    // 如果遊戲結束，重新開始遊戲
    if (isGameOver) {
        initGame();
        return;
    }
    
    // 如果不在跳躍中，執行跳躍
    if (!isJumping) {
        console.log("執行跳躍");
        isJumping = true;
        
        const jumpDuration = 0.7 / speedMultiplier; // Adjust jump duration
        zongzi.style.animationDuration = jumpDuration + 's'; // Apply to current jump

        // 移除現有的跳躍類，重置狀態
        zongzi.classList.remove('jumping');
        
        // 強制重繪
        void zongzi.offsetWidth;
        
        // 添加跳躍類，但保持旋轉
        zongzi.classList.add('jumping');
        
        // 如果跳躍按鈕存在，添加視覺反饋
        if (jumpButton) {
            jumpButton.classList.add('button-active');
            
            // 移除視覺反饋
            setTimeout(function() {
                jumpButton.classList.remove('button-active');
            }, 200);
        }
        
        // 跳躍結束後的處理
        setTimeout(function() {
            console.log("跳躍結束");
            zongzi.classList.remove('jumping');
            zongzi.style.animationDuration = ''; // Reset animation duration
            isJumping = false;
        }, jumpDuration * 1000); // Use adjusted duration for timeout
    }
}

// 遊戲主循環
function gameLoop(timestamp) {
    if (isGameOver) return;
    
    // 計算幀間隔時間
    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }
    deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    const now = Date.now();
    
    // 更新分數
    score = Math.floor((now - gameStartTime) / 100);
    scoreDisplay.textContent = `SCORE: ${score}`;
    
    // 增加遊戲難度，更平滑的難度曲線
    gameSpeed = (5 + Math.floor(score / 200)) * speedMultiplier; // Apply speed multiplier
    obstacleInterval = Math.max(800 / speedMultiplier, (2000 - Math.floor(score / 15) * 100) / speedMultiplier); // Apply speed multiplier
    
    // 產生新障礙物
    if (now - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = now;
    }
    
    // 移動障礙物並檢查碰撞
    moveObstacles(deltaTime);
    
    // 繼續遊戲循環
    animationId = requestAnimationFrame(gameLoop);
}

// 創建障礙物
function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    let obstacleType;
    if (currentObstacleSet === "central_special") {
        obstacleType = Math.random() < 0.3 ? 
            'central_obstacle1' : 
            'central_obstacle2';
    } else {
        obstacleType = Math.random() < 0.3 ? 
            'common_obstacle1' : 
            'common_obstacle2';
    }
    
    const obstacleImage = IMAGE_PATHS[obstacleType];
    
    // 根據障礙物類型設置高度和寬度 (4倍放大)
    if (obstacleType === 'common_obstacle1') {
        obstacle.style.height = '120px'; // 原始30px x 4
        obstacle.style.width = '64px';   // 原始16px x 4
    } else if (obstacleType === 'common_obstacle2') {
        obstacle.style.height = '80px';  // 原始20px x 4
        obstacle.style.width = '64px';   // 原始16px x 4
    } else if (obstacleType === 'central_obstacle1') {
        obstacle.style.height = '80px';  // 原始20px (高) x 4
        obstacle.style.width = '64px';   // 原始16px (寬) x 4
    } else if (obstacleType === 'central_obstacle2') {
        // Assuming central_obstacle2 has same dimensions as common_obstacle2 for now
        // If different, add its specific dimensions here
        obstacle.style.height = '80px';  // Placeholder: e.g., 原始20px x 4
        obstacle.style.width = '64px';   // Placeholder: e.g., 原始16px x 4
    }
    
    // 嘗試設置背景圖片
    if (imageExists(obstacleImage)) {
        obstacle.style.backgroundImage = `url('${obstacleImage}')`;
        obstacle.style.backgroundColor = 'transparent'; // 移除背景色
    } else {
        // 如果找不到圖片，使用純色背景
        obstacle.style.backgroundImage = '';
        obstacle.style.backgroundColor = '#535353';
        console.warn(`找不到障礙物圖片: ${obstacleImage}，使用純色背景`);
    }
    
    obstacle.style.left = game.offsetWidth + 'px';
    game.appendChild(obstacle);
}

// 移動障礙物並檢查碰撞
function moveObstacles(deltaTime) {
    const obstacles = document.querySelectorAll('.obstacle');
    
    // 確保deltaTime在合理範圍內
    const normalizedDelta = Math.min(deltaTime, 33) / 16.667;
    
    obstacles.forEach(obstacle => {
        const obstacleLeft = parseFloat(window.getComputedStyle(obstacle).getPropertyValue('left'));
        
        // 根據幀率平滑移動
        const moveAmount = gameSpeed * normalizedDelta;
        obstacle.style.left = (obstacleLeft - moveAmount) + 'px';
        
        // 移除超出畫面的障礙物
        if (obstacleLeft < -20) {
            obstacle.remove();
        }
        
        // 碰撞檢測
        if (!isJumping && isColliding(zongzi, obstacle)) {
            endGame();
        }
    });
}

// 碰撞檢測
function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    // 使碰撞範圍更寬鬆，減少難度，因為粽子縮小了25%
    const safeMargin = 20; // 從25減少到20
    
    return !(
        rect1.right - safeMargin < rect2.left + safeMargin ||
        rect1.left + safeMargin > rect2.right - safeMargin ||
        rect1.bottom - safeMargin < rect2.top + safeMargin ||
        rect1.top + safeMargin > rect2.bottom - safeMargin
    );
}

// 結束遊戲
function endGame() {
    console.log("遊戲結束");
    isGameOver = true;
    cancelAnimationFrame(animationId);
    zongzi.classList.remove('rolling');
    
    // 更新最終分數
    finalScoreDisplay.textContent = score;

    // Display witty end message
    let messagesToShow;
    if (score <= 200) {
        messagesToShow = wittyMessages.low;
    } else if (score <= 500) {
        messagesToShow = wittyMessages.medium;
    } else {
        messagesToShow = wittyMessages.high;
    }
    const randomIndex = Math.floor(Math.random() * messagesToShow.length);
    if (wittyEndMessageDisplay) {
        wittyEndMessageDisplay.textContent = messagesToShow[randomIndex];
    }
    
    // 隱藏漢堡選單，在遊戲結束時不需要顯示
    if (menuToggle) {
        menuToggle.style.display = 'none';
    }
    
    // 顯示遊戲結束界面
    gameOverDisplay.classList.remove('hidden');
}

// 設置跳躍按鈕
function setupJumpButton() {
    if (jumpButton) {
        jumpButton.addEventListener('click', function(event) {
            // 防止事件冒泡
            event.stopPropagation();
            // 執行跳躍
            jumpZongzi();
        });
        
        // 防止觸摸事件冒泡 (mobile)
        jumpButton.addEventListener('touchstart', function(event) {
            event.stopPropagation();
            event.preventDefault();
            jumpZongzi();
        }, {passive: false});
    }
}

// 更新指示文字，根據設備類型
function updateInstructions() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const instructionsElement = document.querySelector('.instructions');
    
    if (instructionsElement) {
        if (isMobile) {
            instructionsElement.textContent = '點擊下方JUMP按鈕跳躍';
        } else {
            instructionsElement.textContent = '按空白鍵或點擊跳躍';
        }
    }
} 