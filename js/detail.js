const firebaseConfig = {
    // ここにfirebaseのAPIキー
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// storageへの参照準備
const storagePath = firebase.storage();

// Create a Firestore reference
const db = firebase.firestore();

// Get document name from the URL query string

const urlParams = new URLSearchParams(window.location.search);

// 特定のクエリパラメータの値を取得
const userId = urlParams.get('userID');
const docName = urlParams.get('documentName');

//☆
// const userId ='vgJwF6QVN0ZZsxMrbQmLjMAFEia2';
// const docName ='幕の内弁当';

console.log("user" + userId);
console.log("doc" + docName);


// Check if docName is present in the query string
if (docName) { //   追加行
    // Reference to the specific document in the "samplesGoods" collection 追加行
    console.log('docName:', docName);
    const collectionRef = db.collection('users').doc(userId).collection("sampleGoods");


    // Retrieve data from Firestore

    collectionRef.doc(docName).get().then(function (doc) {
        console.log('doc:', doc);
        if (doc.exists) {
            // Access the data fields
            var data = doc.data();

            // Display data in the HTML elements
            document.getElementById('goodsName').innerText = docName
            // document.getElementById('description').innerText = data.商品の説明 || '';

            // 商品の説明
            var description = data.商品の説明 || '';
            document.getElementById('description').innerText = description;
            //栄養成分表示
            var component = data.栄養成分表示 || '';
            document.getElementById('component').innerText = component;
            //注意書き
            var notes = data.注意書き || '';
            document.getElementById('notes').innerText = notes;
            //値段
            var cost = data.値段 || '';
            document.getElementById('cost').innerText = cost;
            //販売元
            var seller = data.販売元 || '';
            document.getElementById('seller').innerText = seller;
            //レンジの温め時間

            var warmMinutes = data.レンジ温め時間.分 || '';
            var warmSeconds = data.レンジ温め時間.秒 || '';

            console.log("分"+ warmMinutes);
            console.log("秒"+ warmSeconds);

            var displayText = '';

            if (warmMinutes !== '' && warmSeconds !== '') {
                displayText = warmMinutes + "分" + warmSeconds + "秒";
            } else if (warmMinutes !== '') {
                displayText = warmMinutes + "分";
            } else if (warmSeconds !== '') {
                displayText = warmSeconds + "秒";
            }

            document.getElementById('warm').innerText = displayText;


            // 商品の説明が空であれば、対応する h3 タグを非表示にする
            var descriptionH3 = document.querySelector(".item h3.description");
            if (description.trim() === "") {
                descriptionH3.style.display = "none";
            } else {
                descriptionH3.style.display = "block";
            }

            // 栄養成分表示が空であれば、対応する h3 タグを非表示にする
            var componentH3 = document.querySelector(".item h3.component");
            if (component.trim() === "") {
                componentH3.style.display = "none";
            } else {
                componentH3.style.display = "block";
            }

            // 注意書きが空であれば、対応する h3 タグを非表示にする
            var notesH3 = document.querySelector(".item h3.notes");
            if (notes.trim() === "") {
                notesH3.style.display = "none";
            } else {
                notesH3.style.display = "block";
            }

            // 値段が空であれば、対応する h3 タグを非表示にする
            var costH3 = document.querySelector(".item h3.cost");
            if (cost.trim() === "") {
                costH3.style.display = "none";
            } else {
                costH3.style.display = "block";
            }

            // 販売元が空であれば、対応する h3 タグを非表示にする
            var sellerH3 = document.querySelector(".item h3.seller");
            if (seller.trim() === "") {
                sellerH3.style.display = "none";
            } else {
                sellerH3.style.display = "block";
            }

            // レンジの温め時間が空であれば、対応する h3 タグを非表示にする
            var warmH3 = document.querySelector(".item h3.warm");
            if (warmMinutes.trim() === "" && warmSeconds.trim() === "") {
                warmH3.style.display = "none";
            } else {
                warmH3.style.display = "block";
            }



            //画像情報を追加
            const metadata = doc.data().imgs;


            // if (metadata && metadata["商品画像"]) {
            if (metadata && metadata.商品画像) {
                // ファイルパスからStorage上の画像を読み込んで表示
                // const imagePath = metadata["商品画像"].ファイルパス;
                // const imageName = metadata["商品画像"].ファイル名;
                const imagePath = metadata.商品画像.ファイルパス;
                const imageName = metadata.商品画像.ファイル名;


                const imageRef = storagePath.ref(imagePath);
                imageRef.getDownloadURL().then((url) => {
                    const imgElement = document.getElementById("goodsPreview");
                    imgElement.src = url;
                    imgElement.alt = imageName;

                    // imageLink.appendChild(imgElement);
                }).catch((error) => {
                    console.error("画像の読み込みエラー:", error);
                });

            } else {
                console.log(`商品名『${docName}』は画像データが設定されていません`);
                const imgElement = document.getElementById("goodsPreview");
                imgElement.src = "images/NotImage.png";
                imgElement.alt = "Not Image";

                // imageLink.appendChild(imgElement);
            }

            // アレルゲン
            var allergyList = Object.values(data.アレルゲン || {}).filter(Boolean);
            document.getElementById('allergy').innerText = allergyList.join(', ');
            console.log("allergyList:", allergyList);

            // アレルゲンが空であれば、対応する h3 タグを非表示にする
            var allergyListH3 = document.querySelector(".item h3.allergy");
            if (allergyList.length === 0) {
                allergyListH3.style.display = "none";
            } else {
                allergyListH3.style.display = "block";
            }

            // カテゴリ名
            var category = data.カテゴリ || '';
            if (category instanceof Object) {
                // カテゴリがオブジェクトの場合、nullでないフィールドのみを表示
                document.getElementById("category").innerText = Object.values(category).filter(value => value !== null).join('');
            } else {
                document.getElementById("category").innerText = category;
            }

            // 原材料ごとの産地
            // var materialList = Object.values(data.原材料ごとの産地 || {}).filter(Boolean);
            // document.getElementById('material').innerText = materialList[0] || '';
            // console.log("materialList[0]:", materialList[0]);
            // document.getElementById('productionArea').innerText = materialList[1] || '';
            // console.log("materialList[1]:", materialList[1]);

            // var materialListH3 = document.querySelector(".item h3.material");
            // if (textToMaterial.原材料名 === '') {
            //     materialListH3.style.display = "none";
            // } else {
            //     materialListH3.style.display = "block";
            // }

            // var productionAreaH3 = document.querySelector(".item h3.productionArea");
            // if (textToArea.産地 === '') {
            //     productionAreaH3.style.display = "none";
            // } else {
            //     productionAreaH3.style.display = "block";
            // }

            var materialList = Object.values(data.原材料ごとの産地 || {}).filter(Boolean);

            var materialH3 = document.querySelector(".item h3.material");
            var productionAreaH3 = document.querySelector(".item h3.productionArea");

            // 対応する要素に値をセット
            document.getElementById('material').innerText = materialList[0] || '';
            document.getElementById('productionArea').innerText = materialList[1] || '';

            console.log("materialList[0]:", materialList[0]);
            console.log("materialList[1]:", materialList[1]);

            // materialList の要素が存在する場合、それぞれの h3 タグを表示
            if (materialList[0] === undefined) {
                materialH3.style.display = "none";
                // コンソールにログを出力
                console.log("materialList[0]: 非表示");
            } else {
                materialH3.style.display = "block";
                console.log("materialList[0]: 表示");
            }

            if (materialList[1] === undefined) {
                productionAreaH3.style.display = "none";
                console.log("materialList[1]: 非表示");
            } else {
                productionAreaH3.style.display = "block";
                console.log("materialList[1]: 表示");
            }


            // クラス名が "item" の要素内のすべての p タグを取得
            let pTags = document.querySelectorAll(".description p");

            // 各 p タグに対して処理を行う
            pTags.forEach(function (pTag) {
                // もし p タグの内容が空であれば、対応する h3 タグを非表示にする
                var className = pTag.className;
                var h3Tag = document.querySelector(".description h3." + className);

                if (pTag.textContent.trim() === "") {
                    h3Tag.style.display = "none";
                }
            });
        } else {
            console.log("No such document!");
            console.log("docName:", docName);
            // console.log('doc:', doc);
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
} else {
    console.log("No document name specified in the URL.");
}

const backButton = document.getElementById('back'); //戻るボタン
backButton.addEventListener('click', function () {
    window.location.href = `https://ip222295app.web.app/list_Customers.html?userID=${encodeURIComponent(userId)}`;
    // window.location.href = `http://localhost/webapptest/test/0122/list_Customers.html?userID=${encodeURIComponent(userId)}`;
})


