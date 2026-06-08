const apiBaseUrl = "/api";
const fallbackImage =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="#eef2f6"/><circle cx="200" cy="108" r="28" fill="#0866ff"/><circle cx="160" cy="82" r="14" fill="#0866ff"/><circle cx="190" cy="68" r="14" fill="#0866ff"/><circle cx="220" cy="68" r="14" fill="#0866ff"/><circle cx="250" cy="82" r="14" fill="#0866ff"/><text x="200" y="178" text-anchor="middle" font-family="Arial" font-size="18" fill="#18212f">Sem imagem</text></svg>'
  );

const loginSection = document.querySelector("#login-section");
const adminSection = document.querySelector("#admin-section");
const listSection = document.querySelector("#list-section");
const loginForm = document.querySelector("#login-form");
const animalForm = document.querySelector("#animal-form");
const loginMessage = document.querySelector("#login-message");
const animalMessage = document.querySelector("#animal-message");
const animalsList = document.querySelector("#animals-list");
const formTitle = document.querySelector("#form-title");
const saveAnimalButton = document.querySelector("#save-animal-button");
const cancelEditButton = document.querySelector("#cancel-edit-button");
const imageInput = document.querySelector("#animal-image");
const imageDropZone = document.querySelector("#image-drop-zone");
const imagePreview = document.querySelector("#image-preview");
const imageHelp = document.querySelector("#image-help");
const deleteModal = document.querySelector("#delete-modal");
const deleteMessage = document.querySelector("#delete-message");
const cancelDeleteButton = document.querySelector("#cancel-delete-button");
const confirmDeleteButton = document.querySelector("#confirm-delete-button");

let selectedImage = "";
let pendingDeleteId = "";
let pendingDeleteName = "";
let editingAnimalId = "";
let editingAnimalImage = "";
let currentAnimals = [];
const maxImageWidth = 900;
const maxImageHeight = 650;
const imageQuality = 0.82;

function getToken() {
  return localStorage.getItem("adminToken");
}

function setLoggedIn(loggedIn) {
  loginSection.hidden = loggedIn;
  adminSection.hidden = !loggedIn;
  listSection.hidden = !loggedIn;
  loginSection.classList.toggle("hidden", loggedIn);
  adminSection.classList.toggle("hidden", !loggedIn);
  listSection.classList.toggle("hidden", !loggedIn);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Erro na requisicao.");
    error.status = response.status;
    throw error;
  }

  return data;
}

function normalizeAnimal(animal) {
  return {
    ...animal,
    id: animal._id || animal.id,
    image: animal.image || fallbackImage,
    age: animal.age || "Nao informado",
    description: animal.description || "Sem descricao disponivel.",
    source: "MongoDB",
  };
}

function createText(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function createInfo(label, value) {
  const paragraph = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;
  paragraph.append(strong, value || "");
  return paragraph;
}

function renderAnimals(animals) {
  animalsList.replaceChildren();

  animals.forEach((animal) => {
    const card = document.createElement("article");
    card.className = "card";

    const image = document.createElement("img");
    image.src = animal.image;
    image.alt = animal.name;
    image.addEventListener("error", () => {
      if (image.dataset.fallbackApplied === "true") {
        return;
      }

      image.dataset.fallbackApplied = "true";
      image.src = fallbackImage;
    });

    const body = document.createElement("div");
    body.className = "card-body";
    body.append(
      createText("h3", animal.name),
      createInfo("Fonte", animal.source),
      createInfo("Especie", animal.type),
      createInfo("Idade", animal.age),
      createText("p", animal.description)
    );

    if (animal._id) {
      const actions = document.createElement("div");
      actions.className = "card-actions";

      const editButton = document.createElement("button");
      editButton.className = "secondary";
      editButton.type = "button";
      editButton.dataset.editId = animal._id;
      editButton.textContent = "Editar";

      const deleteButton = document.createElement("button");
      deleteButton.className = "danger";
      deleteButton.type = "button";
      deleteButton.dataset.deleteId = animal._id;
      deleteButton.dataset.deleteName = animal.name;
      deleteButton.textContent = "Remover";

      actions.append(editButton, deleteButton);
      body.append(actions);
    }

    card.append(image, body);
    animalsList.append(card);
  });
}

function clearImageSelection() {
  selectedImage = "";
  imageInput.value = "";
  imagePreview.removeAttribute("src");
  imagePreview.style.display = "none";
  imageHelp.textContent = "Clique para selecionar ou arraste uma imagem aqui";
}

function setMessage(element, text, type) {
  element.textContent = text;
  element.classList.remove("success", "error");

  if (type) {
    element.classList.add(type);
  }
}

function handleAuthError(error) {
  if (error.status === 401 || error.status === 403) {
    localStorage.removeItem("adminToken");
    setLoggedIn(false);
    setMessage(loginMessage, "Sessao expirada ou token invalido. Faca login novamente.", "error");
    return true;
  }

  return false;
}

function setButtonLoading(button, isLoading, loadingText, defaultText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
}

function resetAnimalForm() {
  editingAnimalId = "";
  editingAnimalImage = "";
  animalForm.reset();
  clearImageSelection();
  formTitle.textContent = "Cadastro de animais";
  saveAnimalButton.textContent = "Cadastrar";
  cancelEditButton.classList.add("hidden");
}

function startEditAnimal(animalId) {
  const animal = currentAnimals.find((item) => item._id === animalId);

  if (!animal) {
    setMessage(animalMessage, "Animal nao encontrado para edicao.", "error");
    return;
  }

  editingAnimalId = animal._id;
  editingAnimalImage = animal.image || fallbackImage;
  document.querySelector("#animal-name").value = animal.name || "";
  document.querySelector("#animal-type").value = animal.type || "";
  document.querySelector("#animal-age").value = animal.age || "";
  document.querySelector("#animal-location").value = animal.location || "";
  document.querySelector("#animal-description").value = animal.description || "";
  setSelectedImage(editingAnimalImage);
  formTitle.textContent = `Editando: ${animal.name}`;
  saveAnimalButton.textContent = "Salvar alteracoes";
  cancelEditButton.classList.remove("hidden");
  setMessage(animalMessage, "Modo edicao ativo. Altere os campos e salve.", "success");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setSelectedImage(dataUrl) {
  selectedImage = dataUrl;
  imagePreview.src = dataUrl;
  imagePreview.style.display = "block";
  imageHelp.textContent = "Imagem selecionada. Clique ou arraste outra para trocar.";
}

function readImageFile(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    animalMessage.textContent = "Selecione um arquivo de imagem.";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const image = new Image();
    image.addEventListener("load", () => {
      const scale = Math.min(maxImageWidth / image.width, maxImageHeight / image.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setSelectedImage(canvas.toDataURL("image/jpeg", imageQuality));
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
}

async function loadAnimals() {
  animalsList.textContent = "Carregando...";

  try {
    const response = await requestJson(`${apiBaseUrl}/animals/admin/list?limit=100`, {
      headers: authHeaders(),
    });
    const animals = (response.items || []).map(normalizeAnimal);
    currentAnimals = animals;

    if (animals.length === 0) {
      animalsList.innerHTML = '<p class="empty-state">Nenhum animal cadastrado no banco.</p>';
      return;
    }

    renderAnimals(animals);
  } catch (error) {
    if (handleAuthError(error)) {
      return;
    }

    animalsList.innerHTML = '<p class="empty-state">Erro ao carregar animais do banco.</p>';
    setMessage(animalMessage, "Erro ao carregar animais. Verifique se o MongoDB e o backend estao rodando.", "error");
  }
}

async function deleteAnimal(id) {
  await requestJson(`${apiBaseUrl}/animals/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await loadAnimals();
}

function openDeleteModal(id, name) {
  pendingDeleteId = id;
  pendingDeleteName = name;
  deleteMessage.textContent = `O animal "${pendingDeleteName}" sera removido do banco e nao aparecera mais na listagem.`;
  deleteModal.classList.add("open");
}

function closeDeleteModal() {
  pendingDeleteId = "";
  pendingDeleteName = "";
  deleteModal.classList.remove("open");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(loginMessage, "", "");

  try {
    const data = await requestJson("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.querySelector("#username").value,
        password: document.querySelector("#password").value,
      }),
    });

    localStorage.setItem("adminToken", data.token);
    setLoggedIn(true);
    setMessage(loginMessage, "Login realizado com sucesso.", "success");
    await loadAnimals();
  } catch (error) {
    setMessage(loginMessage, error.message || "Falha no login. Verifique usuario e senha.", "error");
  }
});

animalForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(animalMessage, "", "");

  const defaultButtonText = editingAnimalId ? "Salvar alteracoes" : "Cadastrar";
  setButtonLoading(saveAnimalButton, true, editingAnimalId ? "Salvando..." : "Cadastrando...", defaultButtonText);

  try {
    const method = editingAnimalId ? "PUT" : "POST";
    const url = editingAnimalId
      ? `${apiBaseUrl}/animals/${editingAnimalId}`
      : `${apiBaseUrl}/animals`;

    await requestJson(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify({
        name: document.querySelector("#animal-name").value,
        type: document.querySelector("#animal-type").value,
        age: document.querySelector("#animal-age").value || "Nao informado",
        description: document.querySelector("#animal-description").value,
        location: document.querySelector("#animal-location").value,
        image: selectedImage || editingAnimalImage || fallbackImage,
        origin: "Painel admin",
        status: "available",
      }),
    });

    setMessage(
      animalMessage,
      editingAnimalId ? "Animal atualizado com sucesso." : "Animal cadastrado com sucesso.",
      "success"
    );
    resetAnimalForm();
    await loadAnimals();
  } catch (error) {
    if (handleAuthError(error)) {
      return;
    }

    setMessage(
      animalMessage,
      editingAnimalId
        ? error.message || "Falha ao atualizar, verifique os campos."
        : error.message || "Falha ao cadastrar, verifique os campos.",
      "error"
    );
  } finally {
    setButtonLoading(saveAnimalButton, false, "", editingAnimalId ? "Salvar alteracoes" : "Cadastrar");
  }
});

animalsList.addEventListener("click", async (event) => {
  const deleteId = event.target.dataset.deleteId;
  const editId = event.target.dataset.editId;

  if (editId) {
    startEditAnimal(editId);
  } else if (deleteId) {
    openDeleteModal(deleteId, event.target.dataset.deleteName || "selecionado");
  }
});

cancelEditButton.addEventListener("click", () => {
  resetAnimalForm();
  setMessage(animalMessage, "Edicao cancelada.", "success");
});

cancelDeleteButton.addEventListener("click", closeDeleteModal);
deleteModal.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});
confirmDeleteButton.addEventListener("click", async () => {
  if (!pendingDeleteId) {
    return;
  }

  setButtonLoading(confirmDeleteButton, true, "Removendo...", "Remover");

  try {
    await deleteAnimal(pendingDeleteId);
    setMessage(animalMessage, "Animal removido com sucesso.", "success");
    closeDeleteModal();
    resetAnimalForm();
  } catch (error) {
    if (handleAuthError(error)) {
      closeDeleteModal();
      return;
    }

    setMessage(animalMessage, error.message || "Erro ao excluir animal.", "error");
  } finally {
    setButtonLoading(confirmDeleteButton, false, "", "Remover");
  }
});

document.querySelector("#refresh-button").addEventListener("click", async (event) => {
  setButtonLoading(event.target, true, "Atualizando...", "Atualizar lista");
  await loadAnimals();
  setButtonLoading(event.target, false, "", "Atualizar lista");
});
document.querySelector("#logout-button").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  resetAnimalForm();
  setMessage(animalMessage, "", "");
  setLoggedIn(false);
});

imageDropZone.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", () => readImageFile(imageInput.files[0]));

imageDropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  imageDropZone.classList.add("dragover");
});

imageDropZone.addEventListener("dragleave", () => {
  imageDropZone.classList.remove("dragover");
});

imageDropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  imageDropZone.classList.remove("dragover");
  readImageFile(event.dataTransfer.files[0]);
});

localStorage.removeItem("adminToken");
setLoggedIn(false);
