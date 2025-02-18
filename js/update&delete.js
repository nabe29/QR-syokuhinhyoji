// Firebaseの詳細情報
const firebaseConfig = {
    apiKey: "AIzaSyCaaoJyYSuI5R0211Jj_VoftTyDaA3nT2I",
    authDomain: "it222293.firebaseapp.com",
    projectId: "it222293",
    storageBucket: "it222293.appspot.com",
    messagingSenderId: "307943257880",
    appId: "1:307943257880:web:9977434d41e9000b9cd06d",
    measurementId: "G-K8J4K585WF"
};
//firestoreのインスタンスを初期化。前準備。
firebase.initializeApp(firebaseConfig);

//userIDを取得
const userId = sessionStorage.getItem('userUid');
console.log('userID:', userId);

//storageのインスタンスを取得
const storage = firebase.storage();
//Firestoreのインスタンスを取得
const firestore = firebase.firestore();
//firestoreの格納する場所を設定
const firestorePath = firestore.collection('users').doc(userId).collection('sampleGoods');

const backBtn = document.getElementById('back');//戻るボタン
const inputgoodsName = document.getElementById('goodsName');
let inputGoodsFile = document.getElementById('file-input1'); //商品画像
const inputDescription = document.getElementById('description'); //商品説明
const inputComponent = document.getElementById('component'); //成分表示
const inputNotes = document.getElementById('notes'); //注意書き
const inputMinutes = document.getElementById('warmMinutes'); //温め時間(分)
const inputSecond = document.getElementById('warmSecond'); //温め時間(秒)
const inputSeller = document.getElementById('seller'); //販売元
const inputCategory = document.getElementById('category'); //カテゴリ
const inputMaterial = document.getElementById('material'); //原材料
const inputArea = document.getElementById('productionArea'); //産地
const inputAllergy = document.getElementsByName('allergy'); //アレルゲン
const inputCost = document.getElementById('cost'); //単価
const QR = document.getElementById('outputQRcode'); //QRコード表示
const updateButton = document.getElementById('update'); //更新ボタン
const deleteButton = document.getElementById('delete'); //削除ボタン

let imageRef;


// URLからパラメータを取得する関数(←よくわからん。後で調べる)
function getParameterByName(name, url) {
    //現在のページのURLが存在する場合、変数url
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// URLからgoodsNameパラメータ(商品名)を取得する(getParameterByName関数の呼出)
const goodsName = getParameterByName('documentName');

// ドキュメント名が存在するかチェック
if (goodsName) {
    console.log("商品名(documentパラメータ):", goodsName);
    //firestoreに登録されている商品データを取得
    firestorePath.doc(goodsName).get().then((doc) => {
        //ドキュメントが存在する場合
        if (doc.exists) {

            //フィールドのデータを画面上に表示
            console.log('商品名(Document名): ', doc.id);
            const data = doc.data();
            inputgoodsName.value = doc.id;
            inputDescription.value = data.商品の説明;
            inputComponent.value = data.栄養成分表示;
            inputNotes.value = data.注意書き;
            inputMinutes.value = data.レンジ温め時間.分;
            inputSecond.value = data.レンジ温め時間.秒;
            inputSeller.value = data.販売元;
            inputMaterial.value = data.原材料ごとの産地.原材料名;
            inputArea.value = data.原材料ごとの産地.産地;
            inputAllergy.value = data.アレルゲン;
            inputCost.value = data.値段;

            //選択されたカテゴリの値を取得し、表示
            for (let i = 0; i < inputCategory.options.length; i++) {
                console.log("length:", inputCategory.options.length);
                if (inputCategory.options[i].value === data.カテゴリ) {
                    console.log("value:", inputCategory.options[i].value);
                    inputCategory.selectedIndex = i;
                };
            };

            //配列をループして、一致したアレルゲン品目のcheckboxをtrueにする処理
            data.アレルゲン.forEach(function (word) {
                var checkbox = document.querySelector('input[value="' + word + '"]');
                if (checkbox) {
                    checkbox.checked = true;
                };
            });

            //画像をロードする関数を呼び出し
            loadImage(data);

            //登録商品のQRコードを生成し、表示する
            const usersDetailsPageURL = `https://ip222295app.web.app/detail.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(doc.id)}`;
            var qrcode = new QRCode(document.getElementById("printable-image"), {
                text: usersDetailsPageURL,
                width: 128,
                height: 128
            });

            //ドキュメントが存在しない場合
        } else {
            console.log('ドキュメント（商品）内の詳細データがないか、取得できていません');
        };

    }).catch((error) => {
        if (error && error.message.includes('Cannot read properties of undefined')) {
            console.log('まだ設定されていない為、表示されない画像データがあります。');
        } else {
            console.error("前ページから受け取ったドキュメント名に合致する商品名が取得できません。エラー:", error);
        };

    });
} else {
    // goodsNameパラメータが存在しない場合の処理
    console.error("goodsNameパラメータが存在しません。");
};

//画像をロードする処理
function loadImage(data) {
    if (data && data.imgs && data.imgs.商品画像 && data.imgs.商品画像.ファイル名 && data.imgs.商品画像.ファイルパス) {

        const fileName = data.imgs.商品画像.ファイル名;
        const downloadURL = data.imgs.商品画像.ファイルパス;
        console.log(`商品画像は、登録されています。`)
        console.log('ファイル名:', fileName);
        console.log('ファイルパス:', downloadURL)

        if (fileName && downloadURL) {
            imageRef = storage.ref(downloadURL);

            imageRef.getDownloadURL().then(function (url) {
                let preview = document.getElementById('goodsPreview');
                preview.src = url;
                preview.alt = fileName;
            }).catch((error) => {
                console.error(`商品画像を取得できませんでした。`, error);
            });
        }
    } else {
        console.log(`商品画像は、まだ設定されていないようです。`)
    }

}

//商品画像が選択、変更されたら実行する処理
inputGoodsFile.addEventListener('change', function (e) {
    console.log('画像が選択されました');
    //画像データを取得
    const file = e.target.files[0];
    //画像表示するimg要素の結び付け
    const preview = document.getElementById('goodsPreview');

    //画像データが存在する場合、画像データを画面上に表示する
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.onload = function () {
            URL.revokeObjectURL(preview.src);
        };
    }
});

//戻るボタンを押したとき
backBtn.addEventListener('click', function () {
    // ブラウザの履歴を1つ前に戻る
    window.history.back();
});

//★印刷ボタンを押したとき
document.getElementById('print-button').addEventListener('click', function () {
    // 表示中の画像をプリント
    var image = document.getElementById('printable-image').querySelector('img').src;
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

//更新ボタンを押したとき
updateButton.addEventListener('click', function () {
    console.log('更新ボタンが押されました');

    //テキストボックスに記入された値を取得
    const textToGoodsName = inputgoodsName.value; //商品名
    const textToDescription = inputDescription.value; //商品説明
    const textToComponent = inputComponent.value; //成分表示
    const textToNotes = inputNotes.value; //注意
    const textToMinutes = inputMinutes.value; //温め時間(分)
    const textToSecond = inputSecond.value; //温め時間(秒)
    const textToSeller = inputSeller.value; //販売元
    const textToCategory = inputCategory.value; //カテゴリ名
    const textToMaterial = inputMaterial.value; //原材料
    const textToArea = inputArea.value; //産地
    const textToCost = inputCost.value; //単価

    const processSnapshot = () => {
        return new Promise((resolve) => {
            //★商品名を変更する場合
            if (goodsName != textToGoodsName) {
                //古い商品名で登録されている（既存の）詳細データを取得
                firestorePath.doc(goodsName).get().then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        console.log('新しい商品名のドキュメントを作成しました。詳細データもコピーします。');
                        //新しい商品名で新しくドキュメントを作り、ドキュメント内に古い商品名の詳細データをコピーする
                        return firestore.collection('users').doc(userId).collection("sampleGoods").doc(textToGoodsName).set(data);
                    } else {
                        console.log('ドキュメント内に詳細データがありません');
                    };

                }).then(() => {
                    console.log('古い商品名のドキュメントを削除しました。');
                    //不要になった古い商品名のドキュメントを削除
                    return firestorePath.doc(goodsName).delete();
                }).then(() => {
                    console.log('商品名を更新しました。');
                    resolve();
                }).catch((error) => {
                    console.error("商品名を更新できませんでした。エラー:", error);
                    resolve();
                });

            } else {
                resolve();
            };
        });
    };

    //セットされた画像ファイルを取得
    const goodsFile = inputGoodsFile.files[0]; //商品画像

    //チェックボックスの値を取得
    //配列"allergyValue"を宣言（選択されたアレルゲン品目の格納用）
    var allergyValue = new Array();
    //（どのアレルゲン品目にチェックが入ったか）チェックボックスの真偽値を一つずつ確認する
    for (let i = 0; i < inputAllergy.length; i++) {
        if (inputAllergy[i].checked == true) {
            //配列"allergyValue"にチェックされた値（アレルゲン品目）を格納
            allergyValue.push(inputAllergy[i].value);
        };
    };
    processSnapshot().then(() => {
        //商品画像データがnullではない場合
        if (goodsFile != "") {
            // 商品画像をアップロード(uploadImageToFireBase関数の呼出)
            uploadImageToFirebase(goodsFile, textToGoodsName, imageRef);
        };

        //商品情報をfirestoreから取得	
        firestorePath.doc(textToGoodsName).get().then((doc) => {
            let updateDate = {};
            //更新データがあるかそれぞれ比較	
            if (doc.data().アレルゲン != allergyValue) {
                updateDate.アレルゲン = allergyValue
            }
            if (doc.data().商品の説明 != textToDescription) {
                updateDate.商品の説明 = textToDescription
            }
            if (doc.data().栄養成分表示 != textToComponent) {
                updateDate.栄養成分表示 = textToComponent
            }
            if (doc.data().注意書き != textToNotes) {
                updateDate.注意書き = textToNotes
            }
            // if (doc.data().レンジ温め時間.分 != textToMinutes) {
            //     updateDate.レンジ温め時間 = {
            //         ...updateDate.レンジ温め時間,
            //         分: textToMinutes
            //     };
            // }
            // if (doc.data().レンジ温め時間.秒 != textToSecond) {
            //     updateDate.レンジ温め時間 = {
            //         ...updateDate.レンジ温め時間,
            //         秒: textToSecond
            //     };
            // }
            if (doc.data().レンジ温め時間.分 != textToMinutes || doc.data().レンジ温め時間.秒 != textToSecond) {
                console.log('test')
                updateDate.レンジ温め時間 = {
                    ...updateDate.レンジ温め時間,
                    分: textToMinutes,
                    秒: textToSecond
                };
            }
            if (doc.data().販売元 != textToSeller) {
                updateDate.販売元 = textToSeller
            }
            if (doc.data().カテゴリ != textToCategory) {
                updateDate.カテゴリ = textToCategory
            }
            if (doc.data().原材料ごとの産地.原材料名 != textToMaterial) {
                updateDate.原材料ごとの産地 = {
                    ...updateDate.原材料ごとの産地,
                    原材料名: textToMaterial
                };
            }
            if (doc.data().原材料ごとの産地.産地 != textToArea) {
                updateDate.原材料ごとの産地 = {
                    ...updateDate.原材料ごとの産地,
                    産地: textToArea
                };
            }
            if (doc.data().値段 != textToCost) {
                updateDate.値段 = textToCost
            }

            //更新するデータがあった場合
            if (Object.keys(updateDate).length > 0) {
                console.log("更新するデータがありました。");
                updateDate.timestamp = firebase.firestore.FieldValue.serverTimestamp()

                //データを更新
                firestorePath.doc(textToGoodsName).update(updateDate).then(() => {
                    console.log("データが更新されました。");
                    alert('商品情報を更新しました。');
                    //メニュー画面に遷移
                    window.location.href = './menu.html';

                }).catch(function (error) {
                    console.error("更新中にエラーが発生しました: ", error);
                });
            } else {
                console.log("更新するデータはありません。");
            }
        }).catch((error) => {
            console.error("firestore上のデータが取得できません。エラー:", error);
        });
    });

});

//削除ボタンを押したとき
deleteButton.addEventListener('click', function () {
    //storageにある既存の商品画像データを削除(deleteImageToStorage関数の呼出)
    deleteImageToStorage(imageRef);

    //firestoreにある既存の商品詳細データを削除
    firestorePath.doc(goodsName).delete().then(function () {
        console.log("firestore上の商品詳細データが削除されました。");

        //アラート
        alert('商品情報を削除しました。');
        //メニュー画面に遷移
        window.location.href = './menu.html';

    }).catch(function (error) {
        console.error("削除中にエラーが発生しました: ", error);
    });

});

//uploadImageToFirebase関数(画像データをアップロードする処理)
function uploadImageToFirebase(goodsFile, goodsName, imageRef) {

    // goodsFile が undefined の場合は処理をスキップ
    if (!goodsFile) {
        console.log('更新画像データが無い為、画像をアップロードする処理はスキップします。');
        return;
    };

    //storageの格納する場所を設定
    //画像までのパス:   (userID)/images/(商品名)/goodsFolder/(格納する画像名.拡張子)
    const storageRef = storage.ref(`${userId}/images/${goodsName}/goodsFolder/${goodsFile.name}`);

    //画像削除後に新しい画像をアップロードする処理
    // Storageにある古い画像を削除
    deleteImageToStorage(imageRef)
        .then(() => {
            // Storageに新しい画像データをアップロード
            return storageRef.put(goodsFile);
        })
        .then((snapshot) => {
            console.log(`storageへ商品画像をアップロード完了`);
            // Storageにある画像データをFirestoreドキュメントに関連付けるための情報を取得
            const fileName = snapshot.metadata.name; // 画像ファイル名
            const filePath = snapshot.metadata.fullPath; // 画像ファイルのパス

            //firestoreに追加するデータ構造を作成
            const updateData = {
                [`imgs.商品画像`]: {
                    ファイル名: fileName,
                    ファイルパス: filePath
                }
            };
            console.log('updateData:', updateData);


            // firestoreに新しい画像メタデータをアップロード
            return firestorePath.doc(goodsName).update(updateData);
        })
        .then(() => {
            console.log(`商品画像のメタデータの更新アップロード完了`);
        })
        .catch((error) => {
            console.error('エラーが発生しました:', error);
        });
}

//deleteImageToStorage関数(storage上にある既存の画像を削除する関数)
function deleteImageToStorage(imageRef) {
    return new Promise((resolve, reject) => {
        if (imageRef) {
            imageRef.delete().then(() => {
                console.log('元ある画像の削除完了');
                resolve();
            }).catch((error) => {
                console.log('元ある画像の削除でエラー発生。エラー:', error);
                reject(error);
            });
        } else {
            console.log('元の画像は設定されていません。');
            resolve();
        }
    });
}

