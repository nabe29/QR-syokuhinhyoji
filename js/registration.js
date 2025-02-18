//※cloud FirestoreとStorageのルール設定も忘れずに！

// Firebaseの詳細情報
const firebaseConfig = {
  // ここにfirebaseのAPIキー
};

//userIDを取得
const userId = sessionStorage.getItem('userUid');
console.log('userID:', userId);

//storageのインスタンスを取得
const storage = firebase.storage();
//Firestoreのインスタンスを取得
const firestore = firebase.firestore();
//firestoreの格納する場所を設定
const firestorePath = firestore.collection('users').doc(userId).collection("sampleGoods");

//要素の結び付け
const backButton = document.getElementById('back'); //戻るボタン
const inputGoodsName = document.getElementById('goodsName'); //商品名
const inputGoodsFile = document.getElementById('file-input1'); //商品画像
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
const saveButton = document.getElementById('save'); //登録ボタン
const clearButton = document.getElementById('clear'); //クリアボタン


//戻るボタンを押したとき
backButton.addEventListener('click', function () {
  // ブラウザの履歴を1つ前に戻る
  window.history.back();
});


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


//saveButton(登録)ボタンが押されたら実行する処理
saveButton.addEventListener("click", function () {
  console.log('登録ボタンが押されました');

  //テキストボックスに記入された値を取得
  const textToGoodsName = inputGoodsName.value; //商品名
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

  //選択された画像ファイルを取得
  const goodsFile = inputGoodsFile.files[0]; //商品画像

  //チェックボックスの値を取得
  //配列"allergyValue"を宣言（選択されたアレルゲン品目の格納用）
  var allergyValue = new Array();
  //（どのアレルゲン品目にチェックが入ったか）チェックボックスの真偽値を一つずつ確認する
  for (let i = 0; i < inputAllergy.length; i++) {
    if (inputAllergy[i].checked == true) {
      //配列"allergyValue"にチェックされた値（アレルゲン品目）を格納
      allergyValue.push(inputAllergy[i].value);
    }
  }

  //商品名がnullの場合は処理を中断(登録不可)
  if (!textToGoodsName) {
    console.log('商品名が空の為、処理を中断しました。');
    let errorElement = document.getElementById('error'); //エラー文表示用
    errorElement.textContent = "※この項目は必須です。";

    alert('商品名が未記入です。\n商品名が未記入の場合は、登録できません')
    return;

    //商品名がnullではない場合
  } else {
    console.log('商品名が空ではないため、処理を続行します。');


    //★同じ商品名が既にある場合
    const firestorePath = firestore.collection('users').doc(userId).collection('sampleGoods');
    const processSnapshot = () => {
      return new Promise((resolve) => {
        const unsubscribe = firestorePath.onSnapshot((snapshot) => {
          const foundDocument = snapshot.docs.some((doc) => {
            let documentId = doc.id;
            console.log('documentID:', documentId);
            //入力した商品名と既にある商品名と重複した場合
            if (documentId === textToGoodsName) {
              console.log('合致したID:', documentId);
              console.log('商品名が重複しているため、処理を中断します。');
              alert('既に同じ商品名が登録されています。\n商品名を変更してください。');
              return true; // 見つかった場合は true を返す
            }
            return false; //見つからなかった場合は、falseを返す
          });

          unsubscribe(); // イベントリスナーを解除

          //falseの場合
          if (!foundDocument) {
            console.log('値はfalseでした');
            resolve(); // 同じ商品名が見つからなかった場合に実行
          }
        });
      });
    }
    //★同じ商品名がない場合、商品登録を行う
    processSnapshot().then(() => {
      console.log('商品名が重複しないため、処理を続行します。');

      //firestoreにアップロードするデータ構造を作成
      const dataToUpload = {
        商品の説明: textToDescription,
        栄養成分表示: textToComponent,
        注意書き: textToNotes,
        レンジ温め時間: {
          分: textToMinutes,
          秒: textToSecond,
        },
        販売元: textToSeller,
        カテゴリ: textToCategory,
        原材料ごとの産地: {
          原材料名: textToMaterial,
          産地: textToArea
        },
        アレルゲン: allergyValue, //アレルゲン品目（配列）
        値段: textToCost, // 原材料
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      const processSnapshot2 = () => {
        return new Promise((resolve) => {
          //firestoreに商品詳細データをアップロード
          firestorePath.doc(textToGoodsName).set(dataToUpload)
            .then(function () {
              console.log("firestoreへアップロードできました");
              resolve();
            }).catch(function (error) {
              console.log("firestoreへのアップロードでエラー発生。エラー内容:", error);
              resolve();
            });
        });
      }
      processSnapshot2().then(() => {
        const processSnapshot3 = () => {
          return new Promise((resolve) => {
            //商品画像データがnullではない場合
            if (goodsFile != "") {
              // 商品画像をアップロード
              uploadImageToFirestore(goodsFile, textToGoodsName)
                .then(foundDocument3 => {
                  console.log(foundDocument3, '画像アップロード関数実行完了');
                  resolve();
                })
                .catch(error => {
                  console.error("画像処理エラー:", error);
                  resolve(); // エラーが発生した場合も resolve しておく
                });

            } else {
              resolve();
            }

          });
        }
        processSnapshot3().then(() => {
          //登録完了後、記入欄をクリア
          clearInputFields();
          console.log('アップロード処理が終了したため、全ての記入欄をクリアにしました。');
  
          alert('商品情報を登録しました。')
          // QRコードを表示する画面に遷移
          window.location.href = `./qrCode.html?userID=${encodeURIComponent(userId)}&documentName=${encodeURIComponent(textToGoodsName)}`;
  
        });
      });
    });
  }
});


//clearButton(クリアボタン)が押されたら実行する処理
clearButton.addEventListener("click", function () {
  console.log('クリアボタンが押されました');
  clearInputFields(); //記入欄をすべてクリアする関数
  //アラート表示
  alert('入力欄をクリアにしました。');
});


//uploadImageToFirestore関数(画像データをアップロードする処理)
function uploadImageToFirestore(goodsFile, goodsName) {
  return new Promise((resolve, reject) => {

    // goodsFile が undefined の場合は処理をスキップ
    if (!goodsFile) {
      console.log(`画像データが無い為、商品画像をアップロードする処理はスキップします。`);
      resolve(true);
    }

    //storageの格納する場所を設定
    //商品画像の場所:   (userID)/images/(商品名)/goodsFolder/(格納する画像名.拡張子)
    const storagePath = storage.ref(`${userId}/images/${goodsName}/goodsFolder/${goodsFile.name}`);

    //storageに画像データをアップロード
    storagePath.put(goodsFile).then((snapshot) => {
      console.log(`storageへ商品画像をアップロード完了`);

      // Storageにある画像データをFirestoreドキュメントに関連付けるための情報(画像メタデータ)を取得
      const fileName = snapshot.metadata.name; // 画像ファイル名
      const filePath = snapshot.metadata.fullPath; // 画像ファイルのパス

      //firestoreに追加するデータ構造(画像メタデータ)を作成
      const updateData = {
        [`imgs.商品画像`]: {
          ファイル名: fileName,
          ファイルパス: filePath
        }
      };

      //firestoreに画像のメタデータをアップロード
      firestorePath.doc(goodsName).update(updateData)
        .then(() => {
          console.log(`商品画像のメタデータのアップロード完了`);
          resolve(true);
        }).catch((error) => {
          console.log(`商品画像のメタデータのアップロード失敗。エラー:`, error);
          reject(error);
        });

    }).catch((error) => {
      console.log(`storageへ商品画像をアップロード失敗。エラー:`, error);
      reject(error);
    });
  });

}


//clearInputFields関数(記入欄をすべてクリアする処理)
function clearInputFields() {

  // 各要素の値をクリア
  inputGoodsName.value = "";
  inputDescription.value = "";
  inputComponent.value = "";
  inputNotes.value = "";
  inputMinutes.value = "";
  inputSecond.value = "";
  inputSeller.value = "";
  inputCategory.value = "惣菜"; // カテゴリの初期値を設定
  inputMaterial.value = "";
  inputArea.value = "";
  inputCost.value = "";

  // チェックボックスの状態をクリア
  inputAllergy.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // 商品画像のプレビューをクリア
  document.getElementById('goodsPreview').src = "";

  // エラーメッセージをクリア
  document.getElementById('error').textContent = "";

}