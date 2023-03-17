function renderLogin() {
  root.innerHTML = /*html*/ `
  <div class="login">
    <img src="./assets/logo.png" alt="Logo do Bate-Papo UOL" />
    <input type="text" placeholder="Digite seu nome" />
    <button onclick="login()">Entrar</button>
  </div>
  `;
}

function login() {
  const input = document.querySelector(".login input");
  const name = input.value;
  input.value = "";

  axios
    .post(`${API_URL}/participants`, { name })
    .catch(err => alert("Usuário já está em uso!"))
    .then(res => {
      message.from = name;
      renderApp();
      getMessages();
      setTimeout(keepConnection, 5000);
    });
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
      <ion-icon name="paper-plane-outline"></ion-icon>
    </footer>
`;
}

function getMessages() {
  axios
    .get(`${API_URL}/messages`)
    .catch(err => window.location.reload())
    .then(res => {
      renderMessages(
        res.data.filter(
          msg =>
            msg.type !== "private_message" || msg.from === message.from || msg.to === message.from
        )
      );
      setTimeout(getMessages, 3000);
    });
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
