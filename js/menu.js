// Firebaseの詳細情報
const firebaseConfig = {
    // ここにfirebaseのAPIキー
};

// Firestoreインスタンスの取得
const firestore = firebase.firestore();
const storage = firebase.storage();

//userIDを取得
const userId = sessionStorage.getItem('userUid');
console.log('userID:', userId);

// Firestoreから前回のデータを保存する変数
let previousData = [];
let newData;

//Webページがロードされたら実行する処理
document.addEventListener('DOMContentLoaded', function () {

    //ログアウトボタン
    document.getElementById('outbtn').addEventListener("click", function () { //ログアウト
        firebase.auth().signOut().then(function () {
            //ログアウトできた時
            // ログアウト後にトップページに遷移
            window.location.href = "./index.html";
        }).catch(function (error) {
            //ログアウトできなかった時
            console.error("ログアウトできませんでした", error);
        });
    });

    // 新規商品登録ボタンクリックによる画面遷移処理
    document.getElementById('registrationButton').addEventListener('click', function () {
        // ボタンがクリックされたときの処理
        window.location.href = './registration.html';

    });


    // Firestoreからデータを取得（登録・更新順に昇順）
    const docRef = firestore.collection('users').doc(userId).collection("sampleGoods").orderBy("timestamp", "asc");
    // リアルタイムな変更を監視 
    docRef.onSnapshot((snapshot) => {
        newData = snapshot.docs.map((doc) => doc.id); // ドキュメントの名前を取得
        console.log(newData);//商品名配列
        const listElement = document.getElementById("dataList");

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
                    imageLink.href = `update&delete.html?documentName=${encodeURIComponent(itemName)}`;
        


                    //画像情報を追加
                    const metadata = doc.data().imgs;

                    if (metadata && metadata["商品画像"]) {
                        // ファイルパスからStorage上の画像を読み込んで表示
                        const imagePath = metadata["商品画像"].ファイルパス;
                        const imageName = metadata["商品画像"].ファイル名;



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
                    const usersDetailsPageURL = `https://ip222295app.web.app/goodsView.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(itemName)}`;
                    // // QRコードを生成して表示
                    // generateQRCode(usersDetailsPageURL);

                    // テキスト情報を追加
                    const detailsPageURL = `https://ip222295app.web.app/update&delete.html?documentName=${encodeURIComponent(itemName)}`;
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
});

// ★テキストを指定の文字数に制限する関数
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    } else {
        return text;
    }
}
