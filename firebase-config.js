// firebase-config.js

// Your unique config from Firebase Console
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project_id.firebaseapp.com",
  databaseURL: "https://your_project_id.firebaseio.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
