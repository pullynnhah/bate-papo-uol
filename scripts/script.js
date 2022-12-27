const URI = "https://mock-api.driven.com.br/api/v6/uol";

function login() {
  user.name = loginInput.value;

  const promise = axios.post(`${URI}/participants`, user);
  loading.classList.remove("hide");
  loginDiv.classList.add("hide");
  promise
    .then(() => {
      loginPage.classList.remove("active");
      mainPage.classList.add("active");
      setTimeout(keepLogin, 5000);
      getMessages();
    })
    .catch(() => {
      loading.classList.add("hide");
      loginDiv.classList.remove("hide");
      loginDiv.classList.add("error");
    });
}

function keepLogin() {
  const promise = axios.post(`${URI}/status`, user);
  promise.then(() => setTimeout(keepLogin, 5000)).catch(reload);
}

function getMessages() {
  const promise = axios.get(`${URI}/messages`);
  promise
    .then(response => {
      const messages = response.data.filter(canRead);
      if (isNewMessages(messages.at(-1))) {
        renderMessages(messages);
        lastMessage = messages.at(-1);
      }
      setTimeout(getMessages, 3000);
    })
    .catch(err => console.log(err));
}

function canRead(message) {
  if (message.type !== "private_message") return true;
  if (message.from === user.name) return true;
  return message.to === user.name;
}

function renderMessages(messages) {
  const htmlMessages = messages.map(formatMessage);
  main.innerHTML = "";
  htmlMessages.forEach(message => (main.innerHTML += message));
  const lastP = main.querySelector("p:last-child");
  lastP.scrollIntoView();
}

function formatMessage(message) {
  if (message.type === "status") {
    return `
    <p class="status">
      <span class="time">(${message.time})</span>
      <strong class="from">${message.from}</strong>
      <span class="text">${message.text}</span>
    </p>
    `;
  }

  if (message.type === "message") {
    return `
    <p class="message">
      <span class="time">(${message.time})</span>
      <strong class="from">${message.from}</strong> para
      <strong class="to">${message.to}</strong>:
      <span class="text">${message.text}</span>
    </p>
    `;
  }
  return `
  <p class="private">
    <span class="time">(${message.time})</span>
    <strong class="from">${message.from}</strong> reservadamente para
    <strong class="to">${message.to}</strong>:
    <span class="text">${message.text}</span>
  </p>
  `;
}
function isNewMessages(message) {
  if (!lastMessage) return true;
  for (const key in message) {
    if (message[key] !== lastMessage[key]) return true;
  }

  return false;
}

function reload() {
  window.location.reload();
}
// variables
const user = { name: null };
let lastMessage = null;

// login-page elements
const loginPage = document.querySelector(".login-page");
const loginDiv = loginPage.querySelector(".login");
const loginInput = loginDiv.querySelector("input");
const loginBtn = loginDiv.querySelector("button");
const loading = loginPage.querySelector(".loading");

// main-page elements
const mainPage = document.querySelector(".main-page");
const main = mainPage.querySelector("main");

loginBtn.addEventListener("click", login);
loginInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    loginBtn.click();
  }
});
