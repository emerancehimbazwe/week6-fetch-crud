
import "./style.css";
import { api, HttpError } from "./api/http.js";

const app = document.querySelector("#app");

let posts = [];
let searchTerm = "";

app.innerHTML = `
  <main class="max-w-7xl mx-auto px-6 md:px-10 py-12">

    <header class="mb-10">
      <p class="text-base font-bold text-indigo-600 uppercase tracking-wider">
        Week 6 · Fetch API
      </p>

      <h1 class="text-4xl md:text-5xl font-extrabold mt-3">
        CRUD Posts Manager
      </h1>

      <p class="text-lg text-slate-500 mt-3">
        Create, read, update and delete posts using JSONPlaceholder.
      </p>
    </header>

    <section class="bg-white rounded-2xl shadow-md p-7 md:p-9 mb-10">
      <h2 class="text-2xl font-bold mb-6">Create a Post</h2>

      <form id="post-form" class="space-y-5">

        <div>
          <label for="title" class="block text-lg font-semibold mb-2">
            Title
          </label>

          <input
            id="title"
            name="title"
            required
            placeholder="Enter post title"
            class="w-full border border-slate-300 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="body" class="block text-lg font-semibold mb-2">
            Content
          </label>

          <textarea
            id="body"
            name="body"
            required
            placeholder="Write your post..."
            rows="5"
            class="w-full border border-slate-300 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <button
          type="submit"
          class="bg-indigo-600 text-white rounded-xl px-7 py-4 text-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          Publish Post
        </button>

        <p id="form-status" role="status" aria-live="polite" class="text-base"></p>

      </form>
    </section>

    <section class="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

      <div>
        <h2 class="text-2xl md:text-3xl font-bold">All Posts</h2>
        <p class="text-base text-slate-500 mt-2">
          Manage your published posts.
        </p>
      </div>

      <div>
        <label for="user-filter" class="text-lg font-semibold mr-2">
          Filter by user:
        </label>

        <select
          id="user-filter"
          class="border border-slate-300 rounded-xl px-4 py-3 text-lg bg-white"
        >
          <option value="">All users</option>

          ${Array.from({ length: 10 }, (_, i) =>
            `<option value="${i + 1}">User ${i + 1}</option>`
          ).join("")}

        </select>
      </div>

    </section>

    <section class="mb-7">
      <label for="post-search" class="block text-lg font-semibold mb-2">
        Search posts by title
      </label>

      <input
        id="post-search"
        type="search"
        placeholder="Type a title to search..."
        class="w-full border border-slate-300 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </section>

    <p
      id="posts-status"
      role="status"
      aria-live="polite"
      class="mb-5 text-base text-slate-500"
    >
      Loading posts...
    </p>

    <section
      id="posts-container"
      class="grid gap-6 md:grid-cols-2"
    ></section>

  </main>
`;

const postsContainer = document.querySelector("#posts-container");
const postsStatus = document.querySelector("#posts-status");
const userFilter = document.querySelector("#user-filter");
const postSearch = document.querySelector("#post-search");
const postForm = document.querySelector("#post-form");
const formStatus = document.querySelector("#form-status");

// GET: Load posts
async function loadPosts(userId = "") {
  postsStatus.textContent = "Loading posts...";
  postsContainer.innerHTML = "";

  try {
    const params = new URLSearchParams({ _limit: "10" });

    if (userId) {
      params.set("userId", userId);
    }

    posts = await api.get(`/posts?${params}`);

    renderPosts();

  } catch (error) {
    postsStatus.textContent =
      error instanceof HttpError
        ? error.message
        : "Could not load posts. Please try again.";
  }
}

// Display posts
function renderPosts() {
  postsContainer.innerHTML = "";

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredPosts.length === 0) {
    postsStatus.textContent = "No matching posts found.";
    return;
  }

  postsStatus.textContent = `${filteredPosts.length} posts found`;

  filteredPosts.forEach((post) => {
    const card = document.createElement("article");

    card.className =
      "bg-white rounded-2xl shadow-md p-7 md:p-8 flex flex-col justify-between";

    const content = document.createElement("div");

    const title = document.createElement("h3");
    title.className = "text-xl md:text-2xl font-bold mb-4 leading-snug";
    title.textContent = post.title;

    const body = document.createElement("p");
    body.className = "text-base md:text-lg text-slate-600 leading-8";
    body.textContent = post.body;

    content.append(title, body);

    const actions = document.createElement("div");
    actions.className = "flex gap-4 mt-7";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className =
      "bg-amber-500 text-white px-6 py-3 text-base font-semibold rounded-xl hover:bg-amber-600";

    editButton.addEventListener("click", () => editPost(post.id));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className =
      "bg-red-600 text-white px-6 py-3 text-base font-semibold rounded-xl hover:bg-red-700";

    deleteButton.addEventListener("click", () => deletePost(post.id));

    actions.append(editButton, deleteButton);

    card.append(content, actions);
    postsContainer.appendChild(card);
  });
}

// Filter posts by user
userFilter.addEventListener("change", (event) => {
  loadPosts(event.target.value);
});

// Search posts by title
postSearch.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderPosts();
});

// POST: Create a new post
postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = postForm.querySelector("button");
  const data = Object.fromEntries(new FormData(postForm));

  button.disabled = true;
  formStatus.textContent = "Publishing post...";

  try {
    const createdPost = await api.post("/posts", {
      ...data,
      userId: 1,
    });

    if (userFilter.value === "" || userFilter.value === "1") {
      posts.unshift(createdPost);
      renderPosts();
    }

    formStatus.textContent =
      `Post published successfully! New ID: ${createdPost.id}`;

    postForm.reset();

  } catch (error) {
    formStatus.textContent =
      `Could not publish post: ${error.message}`;

  } finally {
    button.disabled = false;
  }
});

// PATCH: Edit post title
async function editPost(id) {
  const post = posts.find((item) => item.id === id);

  if (!post) return;

  const newTitle = prompt("Enter the new post title:", post.title);

  if (newTitle === null || newTitle.trim() === "") {
    return;
  }

  try {
    const updatedPost = await api.patch(`/posts/${id}`, {
      title: newTitle.trim(),
    });

    posts = posts.map((item) =>
      item.id === id
        ? { ...item, ...updatedPost }
        : item
    );

    renderPosts();

  } catch (error) {
    alert(`Could not update post: ${error.message}`);
  }
}

// DELETE: Delete a post
async function deletePost(id) {
  const confirmed = confirm("Are you sure you want to delete this post?");

  if (!confirmed) return;

  try {
    await api.del(`/posts/${id}`);

    posts = posts.filter((post) => post.id !== id);

    renderPosts();

  } catch (error) {
    alert(`Could not delete post: ${error.message}`);
  }
}

// Start the application
loadPosts();
