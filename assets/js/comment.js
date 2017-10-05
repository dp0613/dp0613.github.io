/**
 * Comment box
 */
// Initialize Firebase
var config = {
	apiKey: "AIzaSyBSQ4FWB5zxIP25qDLvY955QXcsnM8XHVc",
	authDomain: "dev-web-with-me.firebaseapp.com",
	databaseURL: "https://dev-web-with-me.firebaseio.com",
	projectId: "dev-web-with-me",
	storageBucket: "",
	messagingSenderId: "348013493597"
};
firebase.initializeApp(config);

let provider = new firebase.auth.GoogleAuthProvider();
let auth = firebase.auth();
let currentUser = null;
let postCommentURL = location.pathname.substring(1);

auth.onAuthStateChanged(function(user) {
	document.getElementById("comment-loading").style.display = "none";
	if (user) {
		currentUser = user;
		// Logged in
		document.getElementById("login-box").style.display = "none";
		document.getElementById("comment-box").style.display = "flex";
		document.getElementById("user-avatar").setAttribute("src", user.photoURL);
	} else {
		// Not login yet
		document.getElementById("comment-box").style.display = "none";
		document.getElementById("login-box").style.display = "block";
	}
});

const autoSizing = function(element) {
  if (element.scrollHeight > 50) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight+10) + "px";
  }
};

const login = function() {
	auth.signInWithPopup(provider)
		.then(function(result) {}).catch(function(err) {});
};

const encodeHTML = function(s) {
	return s.replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/>/g, '&gt;');
};

const saveNewComment = function(comment) {
	if (!currentUser) {
		return;
	}
	let commentData = {
		user: currentUser.displayName,
		avatar: currentUser.photoURL,
		time: (new Date()).getTime(),
		message: encodeHTML(comment)
	};
	database.ref(postCommentURL).push(commentData);
	document.getElementById("comment-content").value = "";
};

const submitComment = function(e) {
	let keyCode = e.which || e.keyCode;
	let ctrlCode = e.ctrlKey || e.metaKey;
	if (keyCode === 13 && ctrlCode) {
		let comment = document.getElementById("comment-content").value;
		saveNewComment(comment);
	}
};

const filterURLinComment = function(comment) {
	return comment.replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/g, "<a target='_blank' rel='noopener noreferrer' href='$1'>$1</a>");
};

const addNewComment = function(user, avatar, time, comment) {
	let commentFiltered = encodeHTML(comment);
	commentFiltered = filterURLinComment(commentFiltered);
	let d = new Date(time);
	let commentTime = d.toLocaleTimeString() + ' ' + d.toLocaleDateString();
	let html = '<div class="avatar">' +
		'   <img src="' + avatar + '" width="32" height="32"/>' +
		' </div>' +
		'<div class="comment">' +
		'  <div class="metadata"><b>' + user + '</b> lúc <span>' + commentTime + '</span></div>' +
		'  <div class="content">' + commentFiltered + '  </div>' +
		'</div>';
	let li = document.createElement('li');
	li.innerHTML = html;
	document.getElementById("comment-list").append(li);
};

let database = firebase.database();
let posts = database.ref(postCommentURL).orderByChild('time');
posts.on('child_added', function(data) {
	addNewComment(data.val().user, data.val().avatar, data.val().time, data.val().message);
});