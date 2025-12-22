<template>
  <nav class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          B
        </div>
        <span class="text-xl font-bold tracking-tight">Personal Blog</span>
      </div>

      <div class="flex items-center gap-4">
        <template v-if="isLoggedIn">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium hidden md:block">Welcome, {{ username }}</span>
            <button
              @click="$emit('logout')"
              class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Logout
            </button>
          </div>
        </template>
        <template v-else>
          <button
            @click="$emit('login')"
            class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Login
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  isLoggedIn: Boolean,
  username: String
})

defineEmits(['login', 'logout'])
</script>
