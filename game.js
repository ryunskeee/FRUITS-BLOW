// FRUITS&BLOW（フルブロ）ゲーム

// 音響システム
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.bgmOscillators = [];
        this.isBGMEnabled = true;
        this.isSFXEnabled = true;
        this.volume = 0.5;
        this.bgmPlaying = false;
        this.initAudio();
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // BGM用のゲインノード
            this.bgmGain = this.audioContext.createGain();
            this.bgmGain.gain.value = 0.25;
            this.bgmGain.connect(this.audioContext.destination);
            
            // 効果音用のゲインノード
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.3;
            this.sfxGain.connect(this.audioContext.destination);
        } catch (error) {
            console.log('Audio context initialization failed:', error);
        }
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            await this.initAudio();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // BGM関連
    async startBGM() {
        if (!this.isBGMEnabled || this.bgmPlaying) return;
        
        await this.ensureAudioContext();
        this.bgmPlaying = true;
        this.playBGMLoop();
    }

    playBGMLoop() {
        if (!this.isBGMEnabled || !this.bgmPlaying) return;
        
        const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C-C高音
        const rhythm = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0];
        
        let time = this.audioContext.currentTime;
        
        melody.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'triangle'; // よりリッチなサウンドに変更
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.05, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + rhythm[i]);
            
            osc.connect(gain);
            gain.connect(this.bgmGain);
            
            osc.start(time);
            osc.stop(time + rhythm[i]);
            
            time += rhythm[i];
        });
        
        // ループ
        setTimeout(() => {
            if (this.bgmPlaying) {
                this.playBGMLoop();
            }
        }, time * 1000 - this.audioContext.currentTime * 1000 + 500);
    }

    stopBGM() {
        this.bgmPlaying = false;
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.bgmOscillators = [];
    }

    // 効果音
    async playSelectSound() {
        if (!this.isSFXEnabled) return;
        await this.ensureAudioContext();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    async playHitSound() {
        if (!this.isSFXEnabled) return;
        await this.ensureAudioContext();
        
        // キラキラ音
        const frequencies = [1047, 1175, 1319, 1397];
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.05);
            
            gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.05 + 0.3);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(this.audioContext.currentTime + i * 0.05);
            osc.stop(this.audioContext.currentTime + i * 0.05 + 0.3);
        });
    }

    async playSuccessSound() {
        if (!this.isSFXEnabled) return;
        await this.ensureAudioContext();
        
        // 勝利のファンファーレ
        const melody = [523, 659, 784, 1047];
        melody.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.2);
            
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.2 + 0.4);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(this.audioContext.currentTime + i * 0.2);
            osc.stop(this.audioContext.currentTime + i * 0.2 + 0.4);
        });
    }

    async playErrorSound() {
        if (!this.isSFXEnabled) return;
        await this.ensureAudioContext();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.bgmGain) {
            this.bgmGain.gain.value = 0.25 * volume;
        }
        if (this.sfxGain) {
            this.sfxGain.gain.value = 0.3 * volume;
        }
    }

    toggleBGM() {
        this.isBGMEnabled = !this.isBGMEnabled;
        if (this.isBGMEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.isBGMEnabled;
    }

    toggleSFX() {
        this.isSFXEnabled = !this.isSFXEnabled;
        return this.isSFXEnabled;
    }
}

// 音響システムインスタンス
const audioSystem = new AudioSystem();

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyDDemo-Key-Replace-With-Real-Key",
    authDomain: "fruits-blow-demo.firebaseapp.com",
    projectId: "fruits-blow-demo",
    storageBucket: "fruits-blow-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:demo123456789012"
};

// Firebase初期化（デモ用設定 - 実際の使用時は適切な設定に変更）
let db = null;
let isOnlineMode = false;

function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log('Firebase initialized successfully');
        } else {
            console.log('Firebase not loaded - using local mode only');
        }
    } catch (error) {
        console.log('Firebase initialization failed:', error);
        console.log('Falling back to local mode');
    }
}

// オンラインランキング機能
class OnlineRanking {
    static async addScore(slotCount, playerName, time, attempts) {
        if (!db || !isOnlineMode) return false;
        
        try {
            await db.collection('rankings').add({
                slotCount: slotCount,
                playerName: playerName,
                time: time,
                attempts: attempts,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0]
            });
            return true;
        } catch (error) {
            console.error('Error adding score to online ranking:', error);
            return false;
        }
    }
    
    static async getRanking(slotCount, limit = 50) {
        if (!db || !isOnlineMode) return [];
        
        try {
            const snapshot = await db.collection('rankings')
                .where('slotCount', '==', slotCount)
                .orderBy('time')
                .limit(limit)
                .get();
            
            const rankings = [];
            snapshot.forEach(doc => {
                rankings.push(doc.data());
            });
            
            return rankings;
        } catch (error) {
            console.error('Error getting online ranking:', error);
            return [];
        }
    }
    
    static async getPlayerStats(playerName) {
        if (!db || !isOnlineMode) return null;
        
        try {
            const snapshot = await db.collection('rankings')
                .where('playerName', '==', playerName)
                .get();
            
            let totalGames = 0;
            let bestTimes = {};
            
            snapshot.forEach(doc => {
                const data = doc.data();
                totalGames++;
                if (!bestTimes[data.slotCount] || data.time < bestTimes[data.slotCount]) {
                    bestTimes[data.slotCount] = data.time;
                }
            });
            
            return { totalGames, bestTimes };
        } catch (error) {
            console.error('Error getting player stats:', error);
            return null;
        }
    }
}

// ゲーム設定
const GAME_CONFIG = {
    MAX_ATTEMPTS: Infinity, // 無制限に変更
    ANSWER_LENGTH: 4, // デフォルト値、動的に変更される
    MAX_SLOTS: 15,
    ALL_FRUITS: ['🍎', '🍊', '🍇', '🍌', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍', '🥥', '🍉', '🍈', '🫐', '🍋'], // 15種類
    FRUIT_NAMES: {
        '🍎': 'りんご',
        '🍊': 'オレンジ', 
        '🍇': 'ぶどう',
        '🍌': 'バナナ',
        '🍓': 'いちご',
        '🥝': 'キウイ',
        '🍑': 'さくらんぼ',
        '🍒': 'チェリー',
        '🥭': 'マンゴー',
        '🍍': 'パイナップル',
        '🥥': 'ココナッツ',
        '🍉': 'すいか',
        '🍈': 'メロン',
        '🫐': 'ブルーベリー',
        '🍋': 'レモン'
    }
};

// 現在使用中のフルーツ
let currentFruits = [];

// ゲーム状態
let gameState = {
    answer: [],
    currentGuess: [],
    guessHistory: [],
    attempts: 0,
    isGameOver: false,
    startTime: null,
    timer: null
};

// UI要素
const attemptsElement = document.getElementById('attempts');
const timerElement = document.getElementById('timer');
const juiceButtonsContainer = document.getElementById('juiceButtons');
const slotsContainer = document.getElementById('guessSlots');
const submitButton = document.getElementById('submitGuess');
const clearButton = document.getElementById('clearGuess');
const historyElement = document.getElementById('guessHistory');
const toggleHistoryButton = document.getElementById('toggleHistory');
const currentResultElement = document.getElementById('currentResult');
const resultTextElement = document.getElementById('resultText');
const hitCountElement = document.getElementById('hitCount');
const gameResultElement = document.getElementById('gameResult');
const resultTitleElement = document.getElementById('resultTitle');
const resultMessageElement = document.getElementById('resultMessage');
const correctAnswerElement = document.getElementById('correctAnswer');
const newGameButton = document.getElementById('newGameBtn');
const hintButton = document.getElementById('hintBtn');
const playAgainButton = document.getElementById('playAgainBtn');
const slotCountSelect = document.getElementById('slotCount');
const applyDifficultyButton = document.getElementById('applyDifficulty');

// ユーザー関連要素
const playerNameInput = document.getElementById('playerName');
const savePlayerNameButton = document.getElementById('savePlayerName');
const currentPlayerNameElement = document.getElementById('currentPlayerName');

// ランキング関連要素
const showRankingButton = document.getElementById('showRankingBtn');
const rankingSection = document.getElementById('rankingSection');
const rankingSlotCountSelect = document.getElementById('rankingSlotCount');
const closeRankingButton = document.getElementById('closeRankingBtn');
const rankingList = document.getElementById('rankingList');

let juiceButtons = [];
let isHistoryVisible = false;
let selectedSlotIndex = -1; // 選択されたスロットのインデックス
let slots = [];

// ユーザー管理
let currentPlayer = localStorage.getItem('hitjuice_player') || 'ゲスト';

// ランキングデータ管理
function getRankingData() {
    const data = localStorage.getItem('hitjuice_rankings');
    return data ? JSON.parse(data) : {};
}

function saveRankingData(rankings) {
    localStorage.setItem('hitjuice_rankings', JSON.stringify(rankings));
}

// ユーザー管理機能
function updatePlayerDisplay() {
    currentPlayerNameElement.textContent = currentPlayer;
}

function savePlayerName() {
    const name = playerNameInput.value.trim();
    if (name && name.length <= 10) {
        currentPlayer = name;
        localStorage.setItem('hitjuice_player', currentPlayer);
        updatePlayerDisplay();
        playerNameInput.value = '';
    } else {
        alert('名前は1〜10文字で入力してください。');
    }
}

// ランキング機能
async function addToRanking(slotCount, time, attempts) {
    if (currentPlayer === 'ゲスト') return;
    
    // ローカルランキングに追加
    const rankings = getRankingData();
    const key = `slot_${slotCount}`;
    
    if (!rankings[key]) {
        rankings[key] = [];
    }
    
    rankings[key].push({
        player: currentPlayer,
        time: time,
        attempts: attempts,
        date: new Date().toISOString()
    });
    
    // 時間順でソート（短い時間が上位）
    rankings[key].sort((a, b) => a.time - b.time);
    
    // 上位10位まで保持
    rankings[key] = rankings[key].slice(0, 10);
    
    saveRankingData(rankings);
    
    // オンラインランキングに追加（可能な場合）
    if (isOnlineMode) {
        try {
            const success = await OnlineRanking.addScore(slotCount, currentPlayer, time, attempts);
            if (success) {
                console.log('スコアをオンラインランキングに追加しました');
            }
        } catch (error) {
            console.log('オンラインランキングへの追加に失敗しました:', error);
        }
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function showRanking() {
    const slotCount = parseInt(rankingSlotCountSelect.value);
    
    rankingList.innerHTML = '<div class="loading">読み込み中...</div>';
    
    let records = [];
    
    if (isOnlineMode) {
        // オンラインランキングを取得
        try {
            records = await OnlineRanking.getRanking(slotCount);
            console.log('オンラインランキングを表示します');
        } catch (error) {
            console.log('オンラインランキングの取得に失敗しました:', error);
            isOnlineMode = false;
            updateRankingModeUI();
        }
    }
    
    if (!isOnlineMode) {
        // ローカルランキングを取得
        const rankings = getRankingData();
        const key = `slot_${slotCount}`;
        records = rankings[key] || [];
        console.log('ローカルランキングを表示します');
    }
    
    rankingList.innerHTML = '';
    
    if (records.length === 0) {
        rankingList.innerHTML = '<div class="no-records">まだ記録がありません</div>';
    } else {
        records.forEach((record, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            
            const position = document.createElement('div');
            position.className = 'ranking-position';
            position.textContent = `${index + 1}位`;
            
            if (index === 0) position.classList.add('gold');
            else if (index === 1) position.classList.add('silver');
            else if (index === 2) position.classList.add('bronze');
            
            const player = document.createElement('div');
            player.className = 'ranking-player';
            player.textContent = isOnlineMode ? record.playerName : record.player;
            
            const time = document.createElement('div');
            time.className = 'ranking-time';
            time.textContent = formatTime(record.time);
            
            const attempts = document.createElement('div');
            attempts.className = 'ranking-attempts';
            attempts.textContent = `${record.attempts}回`;
            
            item.appendChild(position);
            item.appendChild(player);
            item.appendChild(time);
            item.appendChild(attempts);
            
            rankingList.appendChild(item);
        });
    }
    
    rankingSection.style.display = 'block';
}

// 難易度設定の適用
function applyDifficulty() {
    const slotCount = parseInt(slotCountSelect.value);
    GAME_CONFIG.ANSWER_LENGTH = slotCount;
    currentFruits = GAME_CONFIG.ALL_FRUITS.slice(0, slotCount);
    
    // UI を再生成
    createFruitButtons();
    createSlots();
    
    // ゲームを初期化
    initGame();
}

// フルーツボタンを動的生成
function createFruitButtons() {
    juiceButtonsContainer.innerHTML = '';
    juiceButtons = [];
    
    currentFruits.forEach(fruit => {
        const button = document.createElement('button');
        button.className = 'juice-btn';
        button.setAttribute('data-juice', fruit);
        button.setAttribute('data-name', GAME_CONFIG.FRUIT_NAMES[fruit]);
        button.textContent = fruit;
        
        button.addEventListener('click', () => {
            addFruitToGuess(fruit);
        });
        
        juiceButtonsContainer.appendChild(button);
        juiceButtons.push(button);
    });
}

// スロットを動的生成
function createSlots() {
    slotsContainer.innerHTML = '';
    slots = [];
    gameState.currentGuess = new Array(GAME_CONFIG.ANSWER_LENGTH).fill('');
    
    for (let i = 0; i < GAME_CONFIG.ANSWER_LENGTH; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.setAttribute('data-position', i);
        slot.textContent = '?';
        
        slot.addEventListener('click', () => {
            handleSlotClick(i);
        });
        
        slotsContainer.appendChild(slot);
        slots.push(slot);
    }
}

// スロットクリック処理
function handleSlotClick(index) {
    if (gameState.isGameOver) return;
    
    // 選択されたスロットがない場合
    if (selectedSlotIndex === -1) {
        // 空でないスロットを選択
        if (gameState.currentGuess[index] !== '') {
            selectedSlotIndex = index;
            updateSlotSelection();
        }
    } else {
        // 既にスロットが選択されている場合
        if (selectedSlotIndex === index) {
            // 同じスロットをクリック → 選択解除
            selectedSlotIndex = -1;
            updateSlotSelection();
        } else {
            // 異なるスロットをクリック → 入れ替え
            swapSlots(selectedSlotIndex, index);
            selectedSlotIndex = -1;
            updateSlotSelection();
        }
    }
}

// スロットの入れ替え
function swapSlots(index1, index2) {
    const temp = gameState.currentGuess[index1];
    gameState.currentGuess[index1] = gameState.currentGuess[index2];
    gameState.currentGuess[index2] = temp;
    
    updateGuessSlots();
    checkSubmitButton();
}

// スロット選択状態の更新
function updateSlotSelection() {
    slots.forEach((slot, index) => {
        if (index === selectedSlotIndex) {
            slot.classList.add('selected');
        } else {
            slot.classList.remove('selected');
        }
    });
}

// ゲーム初期化
function initGame() {
    // 正解の生成（現在のジュース数でシャッフル）
    gameState.answer = generateRandomAnswer();
    gameState.currentGuess = new Array(GAME_CONFIG.ANSWER_LENGTH).fill('');
    gameState.guessHistory = [];
    gameState.attempts = 0;
    gameState.isGameOver = false;
    gameState.startTime = Date.now();
    selectedSlotIndex = -1; // 選択状態をリセット
    
    // タイマー開始
    startTimer();
    
    // UI初期化
    updateUI();
    if (slots.length > 0) {
        clearGuessSlots();
    }
    historyElement.innerHTML = '';
    currentResultElement.style.display = 'none'; // 結果表示を隠す
    gameResultElement.style.display = 'none';
    
    console.log('正解:', gameState.answer); // デバッグ用（実際は削除）
}

// ランダムな正解生成（現在のフルーツ数でシャッフル）
function generateRandomAnswer() {
    return [...currentFruits].sort(() => Math.random() - 0.5);
}

// タイマー開始
function startTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState.timer = setInterval(() => {
        if (!gameState.isGameOver) {
            const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            timerElement.textContent = `${minutes}:${seconds}`;
        }
    }, 1000);
}

// 予想にフルーツを追加（重複チェック付き）
function addFruitToGuess(fruit) {
    if (gameState.isGameOver) return;
    
    // 全てのスロットが埋まっている場合は追加を無効にする
    const hasEmptySlots = gameState.currentGuess.includes('');
    if (!hasEmptySlots) return;
    
    // 既に同じフルーツが使われているかチェック
    if (gameState.currentGuess.includes(fruit)) {
        // 既存の位置を見つけて削除
        const existingIndex = gameState.currentGuess.indexOf(fruit);
        gameState.currentGuess[existingIndex] = '';
    }
    
    const emptySlotIndex = gameState.currentGuess.indexOf('');
    if (emptySlotIndex !== -1) {
        gameState.currentGuess[emptySlotIndex] = fruit;
        audioSystem.playSelectSound(); // 効果音追加
        updateGuessSlots();
        checkSubmitButton();
        updateFruitButtonStates();
    }
}

// 予想スロットの更新
function updateGuessSlots() {
    slots.forEach((slot, index) => {
        if (gameState.currentGuess[index]) {
            slot.textContent = gameState.currentGuess[index];
            slot.classList.add('filled');
        } else {
            slot.textContent = '?';
            slot.classList.remove('filled');
        }
    });
}

// 予想スロットのクリア
function clearGuessSlots() {
    gameState.currentGuess = new Array(GAME_CONFIG.ANSWER_LENGTH).fill('');
    selectedSlotIndex = -1; // 選択状態をリセット
    updateGuessSlots();
    updateSlotSelection(); // 選択表示を更新
    checkSubmitButton();
    updateFruitButtonStates();
}

// フルーツボタンの状態更新
function updateFruitButtonStates() {
    const hasEmptySlots = gameState.currentGuess.includes('');
    
    juiceButtons.forEach(button => {
        const fruit = button.getAttribute('data-juice');
        
        // 全てのスロットが埋まっている場合は全てのボタンを無効化
        if (!hasEmptySlots) {
            button.style.opacity = '0.3';
            button.style.transform = 'scale(0.9)';
            button.style.pointerEvents = 'none';
        } else if (gameState.currentGuess.includes(fruit)) {
            button.style.opacity = '0.5';
            button.style.transform = 'scale(0.95)';
            button.style.pointerEvents = 'auto';
        } else {
            button.style.opacity = '1';
            button.style.transform = 'scale(1)';
            button.style.pointerEvents = 'auto';
        }
    });
}

// 送信ボタンの状態チェック
function checkSubmitButton() {
    const isFilled = gameState.currentGuess.every(juice => juice !== '');
    const hasAllDifferent = new Set(gameState.currentGuess.filter(j => j !== '')).size === gameState.currentGuess.filter(j => j !== '').length;
    submitButton.disabled = !isFilled || !hasAllDifferent || gameState.isGameOver;
}

// 予想の送信
function submitGuess() {
    if (gameState.isGameOver || gameState.currentGuess.includes('')) return;
    
    const guess = [...gameState.currentGuess];
    const result = calculateHitBlow(guess, gameState.answer);
    
    // 履歴に追加
    gameState.guessHistory.push({
        guess: guess,
        hits: result.hits,
        attempt: gameState.attempts + 1
    });
    
    gameState.attempts++;
    
    // 現在の結果を表示
    showCurrentResult(result.hits);
    
    // 履歴表示更新
    updateHistory();
    
    // 勝利判定
    if (result.hits === GAME_CONFIG.ANSWER_LENGTH) {
        endGame(true);
        return;
    }
    
    // 次の予想のために選択状態をリセット（スロットの内容は保持）
    selectedSlotIndex = -1;
    updateSlotSelection();
    updateUI();
}

// ヒットの計算（ヒットのみ）
function calculateHitBlow(guess, answer) {
    let hits = 0;
    
    // ヒットをカウント
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answer[i]) {
            hits++;
        }
    }
    
    return { hits, blows: 0 };
}

// 現在の結果を表示
function showCurrentResult(hits) {
    hitCountElement.textContent = `🎯 ${hits} ヒット`;
    
    // ヒット数に応じて音とメッセージを変更
    if (hits === GAME_CONFIG.ANSWER_LENGTH) {
        resultTextElement.textContent = "🎉 完全正解！ ";
        currentResultElement.style.background = "linear-gradient(45deg, #fd79a8, #e84393)";
        audioSystem.playSuccessSound();
    } else if (hits >= GAME_CONFIG.ANSWER_LENGTH * 0.75) {
        resultTextElement.textContent = "👍 あと少し！ ";
        currentResultElement.style.background = "linear-gradient(45deg, #fdcb6e, #e17055)";
        audioSystem.playHitSound();
    } else if (hits >= GAME_CONFIG.ANSWER_LENGTH * 0.5) {
        resultTextElement.textContent = "😊 良い感じ！ ";
        currentResultElement.style.background = "linear-gradient(45deg, #74b9ff, #0984e3)";
        audioSystem.playHitSound();
    } else if (hits > 0) {
        resultTextElement.textContent = "🤔 まずまず... ";
        currentResultElement.style.background = "linear-gradient(45deg, #00b894, #00cec9)";
        audioSystem.playSelectSound();
    } else {
        resultTextElement.textContent = "😅 頑張って！ ";
        currentResultElement.style.background = "linear-gradient(45deg, #a29bfe, #6c5ce7)";
        audioSystem.playErrorSound();
    }
    
    // アニメーション効果で表示
    currentResultElement.style.display = 'block';
    currentResultElement.style.animation = 'none';
    setTimeout(() => {
        currentResultElement.style.animation = 'slideIn 0.5s ease-out';
    }, 10);
}

// 履歴表示更新
function updateHistory() {
    historyElement.innerHTML = '';
    
    gameState.guessHistory.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const guessDisplay = document.createElement('div');
        guessDisplay.className = 'guess-display';
        entry.guess.forEach(juice => {
            const juiceSpan = document.createElement('span');
            juiceSpan.textContent = juice;
            guessDisplay.appendChild(juiceSpan);
        });
        
        const resultDisplay = document.createElement('div');
        resultDisplay.className = 'result-display';
        
        const hitsSpan = document.createElement('span');
        hitsSpan.className = 'hit-blow hits';
        hitsSpan.textContent = `🎯 ${entry.hits}`;
        
        resultDisplay.appendChild(hitsSpan);
        
        historyItem.appendChild(guessDisplay);
        historyItem.appendChild(resultDisplay);
        
        historyElement.appendChild(historyItem);
    });
}

// 履歴の表示/非表示切り替え
function toggleHistory() {
    isHistoryVisible = !isHistoryVisible;
    
    if (isHistoryVisible) {
        historyElement.style.display = 'block';
        toggleHistoryButton.textContent = '履歴を隠す';
    } else {
        historyElement.style.display = 'none';
        toggleHistoryButton.textContent = '履歴を表示';
    }
}

// ゲーム終了
function endGame(isWin) {
    gameState.isGameOver = true;
    clearInterval(gameState.timer);
    
    const playTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    if (isWin) {
        // ランキングに追加
        addToRanking(GAME_CONFIG.ANSWER_LENGTH, playTime, gameState.attempts);
        
        // 勝利音を再生
        setTimeout(() => audioSystem.playSuccessSound(), 500);
        
        resultTitleElement.textContent = '🎉 おめでとう！ 🎉';
        resultMessageElement.textContent = `${gameState.attempts}回で正解しました！時間: ${formatTime(playTime)}`;
        resultTitleElement.style.color = '#00b894';
        gameResultElement.style.borderColor = '#00b894';
    }
    // 無制限なのでゲームオーバーは削除
    
    correctAnswerElement.textContent = gameState.answer.join(' ');
    gameResultElement.style.display = 'block';
    
    updateUI();
}

// UI更新
function updateUI() {
    attemptsElement.textContent = gameState.attempts;
}

// ヒント機能
function showHint() {
    if (gameState.attempts === 0) {
        alert('まず1回予想してからヒントを使ってね！');
        return;
    }
    
    if (gameState.attempts >= 5) {
        const randomIndex = Math.floor(Math.random() * GAME_CONFIG.ANSWER_LENGTH);
        const hintJuice = gameState.answer[randomIndex];
        const juiceName = GAME_CONFIG.JUICE_NAMES[hintJuice];
        alert(`ヒント: ${randomIndex + 1}番目は${juiceName}(${hintJuice})です！`);
    } else {
        alert('ヒントは5回目以降から使えます！');
    }
}

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (gameState.isGameOver) return;
    
    if (e.key === 'Enter' && !submitButton.disabled) {
        submitGuess();
    } else if (e.key === 'Escape') {
        clearGuessSlots();
    }
    
    // 数字キーでフルーツ選択
    const num = parseInt(e.key);
    if (num >= 1 && num <= currentFruits.length) {
        const fruit = currentFruits[num - 1];
        addFruitToGuess(fruit);
    }
});

// ボタンイベントリスナー
applyDifficultyButton.addEventListener('click', applyDifficulty);
submitButton.addEventListener('click', submitGuess);
clearButton.addEventListener('click', clearGuessSlots);
toggleHistoryButton.addEventListener('click', toggleHistory);

// ユーザー関連イベントリスナー
savePlayerNameButton.addEventListener('click', savePlayerName);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        savePlayerName();
    }
});

// ランキング関連イベントリスナー
showRankingButton.addEventListener('click', showRanking);
closeRankingButton.addEventListener('click', () => {
    rankingSection.style.display = 'none';
});
rankingSlotCountSelect.addEventListener('change', showRanking);

newGameButton.addEventListener('click', initGame);
hintButton.addEventListener('click', showHint);
playAgainButton.addEventListener('click', () => {
    gameResultElement.style.display = 'none';
    initGame();
});

// 音響コントロールのイベントリスナー
const toggleBGMButton = document.getElementById('toggleBGM');
const toggleSFXButton = document.getElementById('toggleSFX');
const volumeSlider = document.getElementById('volumeSlider');

// ランキングモード関連の要素
const localRankingBtn = document.getElementById('localRankingBtn');
const onlineRankingBtn = document.getElementById('onlineRankingBtn');

// ランキングモード切り替え関数
function updateRankingModeUI() {
    localRankingBtn.classList.toggle('active', !isOnlineMode);
    onlineRankingBtn.classList.toggle('active', isOnlineMode);
    
    if (isOnlineMode && !db) {
        // オンラインモードだがFirebaseが利用できない場合
        isOnlineMode = false;
        localRankingBtn.classList.add('active');
        onlineRankingBtn.classList.remove('active');
        alert('オンライン機能が利用できません。ローカルモードに切り替えます。');
    }
}

// ランキングモードイベントリスナー
localRankingBtn.addEventListener('click', () => {
    isOnlineMode = false;
    updateRankingModeUI();
    if (rankingSection.style.display === 'block') {
        showRanking();
    }
});

onlineRankingBtn.addEventListener('click', () => {
    if (db) {
        isOnlineMode = true;
        updateRankingModeUI();
        if (rankingSection.style.display === 'block') {
            showRanking();
        }
    } else {
        alert('オンライン機能を使用するには、適切なFirebase設定が必要です。');
    }
});

toggleBGMButton.addEventListener('click', () => {
    const isEnabled = audioSystem.toggleBGM();
    toggleBGMButton.classList.toggle('active', isEnabled);
    toggleBGMButton.textContent = isEnabled ? '🎵 BGM' : '🔇 BGM';
});

toggleSFXButton.addEventListener('click', () => {
    const isEnabled = audioSystem.toggleSFX();
    toggleSFXButton.classList.toggle('active', isEnabled);
    toggleSFXButton.textContent = isEnabled ? '🔊 効果音' : '🔇 効果音';
});

volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audioSystem.setVolume(volume);
});

// 初期状態設定
toggleBGMButton.classList.add('active');
toggleSFXButton.classList.add('active');

// ユーザーの最初のクリックでBGM開始
let userInteracted = false;
document.addEventListener('click', () => {
    if (!userInteracted) {
        userInteracted = true;
        audioSystem.startBGM();
    }
});

// 初期化
initFirebase(); // Firebase初期化
updatePlayerDisplay();
updateRankingModeUI(); // ランキングモードUI初期化
applyDifficulty();
