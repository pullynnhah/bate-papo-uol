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
      getParticipants();
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
      <ion-icon name="people" onclick=renderAside()></ion-icon>
  </header>
  <main>
    <ul></ul>
  </main>
    <aside></aside>
  <footer class="header-footer">
    <div>
      <input type="text" placeholder="Escreva aqui..." />
      <p>
        Enviando para <span class="receiver">Todos</span> <span class="mode"></span>
      </p>
    </div>
    <ion-icon onclick="submitMessage()" name="paper-plane-outline"></ion-icon>
  </footer>
`;

  const icon = document.querySelector("footer ion-icon");
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
        <span class="time">(${msg.time})</span> <span class="from">${msg.from}</span> reservadamente para
        <span class="to">${msg.to}</span>: ${msg.text}
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
  message.type = isPrivate ? "private_message" : "message";
  message.to = selectedParticipant ? selectedParticipant : "Todos";

  axios
    .post(`${API_URL}/messages`, message)
    .then(res => {
      clearTimeout(timeout);
      input.value = "";
      getMessages();
    })
    .catch(err => {
      console.log(err.response);
      alert("Mensagem não pode estar vazia!");
    });
}

function renderAside() {
  const aside = document.querySelector("aside");
  aside.innerHTML = /*html*/ `
  <div class="close" onclick="clearAside()"></div>
  <div class="side-menu">
    <div class="contacts">
      <h2>Escolha um contato<br />para enviar mensagem:</h2>
      <ul>
        
      </ul>
    </div>
    <div class="visibility">
      <h2>Escolha a visibilidade:</h2>
      <ul>
        <li onclick="setIsPrivate(false)">
          <ion-icon name="lock-open"></ion-icon>
          <p>Público</p>
          <img src="./assets/check.svg" alt="check" class="check" />
        </li>
        <li onclick="setIsPrivate(true)">
          <ion-icon name="lock-closed"></ion-icon>
          <p>Reservadamente</p>
          <img src="./assets/check.svg" alt="check" class="check" />
        </li>
      </ul>
    </div>
  </div>
  `;

  if (message.type === "message")
    document.querySelector(".visibility li:first-child").classList.add("selected");

  renderParticipants();
}

function renderParticipants() {
  const contacts = document.querySelector(".contacts ul");
  let selectedParticipantIndex = -1;
  contacts.innerHTML = /*html*/ `
    <li onclick="selectParticipant(this)">
      <ion-icon name="people"></ion-icon>
      <p>Todos</p>
      <img src="./assets/check.svg" alt="check" class="check" />
    </li>`;

  participants.forEach((participant, index) => {
    contacts.innerHTML += /*html*/ `
        <li onclick="selectParticipant(this)">
          <ion-icon name="person-circle"></ion-icon>
          <p>${participant.name}</p>
          <img src="./assets/check.svg" alt="check" class="check" />
        </li>`;
    if (participant.name === selectedParticipant) selectedParticipantIndex = index;
  });

  document.querySelectorAll(".contacts li").forEach((li, index) => {
    if (index === selectedParticipantIndex + 1) li.classList.add("selected");
    else li.classList.remove("selected");
  });
}

function getParticipants() {
  axios
    .get(`${API_URL}/participants`)
    .then(res => {
      participants = res.data;

      const receiver = document.querySelector(".receiver");
      const mode = document.querySelector(".mode");
      if (!participants.find(participant => participant.name === selectedParticipant)) {
        selectedParticipant = "Todos";
        setIsPrivate(false);
        mode.innerHTML = "";
      }

      receiver.innerHTML = selectedParticipant;

      if (document.querySelector("aside").innerHTML) {
        renderParticipants();
      }
      setTimeout(getParticipants, 10000);
    })
    .catch(err => console.log(err));
}

function selectParticipant(participantEl) {
  const name = participantEl.querySelector("p").innerText;
  selectedParticipant = name;
  const receiver = document.querySelector(".receiver");
  receiver.innerHTML = selectedParticipant;
  renderParticipants();
}

function setIsPrivate(val) {
  isPrivate = val;
  toggleVisibility();
}

function toggleVisibility() {
  const mode = document.querySelector(".mode");

  if (document.querySelector("aside").innerHTML) {
    const lis = document.querySelectorAll(".visibility li");

    if (isPrivate) {
      lis[0].classList.remove("selected");
      lis[1].classList.add("selected");
      mode.innerHTML = "(reservadamente)";
    } else {
      lis[0].classList.add("selected");
      lis[1].classList.remove("selected");
      mode.innerHTML = "";
    }
  }
}
function clearAside() {
  const aside = document.querySelector("aside");
  aside.innerHTML = "";
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

let participants = [];
let selectedParticipant = null;
let isPrivate = false;

let lastRenderMessage = {};
let lastMessage;
let timeout;
