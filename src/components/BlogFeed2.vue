<template>
  <div class="mx-auto max-w-2xl py-8 px-4">
    <!-- 分页按钮 -->
    <div class="flex justify-center mb-6">
      <div class="flex space-x-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="fetchData(page)"
          :class="[
            'px-3 py-1 rounded-md',
            currentPage === page
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-accent',
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>

    <!-- Feed -->
    <div v-else class="space-y-6 pb-24"> <!-- 添加底部填充，为固定输入框留出空间 -->
      <div
        v-for="post in posts"
        :key="post.id"
        class="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-start gap-4">
          <div
            class="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground"
          >
            {{ post.user[0] }}
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">{{ post.user }}</h3>
              <span class="text-xs text-muted-foreground">{{
                formatTime(post.createTime)
              }}</span>
            </div>
            <div>
              <h4 class="font-medium mb-1">{{ post.topic }}</h4>
              <p class="whitespace-pre-wrap leading-relaxed text-foreground/90">
                {{ post.text }}
              </p>
            </div>

            <!-- Post Images -->
            <div v-if="post.pictures && post.pictures.length > 0" class="grid gap-2" :class="post.pictures.length === 1 ? 'grid-cols-1' : 'grid-cols-2'">
              <img 
                v-for="(pic) in post.pictures" 
                :key="pic.id"
                :src="pic.url" 
                class="rounded-lg object-cover w-full h-auto max-h-96" 
              />
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-6 pt-4">
              <button
                @click="handleLike(post)"
                class="flex items-center gap-1.5 text-sm transition-colors"
                :class="
                  post.liked
                    ? 'text-red-500 font-medium'
                    : 'text-muted-foreground hover:text-red-500'
                "
              >
                <HeartIcon
                  :size="18"
                  :fill="post.liked ? 'currentColor' : 'none'"
                />
                {{ post.likeNum }}
              </button>
              <button 
                @click="toggleComments(post)" 
                class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircleIcon :size="18" />
                {{ post.comments && post.comments.length > 0 ? post.comments.length : 0 }}
              </button>
            </div>

            <!-- Comments Section -->
            <div v-if="post.showComments" class="mt-4 space-y-4 border-t pt-4">
              <div v-if="!post.comments || post.comments.length === 0" class="text-sm text-muted-foreground py-2">
                暂时还没有评论
              </div>
              <div v-else class="space-y-3">
                <div v-for="comment in post.comments" :key="comment.id" class="flex gap-3 text-sm">
                  <span class="font-semibold">{{ comment.user }}:</span>
                  <span class="text-muted-foreground">{{ comment.text }}</span>
                </div>
              </div>
              
              <!-- 评论输入框，无论是否登录都会显示，但未登录时点击会触发登录 -->
              <div class="flex gap-2 pt-2">
                <input
                  v-model="post.newComment"
                  :placeholder="isLoggedIn ? '请输入你的评论' : '登录后发表评论'"
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  @keyup.enter="isLoggedIn ? addComment(post) : emit('require-login')"
                  @focus="!isLoggedIn ? emit('require-login') : null"
                  :disabled="!isLoggedIn"
                />
                <button 
                  @click="isLoggedIn ? addComment(post) : emit('require-login')" 
                  class="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground whitespace-nowrap"
                  :disabled="(!isLoggedIn) || (!post.newComment || !post.newComment.trim())"
                >
                  {{ isLoggedIn ? '发送' : '' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 暂无数据提示 -->
      <div
        v-if="posts.length === 0 && !loading"
        class="text-center py-12 text-muted-foreground"
      >
        本页暂无数据
      </div>

      <!-- Post Creation Card -->
      <div
        v-if="isLoggedIn"
        class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-10"
      >
        <input
          v-model="newPostTopic"
          placeholder="输入博客主题"
          class="w-full resize-none border-none bg-transparent p-0 focus:ring-0 text-lg mb-2"
        />
        <textarea
          v-model="newPostContent"
          placeholder="说些什么吧?"
          class="w-full resize-none border-none bg-transparent p-0 focus:ring-0 text-lg"
          rows="3"
        ></textarea>

        <!-- Image Preview -->
        <div
          v-if="selectedImages.length > 0"
          class="mt-4 grid grid-cols-3 gap-2"
        >
          <div
            v-for="(img, index) in selectedImages"
            :key="index"
            class="relative w-12 h-12 overflow-hidden rounded-lg"  
          >
            <img :src="img" class="w-full h-full object-cover" />
            <button
              @click="removeImage(index)"
              class="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <XIcon :size="14" />
            </button>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between border-t pt-4">
          <label class="cursor-pointer rounded-md p-2 hover:bg-accent">
            <ImageIcon class="text-muted-foreground" :size="20" />
            <input
              id="fileInput"
              type="file"
              class="hidden"
              multiple
              accept="image/*"
              @change="handleImageUpload"
            />
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { HeartIcon, MessageCircleIcon, ImageIcon, XIcon } from "lucide-vue-next";
import axios from "axios";

const props = defineProps({
  isLoggedIn: Boolean,
  currentUser: String,
});

const emit = defineEmits(["require-login"]);

// API相关状态
const posts = ref([]);
const currentPage = ref(1);
const totalPages = ref(5); // 假设总共有5页，你可以根据后端返回的数据调整
const loading = ref(false);
const error = ref(null);

// 本地帖子创建相关
const newPostContent = ref("");
const newPostTopic = ref("");
const selectedImages = ref([]);
const selectedFiles = ref([]); // 存储实际的文件对象

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} 天前`;
  } else if (diffHours > 0) {
    return `${diffHours} 小时前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} 分钟前`;
  } else {
    return "刚刚";
  }
};

// 获取后端数据
const fetchData = async (pageNum = 1) => {
  loading.value = true;
  error.value = null;
  currentPage.value = pageNum;

  try {
    const response = await axios.get("http://localhost:8080/blog/get", {
      params: {
        PageNum: pageNum,
      },
    });

    if (response.data.success) {
      // 将后端返回的数据映射为前端所需的格式
      posts.value = response.data.data.map((item) => ({
        id: item.id,
        user: item.user,
        topic: item.topic,
        text: item.text,
        likeNum: item.likeNum,
        createTime: item.createTime,
        pictures: item.pictures || [], // 图片数组
        comments: item.comments || [],
        liked: false, // 本地状态，用于前端交互
        showComments: false, // 控制评论区域显示
        newComment: '' // 用于输入新评论
      }));
    } else {
      error.value = "获取数据失败";
    }
  } catch (err) {
    console.error("API Error:", err);
    error.value = "请求失败，请稍后重试";
  } finally {
    loading.value = false;
  }
};

// 点赞处理
const handleLike = (post) => {
  if (!props.isLoggedIn) return emit("require-login");
  post.liked = !post.liked;
  post.likeNum += post.liked ? 1 : -1;
};

// 切换评论显示/隐藏
const toggleComments = (post) => {
  post.showComments = !post.showComments;
};

// 添加评论
const addComment = async (post) => {
  if (!props.isLoggedIn) return emit("require-login");
  if (!post.newComment || !post.newComment.trim()) return;

  try {
    const response = await axios.post("http://localhost:8080/blog/comment", {
      id: post.id,
      user: props.currentUser,
      msg: post.newComment
    });

    if (response.data.success) {
      // 添加新评论到本地状态
      if (!post.comments) {
        post.comments = [];
      }
      
      post.comments.push({
        id: Date.now(), // 使用时间戳作为临时ID
        user: props.currentUser,
        text: post.newComment,
        createTime: new Date().toISOString()
      });
      
      // 清空输入框
      post.newComment = '';
    } else {
      error.value = "添加评论失败";
    }
  } catch (err) {
    console.error("添加评论错误:", err);
    error.value = "添加评论失败，请稍后重试";
  }
};

// 处理图片上传
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  
  files.forEach(file => {
    // 存储实际文件对象
    selectedFiles.value.push(file);
    
    // 创建预览URL
    const reader = new FileReader();
    reader.onload = (event) => {
      selectedImages.value.push(event.target.result);
    };
    reader.readAsDataURL(file);
  });
};

// 移除图片
const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
};

// 提交新帖子
const submitPost = async () => {
  if (!props.isLoggedIn) return emit("require-login");
  if (!newPostContent.value.trim() && selectedFiles.value.length === 0) return;

  try {
    // 创建表单数据对象
    const formData = new FormData();
    
    // 直接添加表单字段，不使用JSON包装
    formData.append('user', props.currentUser);
    formData.append('topic', newPostTopic.value || "无标题");
    formData.append('text', newPostContent.value);
    
    // 添加图片文件
    selectedFiles.value.forEach((file) => {
      formData.append('pictureFiles', file);
    });

    // 发送POST请求 - 不设置Content-Type，让浏览器自动设置
    const response = await axios.post("http://localhost:8080/blog/add", formData);

    if (response.data.success) {
      // 创建新帖子对象
      const newPost = {
        id: Date.now(),
        user: props.currentUser,
        topic: newPostTopic.value || "无标题",
        text: newPostContent.value,
        likeNum: 0,
        createTime: new Date().toISOString(),
        pictures: [], // 新帖子暂无图片URL，后端会处理
        comments: [],
        liked: false,
        showComments: false,
        newComment: ''
      };

      // 添加到帖子列表顶部
      posts.value.unshift(newPost);
      
      // 清空输入框和图片
      newPostContent.value = "";
      newPostTopic.value = "";
      selectedImages.value = [];
      selectedFiles.value = [];
      
      // 清空文件输入框
      document.getElementById('fileInput').value = '';
    } else {
      error.value = "发布帖子失败";
    }
  } catch (err) {
    console.error("发布帖子错误:", err);
    error.value = "发布帖子失败，请稍后重试";
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData(1);
});
</script>