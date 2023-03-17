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
  console.log("renderApp");
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
