var apiKey: string = "3f301be7381a03ad8d352314dcc3ec1d";
let requestToken: any;
let username: string;
let password: string;
let sessionId: number | string;
let listId = "7101979";

let loginButton = document.getElementById("login-button") as HTMLInputElement;
let searchButton = document.getElementById("search-button") as HTMLInputElement;
let searchContainer = document.getElementById("search-container");

loginButton.addEventListener("click", async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
});

searchButton.addEventListener("click", async () => {
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let query = document.getElementById("search") as HTMLInputElement;
  let listaDeFilmes: any = await procurarFilme(query.value);
  console.log(listaDeFilmes);
  let ul = document.createElement("ul");
  ul.id = "lista";
  for (const item of listaDeFilmes.results) {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(item.original_title));
    ul.appendChild(li);
  }
  console.log(listaDeFilmes);
  searchContainer?.appendChild(ul);
});

function preencherSenha() {
  password = document.getElementById("senha") as unknown as string;
  validateLoginButton();
}

function preencherLogin() {
  username = document.getElementById("login") as unknown as string;
  validateLoginButton();
}

function preencherApi() {
  apiKey = document.getElementById("api-key") as unknown as string;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

class HttpClient {
    //@ts-ignore
  static async get({ url, method, body = null }) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText,
          });
        }
      };
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText,
        });
      };

      if (body) {
        request.setRequestHeader(
          "Content-Type",
          "application/json;charset=UTF-8"
        );
        //@ts-ignore
        body = JSON.stringify(body);
      }
      request.send(body);
    });
  }
}

async function procurarFilme(query: string) {
  query = encodeURI(query);
  console.log(query);
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET",
  });
  return result;
}

async function adicionarFilme(filmeId: any) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET",
  });
  console.log(result);
}

async function criarRequestToken() {
  let result: any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET",
  });
  requestToken = result.request_token;
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    //@ts-ignore
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`,
    },
  });
}

async function criarSessao() {
  let result: any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET",
  });
  sessionId = result.session_id;
}

async function criarLista(nomeDaLista: any, descricao: any) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    //@ts-ignore
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br",
    },
  });
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId: any, listaId: any) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    //@ts-ignore
    body: {
      media_id: filmeId,
    },
  });
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET",
  });
  console.log(result);
}
