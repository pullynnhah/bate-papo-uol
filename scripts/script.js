const URI = "https://mock-api.driven.com.br/api/v6/uol";

function login() {
  sendMessage.from = loginInput.value;

  const promise = axios.post(`${URI}/participants`, { name: sendMessage.from });
  loading.classList.remove("hide");
  loginDiv.classList.add("hide");
  promise
    .then(() => {
      loginPage.classList.remove("active");
      mainPage.classList.add("active");
      setTimeout(keepLogin, 5000);
      getMessages();
      loadParticipants();
    })
    .catch(() => {
      loading.classList.add("hide");
      loginDiv.classList.remove("hide");
      loginDiv.classList.add("error");
    });
}

function keepLogin() {
  const promise = axios.post(`${URI}/status`, { name: sendMessage.from });
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
      timeout = setTimeout(getMessages, 3000);
    })
    .catch(reload);
}

function canRead(message) {
  if (message.type !== "private_message") return true;
  if (message.from === sendMessage.from) return true;
  return message.to === sendMessage.from;
}

function renderMessages(messages) {
  main.innerHTML = messages
    .map(formatMessage)
    .reduce((ac, message) => ac + message);
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

function submitMessage() {
  sendMessage.text = mainInput.value;
  console.log(sendMessage.text);
  const promise = axios.post(`${URI}/messages`, sendMessage);
  promise
    .then(() => {
      clearTimeout(timeout);
      mainInput.value = "";
      getMessages();
    })
    .catch(reload);
}

function reload() {
  window.location.reload();
}

function loadParticipants() {
  const promise = axios.get(`${URI}/participants`);
  participants.innerHTML = "";
  promise
    .then(response => {
      const people = response.data;

      let hasActive = false;
      people.forEach(person => {
        if (!hasActive && person.name === sendMessage.to) {
          hasActive = true;
        }
        const cls = person.name === sendMessage.to ? "option active" : "option";

        participants.innerHTML += `
        <div class="${cls}" onclick="selectParticipant(this)">
          <ion-icon name="person-circle"></ion-icon>
          <p>${person.name}</p>
          <img src="./assets/check.svg" alt="checkmark" />
        </div>
        `;
      });

      const cls = !hasActive ? "option active" : "option";
      participants.innerHTML =
        `
        <div class="${cls}" onclick="selectParticipant(this)">
          <ion-icon name="people"></ion-icon>
          <p>Todos</p>
          <img src="./assets/check.svg" alt="checkmark" />
        </div>
      ` + participants.innerHTML;
      if (!hasActive) {
        sendMessage.to = "Todos";
        sendMessage.type = "message";
      }
      setTimeout(loadParticipants, 10000);
    })
    .catch(reload);
}

function selectParticipant(participant) {
  const active = participants.querySelector(".active");
  if (active) {
    active.classList.remove("active");
  }
  participant.classList.add("active");
  sendMessage.to = participant.querySelector("p").textContent;
  sendTo.textContent =
    sendMessage.type === "message"
      ? sendMessage.to
      : `${sendMessage.to} (Reservadamente)`;
}

function selectVisibility(visibility) {
  const active = visibilities.querySelector(".active");
  if (active) {
    active.classList.remove("active");
  }

  visibility.classList.add("active");

  const isPublic = visibility.querySelector("p").textContent === "Público";
  sendMessage.type = isPublic ? "message" : "private_message";
}

function showAside() {
  aside.classList.add("open");
}

const sendMessage = {
  from: null,
  to: "Todos",
  text: null,
  type: "message",
};

let lastMessage;
let timeout;

// login-page elements
const loginPage = document.querySelector(".login-page");
const loginDiv = loginPage.querySelector(".login");
const loginInput = loginDiv.querySelector("input");
const loginBtn = loginDiv.querySelector("button");
const loading = loginPage.querySelector(".loading");

// main-page elements
const mainPage = document.querySelector(".main-page");
const main = mainPage.querySelector("main");
const mainInput = mainPage.querySelector("input");
const sendBtn = mainPage.querySelector("button");
const sendTo = mainPage.querySelector(".send-to");
const participants = mainPage.querySelector(".participants");
const peopleIcon = mainPage.querySelector("header ion-icon");
const aside = mainPage.querySelector("aside");
const closeAside = mainPage.querySelector("aside .close");
const visibilities = mainPage.querySelector("aside .visibilities");

loginBtn.addEventListener("click", login);
loginInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    loginBtn.click();
  }
});

sendBtn.addEventListener("click", submitMessage);
mainInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

peopleIcon.addEventListener("click", showAside);
closeAside.addEventListener("click", () => aside.classList.remove("open"));
