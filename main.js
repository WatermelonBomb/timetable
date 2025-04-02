// DOM要素の取得
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const addClassModal = document.getElementById('addClassModal');
const closeBtns = document.querySelectorAll('.close');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const addClassForm = document.getElementById('addClassForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const timetableGrid = document.querySelector('.timetable-grid');
const timetableLink = document.getElementById('timetableLink');
const notificationLink = document.getElementById('notificationLink');
const mainPage = document.getElementById('mainPage');
const timetablePage = document.getElementById('timetablePage');
const notificationPage = document.getElementById('notificationPage');
const homeLink = document.getElementById('homeLink');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

// 投稿関連の要素
const postContent = document.getElementById('postContent');
const submitPostBtn = document.getElementById('submitPost');
const postsContainer = document.getElementById('postsContainer');

// 授業追加フォームの要素を取得
const subjectNameInput = document.getElementById('subjectName');
const dayOfWeekSelect = document.getElementById('dayOfWeek');
const periodSelect = document.getElementById('period');
const classroomInput = document.getElementById('classroom');
const colorInput = document.getElementById('colorCode');

// ページ切り替えの共通関数
function switchPage(targetPage, activeLink) {
    // すべてのページを非表示
    [mainPage, timetablePage, notificationPage].forEach(page => {
        page.style.display = 'none';
    });
    
    // すべてのリンクからactiveクラスを削除
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 対象のページを表示
    targetPage.style.display = 'block';
    
    // アクティブなリンクにactiveクラスを追加
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ページ切り替えのイベントリスナー
homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(mainPage, homeLink);
    loadPosts();
});

timetableLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(timetablePage, timetableLink);
    const token = localStorage.getItem('token');
    if (token) {
        loadTimetable();
    }
});

notificationLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(notificationPage, notificationLink);
});

// ロゴをクリックしてメインページに戻る
document.querySelector('.logo').addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(mainPage, homeLink);
    loadPosts();
});

// モーダル切り替え
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    signupModal.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.style.display = 'none';
    loginModal.style.display = 'block';
});

// サインインフォームの送信処理
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    // パスワード確認
    if (password !== passwordConfirm) {
        alert('パスワードが一致しません。');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: username, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            signupModal.style.display = 'none';
            updateUIAfterLogin(data.user);
            loadPosts();
            alert('アカウントが作成されました。');
        } else {
            const error = await response.json();
            alert(error.message || 'サインインに失敗しました。');
        }
    } catch (error) {
        console.error('サインインエラー:', error);
        alert('サインイン中にエラーが発生しました。');
    }
});

// ログインフォームの送信処理
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            loginModal.style.display = 'none';
            updateUIAfterLogin(data.user);
            loadPosts();
        } else {
            const error = await response.json();
            alert(error.message || 'ログインに失敗しました。');
        }
    } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログイン中にエラーが発生しました。');
    }
});

// ログアウト
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    loginModal.style.display = 'block';
    mainPage.style.display = 'none';
    timetablePage.style.display = 'none';
    notificationPage.style.display = 'none';
    logoutBtn.style.display = 'none';
});

// モーダル関連のイベントリスナー
addClassBtn.addEventListener('click', () => {
    addClassModal.style.display = 'block';
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
        addClassModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === signupModal) {
        signupModal.style.display = 'none';
    }
    if (e.target === addClassModal) {
        addClassModal.style.display = 'none';
    }
});

// 時間割の初期表示
function initializeTimetable() {
    const timetable = document.getElementById('timetable');
    const days = ['月', '火', '水', '木', '金', '土'];
    const periods = 6;

    // ヘッダー行の作成
    const headerRow = document.createElement('div');
    headerRow.className = 'timetable-row';
    
    // 左上の空白セル
    const emptyCell = document.createElement('div');
    emptyCell.className = 'timetable-cell header';
    headerRow.appendChild(emptyCell);
    
    // 曜日ヘッダー
    days.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'timetable-cell header';
        cell.textContent = day;
        headerRow.appendChild(cell);
    });
    
    timetable.appendChild(headerRow);

    // 時限行の作成
    for (let period = 1; period <= periods; period++) {
        const row = document.createElement('div');
        row.className = 'timetable-row';
        
        // 時限ヘッダー
        const periodCell = document.createElement('div');
        periodCell.className = 'timetable-cell header';
        periodCell.textContent = `${period}限`;
        row.appendChild(periodCell);
        
        // 曜日セル
        for (let day = 0; day < 6; day++) {
            const cell = document.createElement('div');
            cell.className = 'timetable-cell';
            cell.dataset.day = day;
            cell.dataset.period = period;
            row.appendChild(cell);
        }
        
        timetable.appendChild(row);
    }
}

// 時間割の読み込み
async function loadTimetable() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/schedules', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const schedules = await response.json();
            displaySchedules(schedules);
        }
    } catch (error) {
        console.error('時間割読み込みエラー:', error);
    }
}

// 時間割の表示
function displaySchedules(schedules) {
    // 既存の授業をクリア
    const cells = document.querySelectorAll('.timetable-cell.class');
    cells.forEach(cell => cell.remove());

    // 新しい授業を表示
    schedules.forEach(schedule => {
        const cell = document.querySelector(
            `.timetable-cell[data-day="${schedule.day_of_week}"][data-period="${schedule.period}"]`
        );

        if (cell) {
            const classElement = document.createElement('div');
            classElement.className = 'timetable-cell class';
            classElement.style.backgroundColor = schedule.color_code;
            classElement.style.color = getContrastColor(schedule.color_code);
            classElement.innerHTML = `
                <div class="class-content">
                    <strong>${schedule.subject_name}</strong>
                    ${schedule.classroom ? `<br>${schedule.classroom}` : ''}
                    <button class="delete-class" data-id="${schedule.id}">×</button>
                </div>
            `;

            // 削除ボタンのイベントリスナー
            const deleteBtn = classElement.querySelector('.delete-class');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // イベントの伝播を停止
                if (confirm('この授業を削除してもよろしいですか？')) {
                    try {
                        const response = await fetch(`/api/schedules/${schedule.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (response.ok) {
                            classElement.remove();
                            alert('授業を削除しました');
                        } else {
                            throw new Error('授業の削除に失敗しました');
                        }
                    } catch (error) {
                        console.error('授業削除エラー:', error);
                        alert(error.message);
                    }
                }
            });

            cell.appendChild(classElement);
        }
    });
}

// コントラストカラーの計算
function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

// ログイン後のUI更新
function updateUIAfterLogin(user) {
    userName.textContent = user.username;
    logoutBtn.style.display = 'block';
    mainPage.style.display = 'block';
}

// 授業追加フォームの送信処理
addClassForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                subject_name: subjectNameInput.value,
                day_of_week: parseInt(dayOfWeekSelect.value),
                period: parseInt(periodSelect.value),
                classroom: classroomInput.value,
                color_code: colorInput.value
            })
        });

        if (!response.ok) {
            throw new Error('授業の追加に失敗しました');
        }

        // フォームをリセット
        addClassForm.reset();
        
        // 時間割を更新
        await loadTimetable();
        
        // モーダルを閉じる
        addClassModal.style.display = 'none';
        
        alert('授業を追加しました');
    } catch (error) {
        console.error('授業追加エラー:', error);
        alert(error.message);
    }
});

// 投稿の送信
submitPostBtn.addEventListener('click', async () => {
    const content = postContent.value.trim();
    if (!content) return;

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            postContent.value = '';
            loadPosts();
        } else {
            const data = await response.json();
            alert(data.error || '投稿に失敗しました');
        }
    } catch (error) {
        console.error('投稿エラー:', error);
        alert('投稿に失敗しました');
    }
});

// 投稿一覧の読み込み
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('投稿一覧の読み込みエラー:', error);
    }
}

// 投稿の表示
function displayPosts(posts) {
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// 投稿要素の作成
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-username">${post.username}</span>
            <span class="post-timestamp">${formatDate(post.created_at)}</span>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-actions">
            <div class="post-action like-button" data-post-id="${post.id}">
                <span class="like-count">${post.like_count}</span>
                <span>いいね</span>
            </div>
            <div class="post-action comment-button" data-post-id="${post.id}">
                <span class="comment-count">${post.comment_count}</span>
                <span>コメント</span>
            </div>
        </div>
        <div class="comments-section" style="display: none;">
            <div class="comments-list"></div>
            <div class="comment-form">
                <textarea placeholder="コメントを入力"></textarea>
                <button>コメントする</button>
            </div>
        </div>
    `;

    // いいねボタンのイベントリスナー
    const likeButton = postDiv.querySelector('.like-button');
    likeButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/posts/${post.id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const likeCount = likeButton.querySelector('.like-count');
                likeCount.textContent = data.liked ? 
                    parseInt(likeCount.textContent) + 1 : 
                    parseInt(likeCount.textContent) - 1;
                likeButton.classList.toggle('liked', data.liked);
            }
        } catch (error) {
            console.error('いいねエラー:', error);
        }
    });

    // コメントボタンのイベントリスナー
    const commentButton = postDiv.querySelector('.comment-button');
    const commentsSection = postDiv.querySelector('.comments-section');
    const commentsList = postDiv.querySelector('.comments-list');
    const commentForm = postDiv.querySelector('.comment-form');
    const commentTextarea = commentForm.querySelector('textarea');
    const commentSubmitBtn = commentForm.querySelector('button');

    commentButton.addEventListener('click', async () => {
        if (commentsSection.style.display === 'none') {
            try {
                const response = await fetch(`/api/posts/${post.id}/comments`);
                const comments = await response.json();
                displayComments(commentsList, comments);
                commentsSection.style.display = 'block';
            } catch (error) {
                console.error('コメント読み込みエラー:', error);
            }
        } else {
            commentsSection.style.display = 'none';
        }
    });

    // コメント送信のイベントリスナー
    commentSubmitBtn.addEventListener('click', async () => {
        const content = commentTextarea.value.trim();
        if (!content) return;

        try {
            const response = await fetch(`/api/posts/${post.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                const comment = await response.json();
                addComment(commentsList, comment);
                commentTextarea.value = '';
                const commentCount = commentButton.querySelector('.comment-count');
                commentCount.textContent = parseInt(commentCount.textContent) + 1;
            }
        } catch (error) {
            console.error('コメント送信エラー:', error);
        }
    });

    return postDiv;
}

// コメントの表示
function displayComments(commentsList, comments) {
    commentsList.innerHTML = '';
    comments.forEach(comment => {
        addComment(commentsList, comment);
    });
}

// コメントの追加
function addComment(commentsList, comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-username">${comment.username}</span>
            <span class="comment-timestamp">${formatDate(comment.created_at)}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
    `;
    commentsList.appendChild(commentDiv);
}

// 日付のフォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 初期表示
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (token && user) {
    updateUIAfterLogin(user);
    loadPosts();
} else {
    loginModal.style.display = 'block';
    mainPage.style.display = 'none';
    timetablePage.style.display = 'none';
    notificationPage.style.display = 'none';
    logoutBtn.style.display = 'none';
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeTimetable();
    const token = localStorage.getItem('token');
    if (token) {
        loadTimetable();
    }
}); 