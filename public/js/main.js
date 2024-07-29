const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-message');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room form url
const { username, team } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, team });

// Get team and users
socket.on('teamUsers', ({ team, users }) => {
    outputTeamName(team);
    outputUsers(users);
})

// Message form server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatmessage', msg)

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus;
});

// Output Message to Webpage
function outputMessage (message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-message').appendChild(div);
}

// Add team name to webpage
function outputTeamName(team) {
    roomName.innerText = team;
}

// Add users to webpage
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}