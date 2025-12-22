<template>
  <div class="mx-auto max-w-2xl py-8 px-4">
    <!-- Post Creation Card -->
    <div v-if="isLoggedIn" class="mb-8 rounded-xl border bg-card p-4 shadow-sm">
      <textarea
        v-model="newPostContent"
        placeholder="What's on your mind?"
        class="w-full resize-none border-none bg-transparent p-0 focus:ring-0 text-lg"
        rows="3"
      ></textarea>

      <!-- Image Preview -->
      <div v-if="selectedImages.length > 0" class="mt-4 grid grid-cols-3 gap-2">
        <div v-for="(img, index) in selectedImages" :key="index" class="relative aspect-square overflow-hidden rounded-lg">
          <img :src="img" class="h-full w-full object-cover" />
          <button @click="removeImage(index)" class="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">
            <XIcon :size="14" />
          </button>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between border-t pt-4">
        <label class="cursor-pointer rounded-md p-2 hover:bg-accent">
          <ImageIcon class="text-muted-foreground" :size="20" />
          <input type="file" class="hidden" multiple accept="image/*" @change="handleImageUpload" />
        </label>
        <button
          @click="submitPost"
          :disabled="!newPostContent.trim() && selectedImages.length === 0"
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>

    <!-- Feed -->
    <div class="space-y-6">
      <div v-for="post in posts" :key="post.id" class="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-start gap-4">
          <div class="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground">
            {{ post.author[0] }}
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">{{ post.author }}</h3>
              <span class="text-xs text-muted-foreground">{{ post.timestamp }}</span>
            </div>
            <p class="whitespace-pre-wrap leading-relaxed text-foreground/90">{{ post.content }}</p>

            <!-- Post Images -->
            <div v-if="post.images && post.images.length > 0" class="grid gap-2" :class="post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'">
              <img v-for="(img, i) in post.images" :key="i" :src="img" class="rounded-lg object-cover w-full h-auto max-h-96" />
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-6 pt-4">
              <button @click="handleLike(post)" class="flex items-center gap-1.5 text-sm transition-colors" :class="post.liked ? 'text-red-500 font-medium' : 'text-muted-foreground hover:text-red-500'">
                <HeartIcon :size="18" :fill="post.liked ? 'currentColor' : 'none'" />
                {{ post.likes }}
              </button>
              <button @click="toggleComments(post)" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageCircleIcon :size="18" />
                {{ post.comments.length }}
              </button>
            </div>

            <!-- Comments Section -->
            <div v-if="post.showComments" class="mt-4 space-y-4 border-t pt-4">
              <div v-for="comment in post.comments" :key="comment.id" class="flex gap-3 text-sm">
                <span class="font-semibold">{{ comment.user }}:</span>
                <span class="text-muted-foreground">{{ comment.text }}</span>
              </div>
              <div v-if="isLoggedIn" class="flex gap-2 pt-2">
                <input
                  v-model="post.newComment"
                  placeholder="Write a comment..."
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  @keyup.enter="addComment(post)"
                />
                <button @click="addComment(post)" class="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { HeartIcon, MessageCircleIcon, ImageIcon, XIcon } from 'lucide-vue-next'
const props = defineProps({
  isLoggedIn: Boolean,
  currentUser: String
})

const emit = defineEmits(['require-login'])

const newPostContent = ref('')
const selectedImages = ref([])

const posts = ref([
  {
    id: 1,
    author: 'Design Lover',
    content: 'Loving the clean design of this new blog! ✨ #WebDev #UI',
    timestamp: '2 hours ago',
    images: ['/placeholder.svg?height=400&width=600'],
    likes: 12,
    liked: false,
    comments: [{ id: 1, user: 'DevGuy', text: 'Looks awesome!' }],
    showComments: false,
    newComment: ''
  },
  {
    id: 2,
    author: 'Traveler',
    content: 'Just arrived in Kyoto. The view is breath-taking.',
    timestamp: '5 hours ago',
    images: ['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'],
    likes: 45,
    liked: true,
    comments: [],
    showComments: false,
    newComment: ''
  }
])

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      selectedImages.value.push(event.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
}

const submitPost = () => {
  if (!props.isLoggedIn) return emit('require-login')

  const newPost = {
    id: Date.now(),
    author: props.currentUser,
    content: newPostContent.value,
    timestamp: 'Just now',
    images: [...selectedImages.value],
    likes: 0,
    liked: false,
    comments: [],
    showComments: false,
    newComment: ''
  }

  posts.value.unshift(newPost)
  newPostContent.value = ''
  selectedImages.value = []
}

const handleLike = (post) => {
  if (!props.isLoggedIn) return emit('require-login')
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

const toggleComments = (post) => {
  post.showComments = !post.showComments
}

const addComment = (post) => {
  if (!props.isLoggedIn) return emit('require-login')
  if (!post.newComment.trim()) return

  post.comments.push({
    id: Date.now(),
    user: props.currentUser,
    text: post.newComment
  })
  post.newComment = ''
}
</script>
