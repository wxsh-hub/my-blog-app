<template>
  <div class="min-h-screen bg-gray-50 pb-20 font-sans">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-4 py-3 backdrop-blur-md border-b border-gray-100">
      <h1 class="text-xl font-bold text-gray-900 tracking-tight">我的时刻</h1>
      <div class="flex items-center gap-4">
        <template v-if="isLoggedIn">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
              ME
            </div>
            <button @click="logout" class="text-sm text-gray-500 hover:text-red-500 transition-colors">退出</button>
          </div>
        </template>
        <button v-else @click="showLoginModal = true" class="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-sm">
          登录
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-2xl px-4 pt-6 space-y-6">
      <!-- 发布框 (仅登录可见) -->
      <section v-if="isLoggedIn" class="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <textarea
          v-model="newPost.content"
          placeholder="分享这一刻的想法..."
          class="w-full resize-none border-none bg-transparent p-0 text-gray-700 placeholder-gray-400 focus:ring-0 text-lg"
          rows="3"
        ></textarea>

        <!-- 图片预览区 -->
        <div v-if="newPost.images.length > 0" class="mt-3 grid grid-cols-3 gap-2">
          <div v-for="(img, idx) in newPost.images" :key="idx" class="relative aspect-square">
            <img :src="img" class="h-full w-full rounded-lg object-cover" />
            <button @click="removeImage(idx)" class="absolute -right-2 -top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">
              <XIcon :size="14" />
            </button>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
          <label class="flex cursor-pointer items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <ImageIcon :size="20" />
            <span class="text-sm font-medium">添加图片</span>
            <input type="file" class="hidden" accept="image/*" multiple @change="handleImageUpload" />
          </label>
          <button
            @click="publishPost"
            :disabled="!newPost.content && newPost.images.length === 0"
            class="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-blue-100"
          >
            发布
          </button>
        </div>
      </section>

      <!-- 帖子列表 -->
      <div v-for="post in posts" :key="post.id" class="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <!-- 帖子头部 -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
              <UserIcon :size="20" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ post.author }}</h3>
              <p class="text-xs text-gray-400">{{ post.time }}</p>
            </div>
          </div>
          <button class="text-gray-300 hover:text-gray-500">
            <MoreHorizontalIcon :size="20" />
          </button>
        </div>

        <!-- 帖子内容 -->
        <p class="mt-3 text-[17px] leading-relaxed text-gray-800 whitespace-pre-wrap">{{ post.content }}</p>

        <!-- 图片网格 -->
        <div v-if="post.images && post.images.length > 0"
             :class="['mt-3 grid gap-2', post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-3']">
          <img
            v-for="(img, idx) in post.images"
            :key="idx"
            :src="img"
            class="w-full rounded-xl object-cover hover:opacity-90 transition-opacity cursor-zoom-in"
            :class="post.images.length === 1 ? 'max-h-96' : 'aspect-square'"
          />
        </div>

        <!-- 交互栏 -->
        <div class="mt-5 flex items-center gap-6 border-t border-gray-50 pt-4">
          <button
            @click="toggleLike(post)"
            class="flex items-center gap-2 transition-colors"
            :class="post.isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'"
          >
            <HeartIcon :size="20" :fill="post.isLiked ? 'currentColor' : 'none'" />
            <span class="text-sm font-medium">{{ post.likes }}</span>
          </button>
          <button
            @click="focusComment(post.id)"
            class="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircleIcon :size="20" />
            <span class="text-sm font-medium">{{ post.comments.length }}</span>
          </button>
        </div>

        <!-- 评论列表 -->
        <div v-if="post.comments.length > 0" class="mt-4 space-y-2 rounded-xl bg-gray-50 p-3">
          <div v-for="(comment, cIdx) in post.comments" :key="cIdx" class="text-sm">
            <span class="font-bold text-blue-700">{{ comment.user }}: </span>
            <span class="text-gray-700">{{ comment.text }}</span>
          </div>
        </div>

        <!-- 发表评论 (仅登录可见) -->
        <div v-if="isLoggedIn" class="mt-4 flex gap-2">
          <input
            v-model="post.newComment"
            type="text"
            placeholder="写下你的评论..."
            class="flex-1 rounded-full border-none bg-gray-100 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 transition-all"
            @keyup.enter="addComment(post)"
          />
          <button
            @click="addComment(post)"
            class="text-blue-600 text-sm font-bold px-2 hover:scale-110 transition-transform"
          >
            发送
          </button>
        </div>
      </div>
    </main>

    <!-- 简易登录弹窗 -->
    <div v-if="showLoginModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-gray-900">欢迎回来</h2>
          <p class="text-gray-500 mt-1">登录以发布动态或互动</p>
        </div>
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">用户名</label>
            <input v-model="loginForm.username" type="text" class="w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:ring-0 transition-all" placeholder="请输入用户名" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">密码</label>
            <input v-model="loginForm.password" type="password" class="w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:ring-0 transition-all" placeholder="请输入密码" />
          </div>
          <button @click="login" class="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-2">
            立即登录
          </button>
          <button @click="showLoginModal = false" class="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
            稍后再说
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  HeartIcon,
  MessageCircleIcon,
  ImageIcon,
  XIcon,
  UserIcon,
  MoreHorizontalIcon
} from 'lucide-vue-next'

// 状态管理
const isLoggedIn = ref(false)
const showLoginModal = ref(false)
const loginForm = reactive({ username: '', password: '' })

// 模拟初始数据
const posts = ref([
  {
    id: 1,
    author: '开发者小王',
    time: '2小时前',
    content: '今天终于把 Vue3 + Tailwind 的博客原型写完了！下一步准备接入 Java 后端。🚀',
    images: ['/placeholder.svg?height=600&width=800'],
    likes: 12,
    isLiked: false,
    comments: [
      { user: '路人A', text: '太牛了，求教程！' },
      { user: '同学B', text: '这个 UI 风格很清爽。' }
    ],
    newComment: ''
  },
  {
    id: 2,
    author: '旅行家',
    time: '昨天 18:30',
    content: '夕阳无限好，只是近黄昏。',
    images: [
      '/placeholder.svg?height=400&width=400',
      '/placeholder.svg?height=400&width=400',
      '/placeholder.svg?height=400&width=400'
    ],
    likes: 45,
    isLiked: true,
    comments: [],
    newComment: ''
  }
])

const newPost = reactive({
  content: '',
  images: []
})

// 功能方法
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      newPost.images.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  newPost.images.splice(index, 1)
}

const publishPost = () => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }

  const post = {
    id: Date.now(),
    author: loginForm.username || '当前用户',
    time: '刚刚',
    content: newPost.content,
    images: [...newPost.images],
    likes: 0,
    isLiked: false,
    comments: [],
    newComment: ''
  }

  posts.value.unshift(post)
  newPost.content = ''
  newPost.images = []
}

const toggleLike = (post) => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

const addComment = (post) => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  if (!post.newComment.trim()) return

  post.comments.push({
    user: loginForm.username || '我',
    text: post.newComment
  })
  post.newComment = ''
}

const login = () => {
  // 这里后续接入后端 API
  if (loginForm.username && loginForm.password) {
    isLoggedIn.value = true
    showLoginModal.value = false
  }
}

const logout = () => {
  isLoggedIn.value = false
  loginForm.username = ''
  loginForm.password = ''
}
</script>

<style scoped>
/* 隐藏滚动条但保留功能 */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
