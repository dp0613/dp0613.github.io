(function($) {
    /**
     * Hero Section
     */
    $(function() {
        $(".rslides").responsiveSlides({
            auto: true, // Boolean: Animate automatically, true or false
            pager: true, // Boolean: Show pager, true or false
            pause: true, // Boolean: Pause on hover, true or false
            pauseControls: true, // Boolean: Pause when hovering controls, true or false
        });
    });

    /**
     * Dropdown menu
     */
    $(function() {
        $('.js-navbar__toggle').on('click', function() {
            $('.js-navbar').toggleClass('is-opened');
            $('.js-navbar__toggle').attr('aria-expanded', $('.js-navbar').hasClass('is-opened'));
            return false;
        });

        $('.js-navbar a').each(function(i, link) {
            link = $(link);

            link.on('click', function(e) {
                if (
                    link.parent().hasClass('has-submenu') &&
                    $('.js-navbar__toggle').attr('aria-expanded') === 'true' &&
                    link.parent().attr('aria-expanded') !== 'true'
                ) {
                    e.preventDefault();
                    link.parent().attr('aria-expanded', 'true');
                }
            });
        });
    });

    /**
     * iOS :hover fix
     */
    document.addEventListener("touchend", function() {});

    /**
     * EU Cookie Law Bar
     */
    $(window).on("load", function() {
        var cookieBar = $('.js-cookie-bar');

        if (!cookieBar.length) {
            return;
        }

        var cookieBarClose = cookieBar.find('.cookie-bar__close');

        cookieBarClose.on('click', function(event) {
            event.preventDefault();
            localStorage.setItem('themes-cookie-bar', true);
            cookieBar.removeClass('is-sticky');
        });

        if (!localStorage.getItem('themes-cookie-bar')) {
            cookieBar.addClass('is-sticky');
        }
    });

    /**
     * Share buttons pop-up
     */
    $(function() {
        // link selector and pop-up window size
        var Config = {
            Link: ".js-share",
            Width: 500,
            Height: 500
        };

        // add handler links
        var slink = document.querySelectorAll(Config.Link);
        for (var a = 0; a < slink.length; a++) {
            slink[a].onclick = PopupHandler;
        }

        // create popup
        function PopupHandler(e) {
            e = (e ? e : window.event);
            var t = (e.target ? e.target : e.srcElement);
            // popup position
            var px = Math.floor(((screen.availWidth || 1024) - Config.Width) / 2),
                py = Math.floor(((screen.availHeight || 700) - Config.Height) / 2);
            // open popup
            var link_href = t.href ? t.href : t.parentNode.href;
            var popup = window.open(link_href, "social",
                "width=" + Config.Width + ",height=" + Config.Height +
                ",left=" + px + ",top=" + py +
                ",location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1");
            if (popup) {
                popup.focus();
                if (e.preventDefault) e.preventDefault();
                e.returnValue = false;
            }

            return !!popup;
        }
    });

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
    let postCommentURL = 'posts/coder-life-comic-001/comments';

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
            '  <div class="content">' + commentFiltered '  </div>' +
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

    // Tracking
    let serialize = function(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };
    let store = localStorage;
    if (store && btoa) {
        let tracker = JSON.parse(store.getItem('huyBlogTracker') || "{}");
        let today = btoa((new Date()).toDateString());
        let currentURL = window.location.href;
        let urlTrackingKey = btoa(currentURL);
        if (!tracker[urlTrackingKey] || tracker[urlTrackingKey] !== today) {
            tracker[urlTrackingKey] = today;
            // Do tracking here
            let trackData = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                url: currentURL,
                refer: document.referrer
            };
            let trackParams = serialize(trackData);
            let trackURL = "https://us-central1-huys-blog-comment.cloudfunctions.net/sayHello?" + trackParams;
            fetch(trackURL).then(function(response) {});
        }
        store.setItem('huyBlogTracker', JSON.stringify(tracker));
    }

    const toggle_wordwise = (status) => {
        let book = document.querySelector("book");
        let on = document.querySelector("#ww_on");
        let off = document.querySelector("#ww_off");
        if (!status) {
            book.className = "off";
            on.className = "btn-toggle";
            off.className = "btn-toggle active";
        } else {
            book.className = "";
            on.className = "btn-toggle active";
            off.className = "btn-toggle";
        }
    };
})(jQuery);