// =============================================
//  CONFIGURAÇÃO — altere a URL base aqui
//  quando for conectar ao backend
// =============================================
const BASE_URL = "http://cadastro-usuario-production.up.railway.app";
const ENDPOINT = `${BASE_URL}/users`;

document.getElementById("baseUrlDisplay").textContent = BASE_URL;

// =============================================
//  ESTADO
// =============================================
let usuarioAtual = null;

// =============================================
//  INICIALIZAÇÃO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchId").addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarUsuario();
  });

  document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) fecharModal();
  });
});

// =============================================
//  FETCH — BUSCAR POR ID
//  GET /users?id={id}
// =============================================
async function buscarUsuario() {
  const id = document.getElementById("searchId").value.trim();

  if (!id) {
    mostrarToast("Digite um ID para buscar.", "error");
    return;
  }

  try {
    const res = await fetch(`${ENDPOINT}?id=${id}`);

    if (res.status === 404 || res.status === 500 || !res.ok) {
      usuarioAtual = null;
      mostrarNotFound();
      return;
    }

    usuarioAtual = await res.json();
    mostrarCard(usuarioAtual);
  } catch (err) {
    mostrarToast(
      "Não foi possível conectar à API. Verifique se está rodando.",
      "error",
    );
  }
}

// =============================================
//  FETCH — SALVAR (criar ou atualizar)
//  POST /users  |  PUT /users?id={id}
// =============================================
async function salvarUsuario() {
  const id = document.getElementById("editId").value;
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!nome) {
    mostrarToast("O campo Nome é obrigatório.", "error");
    document.getElementById("nome").focus();
    return;
  }

  if (!email) {
    mostrarToast("O campo E-mail é obrigatório.", "error");
    document.getElementById("email").focus();
    return;
  }

  const payload = { nome, email };

  try {
    if (id) {
      // ATUALIZAR — PUT /users?id={id}
      const res = await fetch(`${ENDPOINT}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      mostrarToast("Usuário atualizado com sucesso!", "success");
      cancelarEdicao();
      document.getElementById("searchId").value = id;
      await buscarUsuario();
    } else {
      // CRIAR — POST /users
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      mostrarToast("Usuário cadastrado com sucesso!", "success");
      limparForm();
    }
  } catch (err) {
    mostrarToast("Erro ao salvar usuário. Verifique a API.", "error");
  }
}

// =============================================
//  FETCH — DELETAR
//  DELETE /users?id={id}
// =============================================
async function deletarUsuario() {
  if (!usuarioAtual) return;

  try {
    const res = await fetch(`${ENDPOINT}?id=${usuarioAtual.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error(`Erro ${res.status}`);

    mostrarToast("Usuário removido.", "success");
    fecharModal();
    usuarioAtual = null;
    limparResultado();
    document.getElementById("searchId").value = "";
  } catch (err) {
    mostrarToast("Erro ao remover usuário.", "error");
    fecharModal();
  }
}

// =============================================
//  UI — MOSTRAR CARD
// =============================================
function mostrarCard(usuario) {
  esconderEstados();

  document.getElementById("userCard").style.display = "flex";
  document.getElementById("cardNome").textContent = usuario.nome || "—";
  document.getElementById("cardEmail").textContent = usuario.email || "—";
  document.getElementById("cardId").textContent = `ID: ${usuario.id}`;

  const iniciais = (usuario.nome || "??")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  document.getElementById("userAvatar").textContent = iniciais;
}

function mostrarNotFound() {
  esconderEstados();
  document.getElementById("notFoundState").style.display = "flex";
}

function esconderEstados() {
  document.getElementById("emptyState").style.display = "none";
  document.getElementById("notFoundState").style.display = "none";
  document.getElementById("userCard").style.display = "none";
}

function limparResultado() {
  usuarioAtual = null;
  document.getElementById("emptyState").style.display = "flex";
  document.getElementById("notFoundState").style.display = "none";
  document.getElementById("userCard").style.display = "none";
  cancelarEdicao();
}

// =============================================
//  UI — FORM EDIÇÃO
// =============================================
function preencherForm() {
  if (!usuarioAtual) return;

  document.getElementById("editId").value = usuarioAtual.id;
  document.getElementById("nome").value = usuarioAtual.nome || "";
  document.getElementById("email").value = usuarioAtual.email || "";

  document.getElementById("formTitle").textContent = "Editar Usuário";
  document.getElementById("formSub").textContent = `ID: ${usuarioAtual.id}`;
  document.getElementById("btnSalvar").innerHTML =
    '<span class="btn__icon">✎</span> Atualizar';
  document.getElementById("btnCancelar").style.display = "inline-flex";

  document
    .getElementById("nome")
    .scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("nome").focus();
}

function cancelarEdicao() {
  limparForm();
}

function limparForm() {
  document.getElementById("editId").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";

  document.getElementById("formTitle").textContent = "Novo Usuário";
  document.getElementById("formSub").textContent =
    "Preencha os campos para cadastrar";
  document.getElementById("btnSalvar").innerHTML =
    '<span class="btn__icon">+</span> Salvar';
  document.getElementById("btnCancelar").style.display = "none";
}

// =============================================
//  UI — MODAL
// =============================================
function abrirModal() {
  document.getElementById("overlay").classList.add("visible");
}

function fecharModal() {
  document.getElementById("overlay").classList.remove("visible");
}

// =============================================
//  UI — TOAST
// =============================================
function mostrarToast(msg, tipo = "info") {
  const toast = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;

  toast.className = `toast ${tipo} visible`;

  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("visible"), 3200);
}
