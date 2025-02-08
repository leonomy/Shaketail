// 選択された値を保存するオブジェクト
export const userChoices = {
    feeling: [],
    juice: [],
    taste: [],
    color: []
};

// データベースと連携
async function fetchCocktailData() {
    const response = await fetch("./data/cocktails.json");
    if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
    }
    return await response.json();
}

// 選択データを保存する関数
export function saveChoice(category, value) {
    const choices = userChoices[category];
    const index = choices.indexOf(value);
    console.log("デバッグ: category=", category, "value=", value);

    if (index === -1) {
        // 選択されていなければ追加
        choices.push(value);
    } else {
        // 選択されていれば削除
        choices.splice(index, 1);
    }

    console.log(`現在の${category}の選択:`, choices);
}

async function getMatchingCocktails() {
    const cocktails = await fetchCocktailData(); // データを取得
    const { feeling, juice, taste, color } = userChoices;

    console.log("ユーザーの選択:", { feeling, juice });
    console.log("前カクテルデータ", cocktails);

    // 正規化関数
    const normalize = value => (typeof value === 'string' ? value.trim().toLowerCase() : '');
    
    // フィルタリング処理
    let filteredCocktails = cocktails.filter(cocktail => {
        // 気分が一致しているか（気分が選択されていない場合はスキップ）
        const feelingMatch = !feeling.length || feeling.some(f => {
            return normalize(f) === normalize(cocktail.気分) || 
                   normalize(f) === normalize(cocktail.気分2);
        });
        return feelingMatch;
    });
    console.log("気分でフィルタリング:", filteredCocktails);

    // ジュースが一致しているか（ジュースが選択されていない場合はスキップ）
    filteredCocktails = filteredCocktails.filter(cocktail => {
        const juiceMatch = !juice.length || juice.some(j => {
            return normalize(j) === normalize(cocktail.ジュース) || 
                   normalize(j) === normalize(cocktail.ジュース2);
        });
        return juiceMatch;
    });
    console.log("ジュースでフィルタリング:", filteredCocktails);

    // オプション条件（味や色）
    if (typeof taste === "string" && taste.trim() !== "") {
    filteredCocktails = filteredCocktails.filter(cocktail => {
        const normalizedTaste = normalize(cocktail.味の系統);
        const normalizedUserTaste = normalize(taste);
        console.log("比較する味:", normalizedTaste, "ユーザーの味:", normalizedUserTaste);

        return normalizedTaste === normalizedUserTaste;
    });
    } else {
        console.log("味の選択がされていないためスキップ");
    }

    if (typeof color === "string" && color.trim() !== "") {
        filteredCocktails = filteredCocktails.filter(cocktail => {
            const normalizedColor1 = normalize(cocktail.色1);
            const normalizedColor2 = normalize(cocktail.色2);
            const normalizedUserColor = normalize(color);
            console.log("比較する色1:", normalizedColor1, "色2:", normalizedColor2, "ユーザーの色:", normalizedUserColor);

            return normalizedColor1 === normalizedUserColor || normalizedColor2 === normalizedUserColor;
        });
    } else {
        console.log("色の選択がされていないためスキップ");
    }
    console.log("味の値:", taste, "型:", typeof taste);
    console.log("色の値:", color, "型:", typeof color);
    console.log("最終フィルタリング:", filteredCocktails);

    return filteredCocktails;
}

// 診断結果を生成する関数
export async function generateDiagnosis() {
    const matchingCocktails = await getMatchingCocktails();

    if (matchingCocktails.length === 0) {
        document.getElementById('cocktail-image').style.display = 'none';
        return "該当するカクテルが見つかりませんでした。";
    }

    const randomIndex = Math.floor(Math.random() * matchingCocktails.length);
    const selectedCocktail = matchingCocktails[randomIndex];

        // カクテル画像を設定
        const cocktailImage = document.getElementById('cocktail-image');
        cocktailImage.src = selectedCocktail["画像パス"];
        cocktailImage.style.display = 'block'; // 表示

    return `
        あなたにおすすめのカクテルは「${selectedCocktail.カクテル名}」です！
        カクテル言葉: ${selectedCocktail.カクテル言葉}
        ベースのお酒: ${selectedCocktail.ベースのお酒}
    `;
}