<template>
  <div class="min-h-screen bg-background font-sans antialiased text-foreground">
    <el-container>
      <el-header>
        <NavBar
          :is-logged-in="isLoggedIn"
          :username="username"
          @login="showLoginModal = true"
          @logout="logout"
        />
      </el-header>

      <el-main>
        <main>
          <BlogFeed2
            :is-logged-in="isLoggedIn"
            :current-user="username"
            @require-login="showLoginModal = true"
          /></main
      ></el-main>

      <el-footer>
      </el-footer
      >

    </el-container>
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Login</h2>
        <p class="text-muted-foreground mb-6">
          Enter your username to start posting and interacting.
        </p>
        <input
          v-model="loginInput"
          placeholder="Username"
          class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-4"
          @keyup.enter="login"
        />
        <div class="flex gap-3">
          <button
            @click="showLoginModal = false"
            class="flex-1 h-10 rounded-md border hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            @click="login"
            class="flex-1 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "./components/NavBar.vue";
//import BlogFeed from "./components/BlogFeed.vue";
import BlogFeed2 from "./components/BlogFeed2.vue";

const isLoggedIn = ref(false);
const username = ref("");
const loginInput = ref("");
const showLoginModal = ref(false);


const login = () => {
  if (loginInput.value.trim()) {
    isLoggedIn.value = true;
    username.value = loginInput.value;
    showLoginModal.value = false;
    loginInput.value = "";
  }
};

const logout = () => {
  isLoggedIn.value = false;
  username.value = "";
};


</script>
