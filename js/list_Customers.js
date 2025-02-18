const firebaseConfig = {
    // ここにfirebaseのAPIキー
};

// Firestoreインスタンスの取得
const firestore = firebase.firestore();
const storage = firebase.storage();

const urlParams = new URLSearchParams(window.location.search);
// 特定のクエリパラメータの値を取得
const userId = urlParams.get('userID');
console.log('userID:', userId);


// Firestoreから前回のデータを保存する変数
let previousData = [];
let newData;
const listElement = document.getElementById("dataList");


//Webページがロードされたら実行する処理
document.addEventListener('DOMContentLoaded', function () {

    dataPreview();
});


//firestoreに保存されている商品一覧を表示する処理
function dataPreview(){
    // Firestoreからデータを取得（登録・更新順に昇順）
    const docRef = firestore.collection('users').doc(userId).collection("sampleGoods").orderBy("timestamp", "asc");
    // リアルタイムな変更を監視 
    docRef.onSnapshot((snapshot) => {
        newData = snapshot.docs.map((doc) => doc.id); // ドキュメントの名前を取得
        console.log(newData);//商品名配列

        // 新しいデータだけをフィルタリング
        const filteredData = newData.filter(item => !previousData.includes(item));


        filteredData.forEach((itemName) => {
            // メタデータを取得
            const metadataRef = firestore.collection('users').doc(userId).collection("sampleGoods").doc(itemName);

            metadataRef.get().then((doc) => {

                if (doc.exists) {

                    // div要素を作成
                    const itemContainer = document.createElement("div");
                    itemContainer.classList.add("itemContainer");

                    // リンク要素を作成
                    const imageLink = document.createElement("a");
                    imageLink.href = `detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(itemName)}`;
        


                    //画像情報を追加
                    const metadata = doc.data().imgs;

                    if (metadata && metadata.商品画像) {
                        // ファイルパスからStorage上の画像を読み込んで表示
                        const imagePath = metadata.商品画像.ファイルパス;
                        const imageName = metadata.商品画像.ファイル名;



                        const imageRef = storage.ref(imagePath);
                        imageRef.getDownloadURL().then((url) => {
                            const imgElement = document.createElement("img");
                            imgElement.src = url;
                            imgElement.alt = imageName;
                            // ★idを追加
                            imgElement.id = "itemImg"; 

                            imageLink.appendChild(imgElement);
                        }).catch((error) => {
                            console.error("画像の読み込みエラー:", error);
                        });

                    } else {
                        console.log(`商品名『${itemName}』は画像データが設定されていません`);
                        const imgElement = document.createElement("img");
                        imgElement.src = "images/NotImage.png";
                        imgElement.alt = "Not Image";
                        //★id追加
                        imgElement.id = "itemImg";
                        imageLink.appendChild(imgElement);
                    }
                    itemContainer.appendChild(imageLink);
                    //QRコード情報を追加
                    // detailsPageURLに代入されるURLのHTMLが自分のPC内の正しい位置にないとNotFoundになる
                    //デプロイする際はhttps://ip222295app.web.app/の数字の部分を自分の学籍番号にしないと動かないと思う。QRコードを読み取ることに関しては問題なし。
                

                    // テキスト情報を追加
                    const detailsPageURL = `https://ip222295app.web.app/detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(itemName)}`;
                    // ドキュメント名をリンクに
                    const link = document.createElement("p");
                    link.textContent = itemName;
                    // ★10文字に制限
                    link.textContent = truncateText(itemName, 10); 
                    link.href = detailsPageURL;  // リンク先
                    //★id追加
                    link.id = "linktext";
                    itemContainer.appendChild(link);

                    //リストに追加
                    listElement.appendChild(itemContainer);

                } else {
                    console.log("商品データが存在しません", itemName);
                }
            }).catch((error) => {
                console.error("メタデータの取得エラー:", error);
            });

        });
        // 現在のデータを保存
        previousData = newData;
    });
}


//キーワード検索されたら一致するキーワードを持つ商品を抽出する処理
document.getElementById('keywordSearchBtn').addEventListener('click', function () {
    console.log('キーワード検索の検索ボタンが押されました');

    // テキストボックスから入力された値を取得
    const inputSearch = document.getElementById("inputSearch").value;
    console.log('検索ワード:', inputSearch);
    

    // firestoreのコレクション名 "sampleGoods" からデータを取得
    firestore.collection('users').doc(userId).collection("sampleGoods").get().then((querySnapshot) => {
        //商品一覧に商品が表示されている場合
        if (listElement.firstChild) {
            while (listElement.firstChild) {
                //div要素内に表示されている商品データを削除
                listElement.removeChild(listElement.firstChild);
            }
        } else {
            console.error('指定されたIDのdiv要素が存在しません。');
        }

        console.log('登録商品数:', querySnapshot.size);
        var notHitCount = 0; //一致しなかった商品数をカウントする変数
        var total = querySnapshot.size; //登録商品総数を格納する変数
        //"sampleGoods"内のドキュメントを一件ずつ実行
        querySnapshot.forEach((doc) => {
            //値を取得
            const goodsName = doc.id; //ドキュメント名(商品名)
            const data = doc.data(); //フィールド値(原材料、アレルゲン等)
            console.log('ドキュメント名:', goodsName);
            // 取得したデータが空ではない　&& 検索キーワードが取得したデータのなかに含まれている場合
            if (
                goodsName && toHalfWidth(goodsName).includes(toHalfWidth(inputSearch)) ||
                data.商品の説明 && toHalfWidth(data.商品の説明).includes(toHalfWidth(inputSearch)) ||
                data.注意書き && toHalfWidth(data.注意書き).includes(toHalfWidth(inputSearch)) ||
                data.販売元 && toHalfWidth(data.販売元).includes(toHalfWidth(inputSearch)) ||
                data.カテゴリ && toHalfWidth(data.カテゴリ).includes(toHalfWidth(inputSearch)) ||
                data.原材料ごとの産地 && data.原材料ごとの産地.産地 && toHalfWidth(data.原材料ごとの産地.産地).includes(toHalfWidth(inputSearch)) ||
                data.原材料ごとの産地 && data.原材料ごとの産地.原材料名 && toHalfWidth(data.原材料ごとの産地.原材料名).includes(toHalfWidth(inputSearch)) ||
                data.アレルゲン && toHalfWidth(data.アレルゲン).includes(toHalfWidth(inputSearch))
            ) {
                console.log(`${goodsName}は検索キーワードに一致しました`)


                // div要素を作成
                const itemContainer = document.createElement("div");
                itemContainer.classList.add("itemContainer");

                // リンク要素を作成
                const imageLink = document.createElement("a");
                imageLink.href = `detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(goodsName)}`;

                console.log(imageLink.href)

                //画像情報を追加
                const metadata = doc.data().imgs;
                console.log(metadata)

                //商品画像が設定されている場合
                if (metadata && metadata["商品画像"]) {
                    // ファイルパスからStorage上の画像を読み込んで表示
                    console.log(`商品名『${goodsName}』は画像データが設定されています`);
                    const imagePath = metadata["商品画像"].ファイルパス;
                    const imageName = metadata["商品画像"].ファイル名;
                    console.log(imagePath)
                    console.log(imageName)

                    const imageRef = storage.ref(imagePath);
                    imageRef.getDownloadURL().then((url) => {
                        const imgElement = document.createElement("img");
                        console.log(url)

                        imgElement.src = url;
                        imgElement.alt = imageName;
                        // ★idを追加
                        imgElement.id = "itemImg";

                        imageLink.appendChild(imgElement);
                    }).catch((error) => {
                        console.error("画像の読み込みエラー:", error);
                    });

                } else {
                    console.log(`商品名『${goodsName}』は画像データが設定されていません`);
                    const imgElement = document.createElement("img");
                    imgElement.src = "images/NotImage.png";
                    imgElement.alt = "Not Image";
                    //★id追加
                    imgElement.id = "itemImg";
                    imageLink.appendChild(imgElement);
                }
                itemContainer.appendChild(imageLink);
                //QRコード情報を追加
                // detailsPageURLに代入されるURLのHTMLが自分のPC内の正しい位置にないとNotFoundになる
                //デプロイする際はhttps://ip222295app.web.app/の数字の部分を自分の学籍番号にしないと動かないと思う。QRコードを読み取ることに関しては問題なし。

                // テキスト情報を追加
                const detailsPageURL = `https://ip222295app.web.app/detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(goodsName)}`;

                // ドキュメント名をリンクに
                const link = document.createElement("p");
                link.textContent = goodsName;
                // ★10文字に制限
                link.textContent = truncateText(goodsName, 10);
                link.href = detailsPageURL;  // リンク先
                //★id追加
                link.id = "linktext";
                itemContainer.appendChild(link);

                //リストに追加
                listElement.appendChild(itemContainer);
            } else {
                console.log(`${goodsName}は検索キーワードに一致しませんでした`);
                notHitCount = notHitCount + 1;
                console.log('登録商品総数', total, '一致しなかった件数', notHitCount);
                if (total == notHitCount) {
                    console.log('test')
                    const NotMessage = document.createElement('p');
                    NotMessage.textContent = `検索キーワードに一致する商品はありませんでした\n違うキーワードでも検索してみて下さい`;
                    listElement.appendChild(NotMessage);
                }
            }
            // }).catch((error) => {
            //     console.error("商品データの取得エラー:", error);
        });
        if (!listElement.firstChild) {
            const NotMessage = document.createElement('p');
            NotMessage.textContent = '一致する検索キーワードはありませんでした'
            listElement.appendChild(NotMessage);
        }
    });

});


//アレルギー検索されたら一致するアレルギーを持つ商品以外を抽出する処理
document.getElementById('searchBtn').addEventListener('click', function () {
    console.log('アレルゲンの検索ボタンが押されました');
    //商品一覧に商品が表示されている場合、いったん削除する処理
    if (listElement) {
        while (listElement.firstChild) {
            //div要素内に表示されている商品データを削除
            listElement.removeChild(listElement.firstChild);
        }
    } else {
        console.error('指定されたIDのdiv要素が存在しません。');
    }

    // チェックボックスの値を取得
    var selectFood = document.getElementsByName('allergy');
    var allergyValue = new Array();
    //全てのチェックボックスを確認
    for (let k = 0; k < selectFood.length; k++) {
        //チェックボックスがtrueの場合
        if (selectFood[k].checked == true) {
            //チェックされたアレルゲンの値を配列allergyValueに格納
            allergyValue.push(selectFood[k].value);
        }
    }
    console.log('☑されたアレルゲン:', allergyValue)

        let uniqueNotPreviewList;
        const processSnapshot = () => {
            return new Promise((resolve) => {
                // firestoreのコレクション名 "sampleGoods" からデータを取得
                firestore.collection('users').doc(userId).collection("sampleGoods").get().then((querySnapshot) => {
                    var notPreviewList = new Array(); //表示しない商品リスト配列
                    //表示しない商品を探す処理
                    //"sampleGoods"内のドキュメントを一件ずつ実行
                    querySnapshot.forEach((doc) => {
                        //値を取得
                        const goodsName = doc.id; //ドキュメント名(商品名)
                        const data = doc.data(); //フィールド値(原材料、アレルゲン等)
                        console.log('検索する商品名:', goodsName);
                        //チェックされた全てのアレルゲンの値を確認する
                        for (let i = 0; i < allergyValue.length; i++) {
                            console.log(`${allergyValue[i]}が含まれていないかを検索しています`)
                            
                            if (data.アレルゲン.includes(allergyValue[i])) {
                                console.log(`${goodsName}には${allergyValue[i]}が含まれていました`)
                                //表示しない商品リストに追加
                                notPreviewList.push(goodsName);
                            } else {
                                console.log(`${goodsName}には${allergyValue[i]}が含まれませんでした`)
                            }
                        }
                    })
                    //表示しない商品リストの配列内で重複するデータを削除
                    uniqueNotPreviewList = notPreviewList.filter((value, index, self) => self.indexOf(value) === index);
                    console.log('表示しない商品:', uniqueNotPreviewList);
                    resolve();
                })
            });
        }
        processSnapshot().then(() => {
            firestore.collection('users').doc(userId).collection("sampleGoods").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const goodsName = doc.id; //ドキュメント名(商品名)

                    //表示しないリストに商品名が含まれている場合
                    if (uniqueNotPreviewList.includes(goodsName)) {
                        console.log(`${goodsName}は表示しません`);
                    } else {
                        if (!listElement.firstChild && !allergyValue.length === 0) {
                            const searchMessage = document.createElement('p');
                            searchMessage.textContent = `${allergyValue}が含まれない商品を検索`;
                            listElement.appendChild(searchMessage);
                        }else{
                            console.log('アレルギー☑は空欄でした');
                        }
                        // div要素を作成
                        const itemContainer = document.createElement("div");
                        itemContainer.classList.add("itemContainer");

                        // リンク要素を作成
                        const imageLink = document.createElement("a");
                        imageLink.href = `detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(goodsName)}`;
                        console.log(imageLink.href)

                        //画像情報を追加
                        const metadata = doc.data().imgs;

                        if (metadata && metadata["商品画像"]) {
                            // ファイルパスからStorage上の画像を読み込んで表示
                            const imagePath = metadata["商品画像"].ファイルパス;
                            const imageName = metadata["商品画像"].ファイル名;
                            console.log(imagePath)
                            console.log(imageName)



                            const imageRef = storage.ref(imagePath);
                            imageRef.getDownloadURL().then((url) => {
                                const imgElement = document.createElement("img");
                                console.log(url)

                                imgElement.src = url;
                                imgElement.alt = imageName;
                                // ★idを追加
                                imgElement.id = "itemImg";

                                imageLink.appendChild(imgElement);
                            }).catch((error) => {
                                console.error("画像の読み込みエラー:", error);
                            });

                        } else {
                            console.log(`商品名『${goodsName}』は画像データが設定されていません`);
                            const imgElement = document.createElement("img");
                            imgElement.src = "images/NotImage.png";
                            imgElement.alt = "Not Image";
                            //★id追加
                            imgElement.id = "itemImg";
                            imageLink.appendChild(imgElement);
                        }
                        itemContainer.appendChild(imageLink);
                        
                        // テキスト情報を追加
                        const detailsPageURL = `https://ip222295app.web.app/detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(doc.id)}`;
                        // ドキュメント名をリンクに
                        const link = document.createElement("p");
                        link.textContent = goodsName;
                        // ★10文字に制限
                        link.textContent = truncateText(goodsName, 10);
                        link.href = detailsPageURL;  // リンク先
                        //★id追加
                        link.id = "linktext";
                        itemContainer.appendChild(link);

                        //リストに追加
                        listElement.appendChild(itemContainer);
                    }

                })
                if (!listElement.firstChild) {
                    const NotMessage = document.createElement('p');
                    NotMessage.textContent = `申し訳ございませんが、${allergyValue}が含まれない商品はありませんでした\n違うキーワードでも検索してみて下さい`;
                    listElement.appendChild(NotMessage);

                }
            })
        })
    
});


// ★テキストを指定の文字数に制限する関数
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    } else {
        return text;
    }
}


// 全角文字を半角文字に変換する関数
function toHalfWidth(str) {
    if (typeof str !== 'string') {
        return str;
    }
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}


