function renderLogin() {
  root.innerHTML = /*html*/ `
  <div class="login">
    <img src="./assets/logo.png" alt="Logo do Bate-Papo UOL" />
    <input type="text" placeholder="Digite seu nome" />
    <button onclick="login()">Entrar</button>
  </div>
  `;

  const btn = document.querySelector("button");
  document.querySelector("input").addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      btn.click();
    }
  });
}

function login() {
  const input = document.querySelector(".login input");
  const name = input.value;
  input.value = "";

  axios
    .post(`${API_URL}/participants`, { name })
    .then(res => {
      console.log("HELLO");
      message.from = name;
      renderApp();
      getMessages();
      setTimeout(keepConnection, 5000);
    })
    .catch(err => alert("Usuário já está em uso!"));
}

function keepConnection() {
  axios
    .post(`${API_URL}/status`, { name: message.from })
    .catch(err => window.location.reload())
    .then(res => setTimeout(keepConnection, 5000));
}

function renderApp() {
  root.innerHTML = /*html*/ `
  <header class="header-footer">
      <img src="./assets/logo.png" alt="Logo do Bate-Papo UOL" />
      <ion-icon name="people"></ion-icon>
  </header>
  <main>
    <ul></ul>
  </main>
    <aside></aside>
  <footer class="header-footer">
    <div>
      <input type="text" placeholder="Escreva aqui..." />
      <p>
        Enviando para <span class="receiver"></span> <span class="mode"></span>
      </p>
    </div>
    <ion-icon onclick="submitMessage()" name="paper-plane-outline"></ion-icon>
  </footer>
`;

  const icon = document.querySelector("ion-icon");
  document.querySelector("input").addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      icon.click();
    }
  });
}

function getMessages() {
  axios
    .get(`${API_URL}/messages`)
    .then(res => {
      const messages = res.data.filter(isMessageVisible);
      lastMessage = messages.at(-1);
      if (!compareMessages(lastMessage, lastRenderMessage)) renderMessages(messages);
      timeout = setTimeout(getMessages, 3000);
    })
    .catch(err => window.location.reload());
}

function compareMessages(msg1, msg2) {
  const keys = Object.keys(msg1);
  if (keys.length !== Object.keys(msg2).length) return false;
  for (const key of keys) {
    if (msg1[key] !== msg2[key]) return false;
  }

  return true;
}

function isMessageVisible(msg) {
  if (msg.type !== "private_message") return true;
  if (msg.from === message.from) return true;
  return msg.to === message.from;
}

function renderMessages(messages) {
  const ul = document.querySelector("main ul");
  ul.innerHTML = "";
  messages.forEach(msg => {
    if (msg.type === "status") {
      ul.innerHTML += /*html*/ `
      <li class="status-message">
        <span class="time">(${msg.time})</span> <span class="from">${msg.from}</span> ${msg.text}
      </li>
      `;
    } else if (msg.type === "message") {
      ul.innerHTML += /*html*/ `
      <li class="message">
        <span class="time">(${msg.time})</span> <span class="from">${msg.from}</span> para
        <span class="to">${msg.to}</span>: ${msg.text}
      </li>
      `;
    } else {
      ul.innerHTML += /*html*/ `
      <li class="private-message">
        <span class="time">(${msg.time})</span> <span class="from">msg.from</span> reservadamente para
        <span class="to">msg.to</span>: ${msg.text}
      </li>
      `;
    }
  });

  lastRenderMessage = messages.at(-1);
  document.querySelector("main li:last-child").scrollIntoView();
}

function submitMessage() {
  const input = document.querySelector("footer input");
  message.text = input.value;
  axios
    .post(`${API_URL}/messages`, message)
    .then(res => {
      clearTimeout(timeout);
      input.value = "";
      getMessages();
    })
    .catch(err => alert("Mensagem não pode estar vazia!"));
}

const API_URL = "https://mock-api.driven.com.br/api/v6/uol";
const root = document.querySelector("#root");

renderLogin();

// message to be sended
const message = {
  from: null,
  to: "Todos",
  text: null,
  type: "message"
};

let lastRenderMessage = {};
let lastMessage;

let timeout;
