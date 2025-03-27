function profileLink(profile) {
    let a = document.createElement('a');
    a.href = `/profile/${profile.id}/`;
    a.textContent = profile.username;
    return a;
}

function reloadPosts() {
    fetch('/api/post', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(posts => {
        let postsElm = document.getElementById('posts');
        postsElm.replaceChildren();
	
        const pathParts = window.location.pathname.split('/');
        const profileUserId = pathParts[2];

        let filteredPosts = posts;

        if (!isNaN(profileUserId)) {
            const profileIdInt = parseInt(profileUserId, 10);
            filteredPosts = posts.filter(post => post.profile.id === profileIdInt);
        }

        filteredPosts.forEach(post => {
		let pElm = document.createElement('p');
		pElm.textContent = post.content + " by ";
		pElm.append(profileLink(post.profile));
		pElm.setAttribute('postID', post.id);
		postsElm.append(pElm);
	});

	    addLikeButtons(filteredPosts);
    })
    .catch(error => showError(error));
}

function addLikeButtons(posts) {
    posts.forEach(post => {
        let postElm = document.querySelector(`p[postID="${post.id}"]`);
        if (postElm) {
            let likeButton = document.createElement("button");
            likeButton.textContent = `Like (${post.likes_counts})`;
            likeButton.className = "like-btn";
            
            if (post.likes.some(like => like.profile.id === CURRENT_USER_ID)) {
                likeButton.classList.add("liked"); 
            }

            likeButton.onclick = () => toggleLike(post.id, likeButton);

            postElm.append(document.createElement("br"));
            postElm.append(likeButton);
        }
    });
}

function toggleLike(postId, button) {
    const isLiked = button.classList.contains("liked"); 

    const apiEndpoint = isLiked ? `/api/unlike/${postId}/` : `/api/like/${postId}/`;
    
    fetch(apiEndpoint, { method: 'POST' })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
		    console.error('API Error:', err);
		    throw new Error(err.error); });
        }
        return response.json();
    })
    .then(updatedPost => {
        button.textContent = `Like (${updatedPost.likes_counts})`;

        if (isLiked) {
            button.classList.remove("liked");
        } else {
            button.classList.add("liked");
        }
    })
    .catch(error => console.error("Error toggling like:", error));
}


function load() {
    const element = document.getElementById('post-btn');
    if (element) {
        element.addEventListener('click', (evt) => {
            evt.preventDefault();

            let content = document.getElementById('content').value;

            fetch('/api/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: content })
            })
            .then(response => response.json())
            .then(data => reloadPosts())
            .catch(error => console.error("Error posting:", error));
        });
    }

    // Get the current posts.
    reloadPosts();
}

window.onload = load;
