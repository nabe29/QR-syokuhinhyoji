const firebaseConfig = {
    // ここにfirebaseのAPIキー
};

//firestoreのインスタンスを初期化。前準備。
firebase.initializeApp(firebaseConfig);
firebase.analytics();
//Firestoreのインスタンスを取得
const firestore = firebase.firestore();

//要素の結び付け
const mail = document.getElementById("txtmail");
const pass = document.getElementById("txtpass");
const pass2 = document.getElementById("txtpass2");
const cre = document.getElementById("crebtn");
const login = document.getElementById("inbtn");
const logout = document.getElementById("outbtn");
const sta = document.getElementById("sta");
const google = document.getElementById("googlesignin");
const username = document.getElementById("name");
let mailv;
let passv;
let pass2v;
let errorCode;
let errorMessage;

const googlecliantid = "934424017746-u6c25ictdb3mb11dnp757nf1m060fg0i.apps.googleusercontent.com";
const provider = new firebase.auth.GoogleAuthProvider();


provider.setCustomParameters({
    client_id: googlecliantid,
});


//ログアウトボタンを押したとき
logout.addEventListener("click", function () { //ログアウト
    firebase.auth().signOut().then(function () {
        //ログアウトできた時
        username.innerHTML = "";
        console.log("ログインなし");
        // ログアウト後にトップページに遷移

    }).catch(function (error) {
        //ログアウトできなかった時
        console.error("ログアウトできませんでした", error);
        window.location.href = "./index.html";
    });
});


//Googleボタンを押したとき
google.addEventListener('click', () => {
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log('Google Sign-In User:', user);
            console.log(user.displayName);
            console.log(user.email);
            console.log(user.photoURL);
            console.log(user.uid);

            //変更点
            const usersRef = firestore.collection('users');
            const userDocRef = usersRef.doc(user.uid);

            // usersコレクションが存在するか確認
            userDocRef.get().then((querySnapshot) => {
                if (!querySnapshot.exists) {
                    // usersコレクションが存在しない場合、新しく作成
                    usersRef.doc(user.uid).set({}).then(() => {
                        console.log('usersコレクションが作成されました');
                    }).catch((error) => {
                        console.error('usersコレクションの作成エラー:', error);
                    });
                } else {
                    console.error('usersコレクションは既に存在します');
                };
            }).catch((error) => {
                console.error('usersコレクションの存在確認エラー:', error);
            });

            sessionStorage.setItem('userUid', user.uid);
            window.location.href = "./menu.html";

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Google Sign-In Error:', errorCode, errorMessage);
        });
});