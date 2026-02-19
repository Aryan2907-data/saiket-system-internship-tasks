const postForm = document.getElementById("postForm");
const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const postsList = document.getElementById("postsList");
const emptyState = document.getElementById("emptyState");
const countBadge = document.getElementById("countBadge");

const formTitle = document.getElementById("formTitle");
const publishBtn = document.getElementById("publishBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const searchInput = document.getElementById("searchInput");
const clearAllBtn = document.getElementById("clearAllBtn");

let posts = [];
let editingId = null;

function uid() {
  return Date.now().toString();
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString(); // simple
}

function savePosts() {
  localStorage.setItem("task5_posts", JSON.stringify(posts));
}

function loadPosts() {
  const data = localStorage.getItem("task5_posts");
  posts = data ? JSON.parse(data) : [];
}

function resetForm() {
  editingId = null;
  postForm.reset();
  formTitle.textContent = "Create a New Post";
  publishBtn.textContent = "Publish Post";
  cancelEditBtn.style.display = "none";
}

function renderPosts(filterText = "") {
  const q = filterText.trim().toLowerCase();

  const visible = posts.filter(p => {
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    );
  });

  postsList.innerHTML = "";

  visible.forEach((p) => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">Published: ${formatDate(p.createdAt)}</div>
      <p>${escapeHtml(p.content)}</p>
      <div class="actions">
        <button class="small" data-action="edit" data-id="${p.id}">Edit</button>
        <button class="small danger" data-action="delete" data-id="${p.id}">Delete</button>
      </div>
    `;
    postsList.appendChild(div);
  });

  countBadge.textContent = posts.length.toString();
  emptyState.style.display = posts.length === 0 ? "block" : "none";
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Add / Update Post
postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title || !content) return;

  if (editingId) {
    // update
    posts = posts.map(p => p.id === editingId ? { ...p, title, content } : p);
    savePosts();
    resetForm();
    renderPosts(searchInput.value);
    return;
  }

  // create
  const newPost = {
    id: uid(),
    title,
    content,
    createdAt: Date.now()
  };
  posts.unshift(newPost);
  savePosts();
  resetForm();
  renderPosts(searchInput.value);
});

// Edit / Delete actions (event delegation)
postsList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = btn.getAttribute("data-id");

  if (action === "delete") {
    const ok = confirm("Delete this post?");
    if (!ok) return;
    posts = posts.filter(p => p.id !== id);
    savePosts();
    renderPosts(searchInput.value);
  }

  if (action === "edit") {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    editingId = id;
    titleInput.value = post.title;
    contentInput.value = post.content;

    formTitle.textContent = "Edit Post";
    publishBtn.textContent = "Update Post";
    cancelEditBtn.style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

// Search
searchInput.addEventListener("input", () => {
  renderPosts(searchInput.value);
});

// Clear all
clearAllBtn.addEventListener("click", () => {
  if (posts.length === 0) return;
  const ok = confirm("Clear all posts?");
  if (!ok) return;
  posts = [];
  savePosts();
  resetForm();
  renderPosts("");
});

// Init
loadPosts();
renderPosts("");
