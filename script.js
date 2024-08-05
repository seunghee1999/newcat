document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.getElementById('home-link');
    const freeBoardSection = document.getElementById('free-board');
    const newPostButton = document.getElementById('new-post-button');
    const postForm = document.getElementById('post-form');
    const submitPostButton = document.getElementById('submit-post');
    const postList = document.getElementById('post-list');
    const mainTopicsList = document.getElementById('main-topics');
    const dailyBestList = document.getElementById('daily-best');
    const weeklyBestList = document.getElementById('weekly-best');
    const monthlyBestList = document.getElementById('monthly-best');
    const opinionsDiv = document.getElementById('opinions');
    const opinionText = document.getElementById('opinion-text');
    const submitOpinionButton = document.getElementById('submit-opinion');
    const topicDetailSection = document.getElementById('topic-detail');
    const topicTitleElement = document.getElementById('topic-title');
    const backToHomeButton = document.getElementById('back-to-home');
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const topics = JSON.parse(localStorage.getItem('topics')) || [];
    const userOpinions = {};
    const userCommentOpinions = {};
    const userId = 'user123'; // 사용자 ID (예: 로그인 후 사용자의 ID)
    const userNickname = 'nickname'; // 사용자 닉네임
    const dailyPostLimit = 5; // 하루

    // 초기화
    function init() {
        resetDailyPostCount();
        loadMainTopics();
        loadBestTopics();
        loadFreeBoardPosts();
    }

    // 하루마다 작성한 글 수 초기화
    function resetDailyPostCount() {
        const today = new Date().toISOString().slice(0, 10);
        const userDailyPosts = JSON.parse(localStorage.getItem('userDailyPosts')) || {};
        if (!userDailyPosts[userId] || userDailyPosts[userId].date !== today) {
            userDailyPosts[userId] = { date: today, count: 0 };
            localStorage.setItem('userDailyPosts', JSON.stringify(userDailyPosts));
        }
    }

    // 메인 주제 로드
    function loadMainTopics() {
        const mainTopics = topics.filter(topic => topic.isMain);
        mainTopicsList.innerHTML = '';
        mainTopics.forEach(topic => {
            const topicElement = createTopicElement(topic);
            mainTopicsList.appendChild(topicElement);
        });
    }

    // 베스트 토픽 로드
    function loadBestTopics() {
        const now = new Date();
        const dailyBest = topics.filter(topic => {
            const timeDiff = Math.abs(now - new Date(topic.timestamp));
            const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            return diffDays <= 1;
        }).slice(0, 5);

        const weeklyBest = topics.filter(topic => {
            const timeDiff = Math.abs(now - new Date(topic.timestamp));
            const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            return diffDays > 1 && diffDays <= 7;
        }).slice(0, 5);

        const monthlyBest = topics.filter(topic => {
            const timeDiff = Math.abs(now - new Date(topic.timestamp));
            const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            return diffDays > 7 && diffDays <= 30;
        }).slice(0, 5);

        dailyBestList.innerHTML = '';
        dailyBest.forEach(topic => {
            const topicElement = createTopicElement(topic);
            dailyBestList.appendChild(topicElement);
        });

        weeklyBestList.innerHTML = '';
        weeklyBest.forEach(topic => {
            const topicElement = createTopicElement(topic);
            weeklyBestList.appendChild(topicElement);
        });

        monthlyBestList.innerHTML = '';
        monthlyBest.forEach(topic => {
            const topicElement = createTopicElement(topic);
            monthlyBestList.appendChild(topicElement);
        });
    }

    // 자유게시판 로드
    function loadFreeBoardPosts() {
        postList.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postList.appendChild(postElement);
        });
    }

    // 홈 링크를 클릭하면 홈 섹션을 보여줌
    homeLink.addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('home').style.display = 'block';
        topicDetailSection.style.display = 'none';
        freeBoardSection.style.display = 'none';
    });

    // 자유게시판 네비게이션
    document.querySelector('nav ul li a[href="#free-board"]').addEventListener('click', () => {
        document.getElementById('home').style.display = 'none';
        topicDetailSection.style.display = 'none';
        freeBoardSection.style.display = 'block';
    });

    // 글쓰기 버튼 클릭 시 폼 보이기
    newPostButton.addEventListener('click', () => {
        postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
    });

    // 글 등록 기능
    submitPostButton.addEventListener('click', () => {
        const postTitle = document.getElementById('post-title').value.trim();

        if (postTitle === '') {
            alert('제목을 입력하세요.');
            return;
        }

        const userDailyPosts = JSON.parse(localStorage.getItem('userDailyPosts')) || {};
        if (userDailyPosts[userId].count >= dailyPostLimit) {
            alert('하루에 작성할 수 있는 글 수를 초과했습니다.');
            return;
        }

        const newPost = {
            id: `post${posts.length + 1}`,
            title: postTitle,
            authorId: userId,
            authorNickname: userNickname,
            views: 0,
            likes: 0,
            dislikes: 0,
            comments: [],
            timestamp: new Date(),
        };

        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts)); // 로컬 저장소에 저장

        const postElement = createPostElement(newPost);
        postList.appendChild(postElement);
        postForm.style.display = 'none';
        document.getElementById('post-title').value = '';
        
        // 작성한 글 수 증가
        userDailyPosts[userId].count += 1;
        localStorage.setItem('userDailyPosts', JSON.stringify(userDailyPosts));

        updateBestPosts();
    });

    // 주제 요소 생성
    function createTopicElement(topic) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<a href="#">${topic.title}</a>`;

        listItem.addEventListener('click', () => {
            viewTopicDetail(topic);
        });

        return listItem;
    }

    // 글 요소 생성
    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.classList.add('post-card');
        postElement.dataset.id = post.id;

        postElement.innerHTML = `
            <h4>${post.title}</h4>
            <p>작성자: ${post.authorNickname}</p>
            <span class="views">Views: ${post.views}</span>
            <button class="like-button">👍 좋아요</button>
            <button class="dislike-button">👎 싫어요</button>
            <span class="like-count">${post.likes}</span> | 
            <span class="dislike-count">${post.dislikes}</span>
        `;

        const likeButton = postElement.querySelector('.like-button');
        const dislikeButton = postElement.querySelector('.dislike-button');
        const likeCount = postElement.querySelector('.like-count');
        const dislikeCount = postElement.querySelector('.dislike-count');

        likeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // 부모 요소로의 클릭 이벤트 전파를 막음
            toggleReaction(post, likeCount, 'like');
        });

        dislikeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // 부모 요소로의 클릭 이벤트 전파를 막음
            toggleReaction(post, dislikeCount, 'dislike');
        });

        // 글 클릭 시 상세 보기로 이동
        postElement.addEventListener('click', () => {
            viewTopicDetail(post);
        });

        return postElement;
    }

    // 반응 토글 기능
    function toggleReaction(item, countElement, type) {
        if (!userOpinions[item.id]) {
            userOpinions[item.id] = { like: false, dislike: false };
        }

        const currentReaction = userOpinions[item.id][type];
        const oppositeReaction = userOpinions[item.id][type === 'like' ? 'dislike' : 'like'];

        if (currentReaction) {
            item[type === 'like' ? 'likes' : 'dislikes'] -= 1;
            userOpinions[item.id][type] = false;
        } else {
            item[type === 'like' ? 'likes' : 'dislikes'] += 1;
            userOpinions[item.id][type] = true;
            if (oppositeReaction) {
                item[type === 'like' ? 'dislikes' : 'likes'] -= 1;
                userOpinions[item.id][type === 'like' ? 'dislike' : 'like'] = false;
            }
        }

        countElement.textContent = item[type === 'like' ? 'likes' : 'dislikes'];
        localStorage.setItem('posts', JSON.stringify(posts)); // 업데이트된 데이터를 저장
    }

    // 주제 상세 보기 페이지로 이동
    function viewTopicDetail(post) {
        document.getElementById('home').style.display = 'none';
        freeBoardSection.style.display = 'none';
        topicDetailSection.style.display = 'block';

        topicTitleElement.textContent = post.title;
        opinionsDiv.innerHTML = '';
        post.comments.forEach(comment => {
            const opinionElement = createOpinionElement(comment, post);
            opinionsDiv.appendChild(opinionElement);
        });

        post.views += 1;
        localStorage.setItem('posts', JSON.stringify(posts)); // 업데이트된 데이터를 저장
    }

    // 댓글 제출 기능
    submitOpinionButton.addEventListener('click', () => {
        const opinionValue = opinionText.value.trim();
        if (opinionValue === '') {
            alert('댓글을 입력하세요.');
            return;
        }

        const postId = topicTitleElement.textContent;
        const post = posts.find(p => p.title === postId);

        if (!post) return;

        const newComment = {
            text: opinionValue,
            authorId: userId,
            authorNickname: userNickname,
            likes: 0,
            dislikes: 0,
        };

        post.comments.push(newComment);
        localStorage.setItem('posts', JSON.stringify(posts)); // 업데이트된 데이터를 저장

        const opinionElement = createOpinionElement(newComment, post);
        opinionsDiv.appendChild(opinionElement);
        opinionText.value = '';
        updateBestPosts();
    });

    // 의견 요소 생성
    function createOpinionElement(comment, post) {
        const opinionElement = document.createElement('div');
        opinionElement.classList.add('opinion');

        opinionElement.innerHTML = `
            <p>${comment.text}</p>
            <p>작성자: ${comment.authorNickname}</p>
            <button class="like-button">👍 좋아요</button>
            <button class="dislike-button">👎 싫어요</button>
            <span class="like-count">${comment.likes}</span> | 
            <span class="dislike-count">${comment.dislikes}</span>
        `;

        const likeButton = opinionElement.querySelector('.like-button');
        const dislikeButton = opinionElement.querySelector('.dislike-button');
        const likeCount = opinionElement.querySelector('.like-count');
        const dislikeCount = opinionElement.querySelector('.dislike-count');

        likeButton.addEventListener('click', () => {
            toggleCommentReaction(comment, post, likeCount, 'like');
        });

        dislikeButton.addEventListener('click', () => {
            toggleCommentReaction(comment, post, dislikeCount, 'dislike');
        });

        return opinionElement;
    }

    // 댓글 반응 토글 기능
    function toggleCommentReaction(comment, post, countElement, type) {
        const commentId = post.id + comment.text;

        if (!userCommentOpinions[commentId]) {
            userCommentOpinions[commentId] = { like: false, dislike: false };
        }

        const currentReaction = userCommentOpinions[commentId][type];
        const oppositeReaction = userCommentOpinions[commentId][type === 'like' ? 'dislike' : 'like'];

        if (currentReaction) {
            comment[type === 'like' ? 'likes' : 'dislikes'] -= 1;
            userCommentOpinions[commentId][type] = false;
        } else {
            comment[type === 'like' ? 'likes' : 'dislikes'] += 1;
            userCommentOpinions[commentId][type] = true;
            if (oppositeReaction) {
                comment[type === 'like' ? 'dislikes' : 'likes'] -= 1;
                userCommentOpinions[commentId][type === 'like' ? 'dislike' : 'like'] = false;
            }
        }

        countElement.textContent = comment[type === 'like' ? 'likes' : 'dislikes'];
        localStorage.setItem('posts', JSON.stringify(posts)); // 업데이트된 데이터를 저장
    }

    init();
});
