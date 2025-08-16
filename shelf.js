// membuat var untuk meyimpan array dari Objectbuku
const buku = [];
// membuat custom event untuk merender hasil value di inputan
const RENDER_EVENT = "buku-self";
// membuat custom event untuk merender hasil value di inputan
document.addEventListener(RENDER_EVENT, function () {
  // untuk memastikan agar container dari todo bersih sebelum diperbarui, kita perlu membersihkannya dengan memanggil property innerHTML = "". Dengan demikian, tidak terjadi duplikasi data ketika menambahkan elemen DOM yang baru dengan append().
  const yetBaca = document.getElementById("yet-read");
  yetBaca.innerHTML = "";

  // Agar tidak terjadi duplikasi oleh item yang ada di tampilan ketika memperbarui data todo yang ditampilkan, maka hapus terlebih dahulu elemen sebelumnya (yang sudah ditampilkan) dengan perintah innerHTML = “”.
  const endBaca = document.getElementById("end-read");
  endBaca.innerHTML = "";
  // hasil dari fungsi makeTodo() yang kemudian dimasukkan pada variabel DOM yang sudah ada pada tampilan web (uncompletedTODOList) melalui fungsi append(). Sehingga, elemen tersebut bisa langsung di-render oleh webpage.
  for (const bukuItem of buku) {
    const bukuElement = makeTodo(bukuItem);
    if (!bukuItem.isCompleted) {
      // todo yang belum dikerjakan akan diletakkan pada “Yang harus dibaca”.
      yetBaca.append(bukuElement);
    } else {
      endBaca.append(bukuElement);
    }
  }
});

// memload conten DOM lalu menyimpan hasil dari form
document.addEventListener("DOMContentLoaded", function () {
  //  Kode di atas adalah sebuah listener yang akan menjalankan kode yang ada didalamnya ketika event DOMContentLoaded dibangkitkan alias ketika semua elemen HTML sudah dimuat menjadi DOM dengan baik.
  const submitForm = document.getElementById("form");
  // Ketika semua elemen sudah dimuat dengan baik, maka kita perlu mempersiapkan elemen form untuk menangani event submit, di mana aksi tersebut dibungkus dan dijalankan oleh fungsi addTodo(), untuk menambahkan todo baru.
  // 🟡 MODIFIKASI UNTUK EDIT DAN TAMBAH
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("judul").value.trim();
    const author = document.getElementById("penulis").value.trim();
    const year = document.getElementById("tahun").value.trim();

    if (!title || !author || !year || isNaN(year)) {
      alert("Data tidak valid. Pastikan semua kolom terisi dan tahun berupa angka.");
      return;
    }

    if (isEditing && editingTodoId !== null) {
      // 🟡 MODE EDIT
      const todoTarget = findTodo(editingTodoId);
      if (todoTarget) {
        todoTarget.title = title;
        todoTarget.author = author;
        todoTarget.year = parseInt(year);
        alert("Data berhasil diperbarui");
      }
    } else {
      // 🟡 MODE TAMBAH
      const ID = generateId();
      const bukuObject = generateObject(ID, title, author, year, false);
      buku.push(bukuObject);
      alert("Buku berhasil ditambahkan");
    }

    // 🟡 RESET FORM DAN STATUS
    isEditing = false;
    editingTodoId = null;
    document.getElementById("form").reset();

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// membuat generate ID
function generateId() {
  //  berfungsi untuk menghasilkan identitas unik pada setiap item todo. Untuk menghasilkan identitas yang unik, kita manfaatkan +new Date() untuk mendapatkan timestamp pada JavaScript.
  // return +new Date();
  return +new Date().getTime();
}

// membuat tipe data yang disimpan
function generateObject(id, title, author, year, isCompleted) {
  // berfungsi untuk membuat object baru dari data yang sudah disediakan dari inputan (parameter function), diantaranya id, nama todo (task), waktu (timestamp), dan isCompleted (penanda todo apakah sudah selesai atau belum)
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function addTodo() {
  // const judulBuku = document.getElementById("judul").value;
  // const penulisBuku = document.getElementById("penulis").value;
  // const tahunBuku = document.getElementById("tahun").value;
  const judulBuku = document.getElementById("judul").value.trim();
  const penulisBuku = document.getElementById("penulis").value.trim();
  const tahunBuku = document.getElementById("tahun").value.trim();

  if (!judulBuku || !penulisBuku || !tahunBuku) {
    alert("Semua kolom harus diisi!");
    return;
  }

  // kita akan membuat ID dari funngsi generate ID .
  const ID = generateId();
  // kita akan membuat sebuah object dari buku dengan memanggil helper generateTodoObject() untuk membuat object baru. Kemudian, object tersebut disimpan pada array buku menggunakan metode push().
  const bukuObject = generateObject(ID, judulBuku, penulisBuku, tahunBuku, false);
  buku.push(bukuObject);

  // Setelah disimpan pada array, kita panggil sebuah custom event RENDER_EVENT menggunakan method dispatchEvent(). Custom event ini akan kita terapkan untuk me-render data yang telah disimpan pada array buku.
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// membuat fungsi yang menghasilkan sebuah item untuk mengisi container yang harus dilakukan
function makeTodo(bukuObject) {
  // berfungsi untuk membuat objek DOM, yakni elemen HTML.
  // menyematkan konten berupa teks (tak berformat HTML) pada elemen HTML
  const textTimestamp = document.createElement("p");
  const textTitle = document.createElement("h2");
  const textAuthor = document.createElement("h6");
  // elemen baru ini aksan memiliki properti innerText.
  textTimestamp.innerText = bukuObject.year;
  textTitle.innerText = bukuObject.title;
  textAuthor.innerText = "Penulis: " + bukuObject.author;

  const textContainer = document.createElement("div");
  //  property classList, yang mana kita bisa menambahkan satu atau beberapa class
  textContainer.classList.add("inner");
  // teks yang berada di variabel textTimestamp dan textTitle merupakan konten atau child element dari <div> (variabel textContainer). Untuk mencapai ini, kita bisa menggunakan method append() dari variabel textContainer (elemen container) tersebut.
  textContainer.append(textTimestamp, textTitle, textAuthor);

  const container = document.createElement("div");
  container.classList.add("item", "list");
  container.append(textContainer);
  // untuk menetapkan id pada elemen, kita bisa menggunakan setAttributes("id", "").
  container.setAttribute("id", `list-${bukuObject.id}`);
  // container.setAttribute("id", "bukuObject.id");

  // implementasikan fungsi check, uncheck dan menghapus todo.
  if (bukuObject.isCompleted) {
    // tombol undoButton & trashButton, juga menerapkan hal yang sama, di mana memanggil fungsi undoTaskFromCompleted dan removeTaskFromCompleted. Yang mana masing - masing akan memindahkan todo dari selesai ke belum selesai, dan menghapus todo.
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bukuObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bukuObject.id);
    });
    
    container.append(undoButton, trashButton);
  } else {
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bukuObject.id);
    });
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    // editButton.innerText = "Edit";

    editButton.addEventListener("click", function () {
      editTodo(bukuObject.id);
    });
    // tombol ini (checkButton) memanggil addTaskToCompleted, yang mana akan memindahkan todo dari rak “Yang harus dilakukan” ke rak “Yang sudah dilakukan”.
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bukuObject.id);
    });

    container.append(checkButton, editButton, trashButton);
  }

  return container;
}

// menyimpan perubahan ke local storage
function saveData() {
  // periksa terlebih dahulu sebelum mulai eksekusi kode simpan ke storage
  // localStorage.setItem(STORAGE_KEY, buku);
  if (isStorageExist()) {
    // diperlukan konversi data object ke string agar bisa disimpan
    const parsed = JSON.stringify(buku);
    // Menyimpan data ke storage sesuai dengan key yang kita tentukan
    localStorage.setItem(STORAGE_KEY, parsed);
    // mempermudah debugging atau tracking ketika terjadi perubahan data, kita akan memanggil sebuah custom event baru yang bernama "saved-todo"
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() /* boolean */ {
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
    for (const todo of data) {
      buku.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
// untuk memindahkan todo dari rak “Yang harus dilakukan” ke “Yang sudah dilakukan”.
function addTaskToCompleted(bukuId) {
  const bukuTarget = findTodo(bukuId);

  if (bukuTarget == null) return;

  bukuTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("Buku telah selesai dibaca");
}

// Tambahkan variabel global untuk menyimpan ID buku yang sedang diedit
let isEditing = false;
let editingTodoId = null;

function editTodo(todoId) {
  const todoTarget = findTodo(todoId);
  if (!todoTarget) return;

  // Isi form dengan data buku
  document.getElementById("judul").value = todoTarget.title;
  document.getElementById("penulis").value = todoTarget.author;
  document.getElementById("tahun").value = todoTarget.year;

  // Set status edit
  isEditing = true;
  editingTodoId = todoId;

  // Scroll ke form agar user langsung lihat
  document.getElementById("form").scrollIntoView({ behavior: "smooth" });
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  // Jika todo tidak ditemukan
  if (todoTarget === -1) {
    alert("Data tidak ditemukan.");
    return;
  }

  // Konfirmasi sebelum menghapus
  const isConfirmed = confirm("Apakah Anda yakin ingin menghapus data ini?");
  if (!isConfirmed) return;

  // Hapus data dari array
  buku.splice(todoTarget, 1);

  // Render ulang tampilan
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Simpan perubahan ke storage
  saveData();

  // Beri notifikasi ke pengguna
  alert("Data berhasil dihapus");
}

function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  // pada state isCompleted yang diubah nilainya ke false, hal ini bertujuan agar todo task yang sebelumnya completed (selesai), bisa dipindah menjadi incomplete (belum selesai).
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// untuk mencari todo dengan ID yang sesuai pada array todos.
function findTodo(bukuId) {
  for (const bukuItem of buku) {
    if (bukuItem.id === bukuId) {
      return bukuItem;
    }
  }
  return null;
}

// perbaiki bug untuk tomvol undo & hapus
function findTodoIndex(todoId) {
  for (const index in buku) {
    if (buku[index].id === todoId) {
      return index;
    }
  }

  return -1;
}

// console.log(generateId())
const STORAGE_KEY = "BOOK-SHELF";
// event listener tersebut kita bisa memanggil getItem(KEY) untuk mengambil data dari localStorage, lalu bisa kita tampilkan secara sederhana
const SAVED_EVENT = "saved-buku";
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});


// catatan untuk Reviewer
// saya menambahkan sedikit info footer dan juga ikon external serta script yang mengatur inputan tahun agar bersifat integer saja