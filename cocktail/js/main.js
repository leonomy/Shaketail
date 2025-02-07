import { userChoices, saveChoice, generateDiagnosis } from './diagnosis.js';

/*
function ClickRequestDeviceSensor() {
    // ユーザーに「許可」を求めるダイアログを表示
    DeviceOrientationEvent.requestPermission().then( function( response ){
        if ( response === 'granted' ) {
            // 許可された場合のみイベントハンドラを追加できる
            window.addEventListener("deviceorientation", deviceOrientation );
            // 画面上部のボタンを消す
            $('#sensorrequest').css('display', 'none');
        }
    }).catch(function(e){
        console.log(e);
    })
}

// DeviceOrientationEvent オブジェクトが有効な環境か？　をチェック
if ( window.DeviceOrientationEvent ){
    // iOS13 以上であれば DeviceOrientationEvent.requestPermission 関数が定義されているので、ここで条件分岐
    if ( DeviceOrientationEvent.requestPermission && typeof DeviceOrientationEvent.requestPermission === 'function' ){
      // iOS 13 以上の場合、
      // 画面上部に「センサーの有効化」ボタンを追加
      var banner = '<div  style="z-index: 1; position: absolute; width: 100%; background-color: rgb(0, 0, 0);" onclick="ClickRequestDeviceSensor();" id="sensorrequest"><p style="color: rgb(0, 0, 255);">センサーの有効化</p></div>';
      $('body').prepend( banner );
    } else {
      //.Android または iOS 13 未満の場合、
      // DeviceOrientationEvent オブジェクトが有効な場合のみ、deviceorientation イベント発生時に deviceOrientaion 関数がハンドリングするよう登録
      window.addEventListener( "deviceorientation", deviceOrientation );
    }
}

// deviceorientation イベントハンドラ
function deviceOrientation( e ){
    // 通常の処理を無効にする
    e.preventDefault();
  
    // スマホの向きを取得
    var dir = e.alpha;   // 北極方向に対する向きの角度
    var fb = e.beta;      // 前後の傾き角度
    var lr = e.gamma;  // 左右の傾き角度  
} */

class PageNavigator {
    constructor(pages) {
        this.pages = pages; // ページIDの配列
        this.currentPageIndex = 0; // 現在のページのインデックス
        this.previousPageIndex = null; // 前のページのインデックス
    }

    // ページを表示する
    showPage(pageId) {
        const pageIndex = this.pages.indexOf(pageId);
        if (pageIndex === -1) {
            console.error(`ページが見つかりません: ${pageId}`);
            return;
        }

        // 前のページを記録
        if (this.currentPageIndex !== null) {
            this.previousPageIndex = this.currentPageIndex;
        }

        // 現在のページを更新
        this.currentPageIndex = pageIndex;

        // ページ表示を切り替え
        this.pages.forEach((id, index) => {
            const page = document.getElementById(id);
            page.style.display = index === pageIndex ? "block" : "none";
        });

        // プログレスバーを更新
        this.updateProgress();
    }

    // プログレスバーを更新する
    updateProgress() {
        const progress = (this.currentPageIndex / (this.pages.length - 2)) * 100;
        const currentPage = document.getElementById(this.pages[this.currentPageIndex]);
        const progressBar = currentPage.querySelector(".progress");
        if (progressBar) {
            progressBar.style.width = progress + "%";
        }
    }
}

// ページナビゲーターの初期化
const pageNavigator = new PageNavigator(["page1", "page2", "page3", "page4", "page5"]);

// 全てのフォームの送信動作を防ぐ
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault(); // デフォルト動作を防止
        console.log("フォーム送信動作を防止しました");
    });
});

// 選択ボタンにクリックイベントを追加
document.querySelectorAll(".toggle_button .choice").forEach(button => {
    button.addEventListener("click", function (e) {
        e.preventDefault(); // フォーム送信を防ぐ

        // ボタンが属するカテゴリ（例: feeling, juice など）を取得
        const category = button.closest(".toggle_button").parentElement.id;
        const value = button.value;

        // 選択を保存
        saveChoice(category, value);

        // ボタンの見た目を切り替え
        button.classList.toggle("selected");

        // デバッグ用ログ
        console.log(`選択カテゴリ: ${category}, 選択値: ${value}`);
        console.log("現在の選択状態:", userChoices);
    });
});

// 初期ページを表示
pageNavigator.showPage("page1");

// 次へボタンの設定
document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", (e) => {
        const targetPage = button.getAttribute("data-page");
        pageNavigator.showPage(targetPage);
    });
});

// 戻るボタンの設定
document.querySelectorAll(".back").forEach(button => {
    button.addEventListener("click", () => {
        const prevPageId = button.getAttribute("data-prev"); // 戻り先のページIDを取得
        if (prevPageId) {
            pageNavigator.showPage(prevPageId); // 戻り先のページを表示
        } else {
            alert("戻るページが設定されていません。");
        }
    });
});

// 各選択ボタンにイベントリスナーを追加
document.querySelectorAll(".choice").forEach(button => {
    button.addEventListener("click", function (e) {
        e.preventDefault();
        const category = button.parentElement.id;
        const value = button.value;
        saveChoice(category, value);

        button.classList.toggle("selected");
    });
});

// シェイクボタンの設定（初期化処理）
document.getElementById("shake").addEventListener("click", function () {
    // 診断画面に遷移
    pageNavigator.showPage("page2");

    // .choiceの状態をリセット
    document.querySelectorAll(".choice").forEach(button => {
        button.classList.remove("selected");
    });

    // userChoicesをリセット
    for (const key in userChoices) {
        if (Array.isArray(userChoices[key])) {
            userChoices[key] = [];
        } else {
            userChoices[key] = "";
        }
    }

    console.log("状態を初期化しました:", userChoices);
});

// `page5` からトップページへの戻りボタン
document.getElementById('top').addEventListener('click', function () {
    showPage('page1'); // トップページに戻る
    addShakeListener(); // シェイク検出を再有効化
    console.log("状態を初期化しました");
});

// 診断ボタンをタップした場合の動作（既存のコードも保持）
document.getElementById('diagnosis').addEventListener('click', async function () {
    const result = await generateDiagnosis();
    document.getElementById('result-text').textContent = result;
    showPage('page5'); // page5 へ遷移

    // シェイク検出を停止（冗長防止）
    removeShakeListener();
});