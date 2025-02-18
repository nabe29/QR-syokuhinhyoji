//使用するfirebase情報(プロジェクトの設定からコピペする)
const firebaseConfig = {
    // ここにfirebaseのAPIキー
};

// Firestoreのインスタンスを取得
const firestore = firebase.firestore();
//userIDを取得
const userId = sessionStorage.getItem('userUid');
console.log('userID:', userId);


let itemName;
let userID = userId;

// メタデータを取得
const metadataRef = firestore.collection('users').doc(userId).collection("sampleGoods");

metadataRef.orderBy("timestamp", "desc").limit(1).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // forEach 内で itemName に値をセット
        itemName = doc.id;
        userID = userId;

        // ここで itemName と userID を使用できる
        console.log('userID',userID,itemName);
        console.log('itemName',itemName);

        //★★★★★★★★★★★★★★★★
        const product = document.getElementById("product");
        product.textContent = itemName;
        //★★★★★★★★★★★★★★★★

        //QRコード情報を追加
        // detailsPageURLに代入されるURLのHTMLが自分のPC内の正しい位置にないとNotFoundになる
        //デプロイする際はhttps://ip222295app.web.app/の数字の部分を自分の学籍番号にしないと動かないと思う。QRコードを読み取ることに関しては問題なし。
        const usersDetailsPageURL = `https://ip222295app.web.app/detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(itemName)}`;
        // QRコードを生成して表示
        generateQRCode(usersDetailsPageURL);

    });
}).catch((error) => {
    console.error("データ取得エラー:", error);
});


// QRコードを生成して表示する関数
function generateQRCode(url) {
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: url,
        width: 128,
        height: 128
    });
}

//「メニューに画面へ」ボタンを押したとき
const menuBtn = document.getElementById('menu');
menuBtn.addEventListener('click', function () {
    window.location.href = './menu.html'
});
//★印刷ボタンを押したとき
document.getElementById('print-button').addEventListener('click', function () {
    // 表示中の画像をプリント
    var image = document.getElementById('qrcode').querySelector('img').src;
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Image</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { text-align: center; }');
    printWindow.document.write('img { display: block; margin: auto; width: auto; height: 100%;}');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<img src="' + image + '">');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});

// 戻るボタンを押したとき
const backBtn = document.getElementById('back');
backBtn.addEventListener('click', function () {
    window.location.href = './menu.html'
});
