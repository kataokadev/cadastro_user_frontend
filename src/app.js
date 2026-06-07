const BASE_URL = "https://cadastro-usuario-production.up.railway.app";
const ENDPOINT = `${BASE_URL}/users`;

document.getElementById("baseUrlDisplay").textContent = BASE_URL;

let usuarioAtual = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchId").addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarUsuario();
  });

  document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) fecharModal();
  });
});

async function buscarUsuario() {
  const id = document.getElementById("searchId").value.trim();

  if (!id) {
    mostrarToast("Enter an ID to search.", "error");
    return;
  }

  try {
    const res = await fetch(`${ENDPOINT}?id=${id}`);
    cache: "no-store";
    if (res.status === 404 || res.status === 500 || !res.ok) {
      usuarioAtual = null;
      mostrarNotFound();
      return;
    }

    usuarioAtual = await res.json();
    mostrarCard(usuarioAtual);
  } catch (err) {
    mostrarToast(
      "Unable to connect to the API. Please check if it is running.",
      "error",
    );
  }
}

async function salvarUsuario() {
  const id = document.getElementById("editId").value;
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!nome) {
    mostrarToast("The Name field is required.", "error");
    document.getElementById("nome").focus();
    return;
  }

  if (!email) {
    mostrarToast("The Email field is required.", "error");
    document.getElementById("email").focus();
    return;
  }

  const payload = { nome, email };

  try {
    if (id) {
      const res = await fetch(`${ENDPOINT}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      mostrarToast("User updated successfully!", "success");
      cancelarEdicao();
      document.getElementById("searchId").value = id;
      await buscarUsuario();
    } else {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      mostrarToast("User registered successfully!", "success");
      limparForm();
    }
  } catch (err) {
    mostrarToast("Error saving user. Please check the API..", "error");
  }
}

async function deletarUsuario() {
  if (!usuarioAtual) return;

  try {
    const res = await fetch(`${ENDPOINT}?id=${usuarioAtual.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error(`Erro ${res.status}`);

    mostrarToast("User removed.", "success");
    fecharModal();
    usuarioAtual = null;
    limparResultado();
    document.getElementById("searchId").value = "";
  } catch (err) {
    mostrarToast("Error removing user.", "error");
    fecharModal();
  }
}

function mostrarCard(usuario) {
  esconderEstados();

  document.getElementById("userCard").style.display = "flex";
  document.getElementById("cardName").textContent = usuario.nome || "—";
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

function preencherForm() {
  if (!usuarioAtual) return;

  document.getElementById("editId").value = usuarioAtual.id;
  document.getElementById("nome").value = usuarioAtual.nome || "";
  document.getElementById("email").value = usuarioAtual.email || "";

  document.getElementById("formTitle").textContent = "Edit User";
  document.getElementById("formSub").textContent = `ID: ${usuarioAtual.id}`;
  document.getElementById("btnSalvar").innerHTML =
    '<span class="btn__icon">✎</span> Update';
  document.getElementById("btnCancelar").style.display = "inline-flex";

  document
    .getElementById("name")
    .scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("name").focus();
}

function cancelarEdicao() {
  limparForm();
}

function limparForm() {
  document.getElementById("editId").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";

  document.getElementById("formTitle").textContent = "New User";
  document.getElementById("formSub").textContent =
    "Fill in the fields to register";
  document.getElementById("btnSalvar").innerHTML =
    '<span class="btn__icon">+</span> Save';
  document.getElementById("btnCancelar").style.display = "none";
}

function abrirModal() {
  document.getElementById("overlay").classList.add("visible");
}

function fecharModal() {
  document.getElementById("overlay").classList.remove("visible");
}

function mostrarToast(msg, tipo = "info") {
  const toast = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;

  toast.className = `toast ${tipo} visible`;

  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("visible"), 3200);
}
