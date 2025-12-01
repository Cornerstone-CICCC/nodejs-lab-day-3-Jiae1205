// 서버와 연결
const socket = io("http://localhost:3000");

let currentRoom = null;

// DOM 참조
const roomButtons = document.querySelectorAll(".room-btn");
const currentRoomLabel = document.getElementById("current-room");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const messagesList = document.getElementById("messages");

// ----------------------------------------------
// 방 선택
// ----------------------------------------------
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const roomName = btn.dataset.room;

    // 서버로 방 입장 요청
    socket.emit("room:join", roomName);

    currentRoom = roomName;
    currentRoomLabel.textContent = roomName;
  });
});

// ----------------------------------------------
// 메시지 전송
// ----------------------------------------------
sendBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  if (!username || !message || !currentRoom) {
    alert("방 선택하고 메시지를 입력해야 합니다!");
    return;
  }

  socket.emit("chat:message", {
    username,
    message,
    room: currentRoom,
  });

  messageInput.value = "";
});

// ----------------------------------------------
// 서버에서 메시지 받기
// ----------------------------------------------
socket.on("chat:message", (data) => {
  addMessage(data.username, data.message);
});

// ----------------------------------------------
// 방 히스토리 받기
// ----------------------------------------------
socket.on("chat:history", (messages) => {
  messagesList.innerHTML = ""; // 기존 메시지 초기화
  messages.forEach((msg) => {
    addMessage(msg.username, msg.message);
  });
});

// ----------------------------------------------
// 시스템 메시지 (입장/퇴장 알림)
socket.on("system:message", (text) => {
  const li = document.createElement("li");
  li.textContent = `[System] ${text}`;
  li.style.color = "gray";
  messagesList.appendChild(li);
});

// ----------------------------------------------
// 방 떠났을 때 UI 초기화
socket.on("room:left", () => {
  messagesList.innerHTML = "";
  currentRoomLabel.textContent = "(none)";
  currentRoom = null;
});

// ----------------------------------------------
// UI에 메시지 추가
// ----------------------------------------------
function addMessage(username, message) {
  const li = document.createElement("li");
  li.textContent = `${username}: ${message}`;
  messagesList.appendChild(li);
}
