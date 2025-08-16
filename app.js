const buku = [];
const RENDER_EVENT = "buku-self";

document.addEventListener(RENDER_EVENT, function () {
  const yetBaca = document.getElementById("yet-read");
  yetBaca.innerHTML = "";

  const endBaca = document.getElementById("end-read");
  endBaca.innerHTML = "";

  for (const bukuItem of buku) {
    const bukuElement = makeBuku(bukuItem);
    if (!bukuItem.isCompleted) {
      yetBaca.append(bukuElement);
    } else {
      endBaca.append(bukuElement);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("judul").value.trim();
    const author = document.getElementById("penulis").value.trim();
    const year = document.getElementById("tahun").value.trim();

    if (!title || !author || !year || isNaN(year)) {
      alert("Data tidak valid. Pastikan semua kolom terisi dan tahun berupa angka.");
      return;
    }

    if (isEditing && editingBukuId !== null) {
      const bukuTarget = findBuku(editingBukuId);
      if (bukuTarget) {
        bukuTarget.title = title;
        bukuTarget.author = author;
        bukuTarget.year = parseInt(year);
        alert("Data berhasil diperbarui");
      }
    } else {
      const ID = generateId();
      const bukuObject = generateObject(ID, title, author, year, false);
      buku.push(bukuObject);
      alert("Buku berhasil ditambahkan");
    }

    isEditing = false;
    editingBukuId = null;
    document.getElementById("form").reset();
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function generateId() {
  return +new Date().getTime();
}

function generateObject(id, title, author, year, isCompleted) {
  return { id, title, author, year, isCompleted };
}

function makeBuku(bukuObject) {
  const textTimestamp = document.createElement("p");
  const textTitle = document.createElement("h2");
  const textAuthor = document.createElement("h6");
  textTimestamp.innerText = bukuObject.year;
  textTitle.innerText = bukuObject.title;
  textAuthor.innerText = "Penulis: " + bukuObject.author;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTimestamp, textTitle, textAuthor);
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("tombol");
  
  if (bukuObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bukuObject.id);
    });

    buttonContainer.append(undoButton);
  } else {
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bukuObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function () {
      editBuku(bukuObject.id);
    });
    
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bukuObject.id);
    });
    
    buttonContainer.append(checkButton, editButton, trashButton);
  }
  const container = document.createElement("div");
  container.classList.add("item", "list");
  container.append(textContainer, buttonContainer);
  container.setAttribute("id", `list-${bukuObject.id}`);
  

  return container;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(buku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const bukuItem of data) {
      buku.push(bukuItem);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addTaskToCompleted(bukuId) {
  const bukuTarget = findBuku(bukuId);
  if (bukuTarget == null) return;
  bukuTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("Buku telah selesai dibaca");
}

let isEditing = false;
let editingBukuId = null;

function editBuku(bukuId) {
  const bukuTarget = findBuku(bukuId);
  if (!bukuTarget) return;

  document.getElementById("judul").value = bukuTarget.title;
  document.getElementById("penulis").value = bukuTarget.author;
  document.getElementById("tahun").value = bukuTarget.year;

  isEditing = true;
  editingBukuId = bukuId;

  document.getElementById("form").scrollIntoView({ behavior: "smooth" });
}

function removeTaskFromCompleted(bukuId) {
  const bukuTarget = findBukuIndex(bukuId);
  if (bukuTarget === -1) {
    alert("Data tidak ditemukan.");
    return;
  }
  const isConfirmed = confirm("Apakah Anda yakin ingin menghapus data ini?");
  if (!isConfirmed) return;
  buku.splice(bukuTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("Data berhasil dihapus");
}

function undoTaskFromCompleted(bukuId) {
  const bukuTarget = findBuku(bukuId);
  if (bukuTarget == null) return;
  bukuTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBuku(bukuId) {
  for (const bukuItem of buku) {
    if (bukuItem.id === bukuId) {
      return bukuItem;
    }
  }
  return null;
}

function findBukuIndex(bukuId) {
  for (const index in buku) {
    if (buku[index].id === bukuId) {
      return index;
    }
  }
  return -1;
}

const STORAGE_KEY = "BOOK-SHELF";
const SAVED_EVENT = "saved-buku";
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.getElementById("searchInput").addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  const bookItems = document.querySelectorAll(".item.list");

  bookItems.forEach(function (item) {
    const title = item.querySelector("h2").innerText.toLowerCase();
    if (title.includes(keyword)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
});