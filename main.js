const commentsContainer = document.getElementById('all-comments')
const addComments = document.getElementById('add-comments')


// Fetch data function
const fetchData = async () => {
    try {
        let response = await fetch('./data.json');
        let data = await response.json();

        renderComments(data)
    } catch (e) {
        console.log(e.message)
    }
}

fetchData()


// Rendering Comments function

const renderComments = (data) => {
    commentsContainer.innerHTML = '';
    const {comments} = data;

    comments.forEach(comment => {
        const commentDiv = createCommentElement(comment);
        commentsContainer.appendChild(commentDiv);

        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.classList.add('replies');

            comment.replies.forEach(reply => {
                const replyDiv = createCommentElement(reply, true);
                repliesContainer.appendChild(replyDiv);
            })
            commentsContainer.appendChild(repliesContainer);
        }
    })
    addInput(commentsContainer)
    commentsContainer.appendChild(addComments)
}


// creating comment layout dispaly function
const createCommentElement = (comments, isReply = false) => {
    const {
        content,
        createdAt,
        score,
        replyingTo,
        user: {
            image: {png},
            username
        }
    } = comments
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');

// Conditional Rendering Styles
    let replyTo = isReply ? `<span class="reply-to">@${replyingTo}</span>` : '';
    let replyOption = `<p class="rep-icon"><img src="./images/icon-reply.svg" alt="Reply">Reply</p>`
    let dltEdit = `<div class="edit-container">
    <p class="dlt-icon"><img src="./images/icon-delete.svg" alt="Reply">Delete</p>
    <p class="edit-icon"><img src="./images/icon-edit.svg" alt="Reply">Edit</p>
  </div>`


    commentElement.innerHTML = `<div class="scores">
            <img src="./images/icon-plus.svg" alt="Increase" class="increment">
            <span class="score">${score}</span>
            <img src="./images/icon-minus.svg" alt="Decrease" class="decrement">
        </div>
        <div class="profile">
            <div class="wrapper">
                <img src="${png}" alt="User Image" class="user-img">
                <p class="user-name">${username}${username === "juliusomo" ? ' <span class="me">you</span>' : ''}</p>
                <p class="time-posted">${createdAt}</p>
            </div>
            ${ username === "juliusomo" ? dltEdit : replyOption}
        </div>
        <div class="desc">
             ${replyTo} ${content}
        </div>`;

    let scoreElement = commentElement.querySelector('.score');
    let incBtn = commentElement.querySelector('.increment');
    let decBtn = commentElement.querySelector('.decrement');
    incrementDecrementFun(incBtn, decBtn, scoreElement)


    curdEventListeners(commentElement, username, content, replyTo)
    return commentElement;
}


const incrementDecrementFun = (incBtn,decBtn,  scoreElement) => {
    incBtn.addEventListener("click", () => {
        let currentScore = parseInt(scoreElement.textContent);
        currentScore++
        scoreElement.textContent = currentScore;
    })

    decBtn.addEventListener("click", () => {
        let currentScore = parseInt(scoreElement.textContent);
        currentScore--
        scoreElement.textContent = currentScore;

        if (currentScore <= 0 || currentScore === 0) {
            scoreElement.textContent = 0;
        }
    })
}


const curdEventListeners = (commentElement, username, content, replyTo) => {
    let replyBtn = commentElement.querySelector('.rep-icon');
    let dltBtn = commentElement.querySelector('.dlt-icon');
    let editBtn = commentElement.querySelector('.edit-icon');

   if (replyBtn) {
       replyBtn.addEventListener("click", () => {
           addInput(commentElement, username,);
       })
   } else if (username === "juliusomo") {
       dltBtn.addEventListener("click", () => {
           let popUpMsg = document.createElement('div');
           popUpMsg.classList.add('pop-up');
           popUpMsg.innerHTML = `
           <div class="pop-wrap">
           <h2>Delete Element</h2>
           <p>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
           <div class="pop-btns">
           <button class="no-dlt">NO, CANCEL</button>
           <button class="yes-dlt">YES, DELETE</button>
</div>
</div>
           `

           let yesDltBtn = popUpMsg.querySelector('.yes-dlt');
           yesDltBtn.addEventListener("click", () => {
               commentElement.remove()
               popUpMsg.remove()
           })

           let noDltBtn = popUpMsg.querySelector('.no-dlt');
           noDltBtn.addEventListener("click", () => {
               popUpMsg.remove()
           })
           document.body.appendChild(popUpMsg)


       })

       editBtn.addEventListener('click', () => {
           commentElement.classList.add('edit-comment')
           dltBtn.style.display = 'none';
           editBtn.style.display = 'none';
           const descElement = commentElement.querySelector('.desc');
           descElement.classList.add('edit-desc')
           let originalContent = content;
           descElement.innerHTML = `
                <textarea class="edit-textarea">${originalContent}</textarea>
                <button class="save-btn">Save</button>
            `;
           const saveBtn = descElement.querySelector('.save-btn');
           const editTextarea = descElement.querySelector('.edit-textarea');

           saveBtn.addEventListener('click', () => {
               dltBtn.style.display = 'flex';
               editBtn.style.display = 'flex';
               commentElement.classList.remove('edit-comment')
               descElement.classList.remove('edit-desc')
               const updatedContent = editTextarea.value.trim();
               if (updatedContent) {
                   descElement.innerHTML = `${replyTo} ${updatedContent}`;
               }
           });
       })
   }
}


const addInput = (targetElement = addComments, replyingTo) => {
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('add-comment');
    inputContainer.innerHTML = `<img src="/images/avatars/image-juliusomo.png" alt="username image">
        <form action="" class="text-form">
            <textarea class="input-textarea" name="text-area" id="text" placeholder="Add a comment..">${replyingTo ? `@${replyingTo}.  ` : ''}</textarea>
        </form>
        <button class="send-btn">Send</button>`
    ;

    targetElement.insertAdjacentElement('afterend', inputContainer);
    let sendBtn = inputContainer.querySelector('.send-btn');
    let textInput = inputContainer.querySelector('.input-textarea');

    sendBtn.addEventListener('click', e => {
        replyLogic(targetElement, replyingTo, textInput, inputContainer);
    })
}


const replyLogic = (targetElement, replyingTo, textInput, inputContainer) => {
    const textValue = textInput.value.trim();
    const formattedReplyingTo = replyingTo ? `<span class="reply-to">@${replyingTo}</span>` : '';
    const formattedContent = replyingTo
        ? `${formattedReplyingTo} ${textValue.replace(`@${replyingTo}. `, '').trim()}`
        : textValue;
    let addComment = {
        user: {
            username: 'juliusomo',
            image: {png: './images/avatars/image-juliusomo.png'},
        },
        replies: [],
        replyingTo,
        createdAt: 'just now',
        content: formattedContent,
        score: 0,
    }

    if (addComment.content.trim()) {
        const newComment = createCommentElement(addComment);


        if (replyingTo) {
            let replyContainer = targetElement.nextElementSibling;
            if (!replyContainer || !replyContainer.classList.contains('replies')) {
                replyContainer = document.createElement('div');
                replyContainer.classList.add('replies');
                targetElement.insertAdjacentElement('afterend', replyContainer);
            }
            replyContainer.appendChild(newComment)
        } else {
            commentsContainer.insertBefore(newComment, addComments);
        }
        textInput.value = '';
        if (replyingTo) {
            inputContainer.remove()
        }
    }

}
