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
            postsElm.append(pElm);
        });
    })
    .catch(error => showError(error));
}
	
	
       
function load() {
	const element = document.getElementById('post-btn');
	if (element) {
		document
        		.getElementById('post-btn')
        		.addEventListener('click', (evt) => {
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
            		.catch(error => showError(error));
        		});
			}
	
    		// Get the current posts.
    		reloadPosts();
}

window.onload = load;
