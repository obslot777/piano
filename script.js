// すべての鍵盤要素を取得します
const keys = document.querySelectorAll('.key');

// --- ▼ここから大幅に変更▼ ---
// Web Audio API を使って、より低遅延な再生を目指します。
// AudioContextはオーディオ処理のすべてを管理する中心的なオブジェクトです。
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// デコード済みのオーディオデータ（AudioBuffer）を保存する場所
const audioBufferMap = {};

// すべての音声ファイルを非同期で読み込み、デコードする関数
async function loadAudioSamples() {
    const loadPromises = Array.from(keys).map(async (key) => {
        const note = key.dataset.note;
        try {
            const response = await fetch(`audio/${note}.mp3`);
            if (response.ok) { // 読み込みが成功したかチェック
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioBufferMap[note] = audioBuffer;
            }
            
        } catch (error) {
            console.error(`音声ファイルの読み込みに失敗しました: ${note}.mp3`, error);
        }
    });

    await Promise.all(loadPromises); // すべての読み込みが終わるのを待つ
    console.log("すべての音声ファイルの準備が完了しました。");
}

// ページ読み込み時に音声データの準備を開始
loadAudioSamples();

// 音を再生する関数
async function playNote(key) {
    // ブラウザの自動再生ポリシーのため、ユーザーの最初の操作でAudioContextを有効化します
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    // 鍵盤のdata-note属性から音名を取得します
    const note = key.dataset.note;
    const audioBuffer = audioBufferMap[note];

    if (!audioBuffer) {
        console.log(`音声データが準備できていません: ${note}`);
        return; // 音声データがなければ何もしない
    }

    const source = audioContext.createBufferSource(); // 音源を生成
    source.buffer = audioBuffer; // 音源にデータをセット
    source.connect(audioContext.destination); // 音源をスピーカーに接続
    source.start(0, 0.2); // 再生開始 (0.2秒の位置から)
}


// --- ▼マルチタッチ対応のためのイベントリスナー変更▼ ---
const piano = document.querySelector('.piano');

// マウスでのクリック操作用
piano.addEventListener('mousedown', e => {
    // クリックされた要素が鍵盤かどうかをチェック
    if (e.target.classList.contains('key')) {
        playNote(e.target);
    }
});

// タブレットやスマートフォンでのタッチ操作用
piano.addEventListener('touchstart', e => {
    e.preventDefault(); // 画面のスクロールなどのデフォルト動作を抑制

    // 新しく発生したすべてのタッチをループ処理
    for (const touch of e.changedTouches) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('key')) {
            playNote(element);
        }
    }
}, { passive: false }); // preventDefaultをtouchstartで使うために必要
