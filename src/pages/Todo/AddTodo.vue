<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="q-pa-md" style="max-width: 500px; width: 100%; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.1)">
      <q-card-section class="q-pt-none">
        <div class="text-h5 text-primary text-center q-mb-md">Add Tasks</div>

        <!-- Search Bar -->
        <q-input
          filled
          v-model="searchQuery"
          label="Search Tasks"
          dense
          class="q-mb-md"
          debounce="300"
        />

        <!-- Input to add new todo -->
        <q-input
          filled
          v-model="newTodo"
          label="What needs to be done?"
          dense
          autofocus
          class="q-mb-md"
        />

        <!-- Add Task Button -->
        <q-btn
          label="Add Task"
          color="primary"
          class="full-width q-mb-md"
          @click="addTodo"
          :disabled="!newTodo.trim()"
        />

        <!-- Todo List -->
        <q-list>
          <q-item v-for="(todo, index) in filteredTodos" :key="index" class="q-mb-xs">
            <q-item-section>
              <div class="flex items-center justify-between">
                <div>
                  <q-checkbox
                    v-model="todo.completed"
                    @change="updateTodo(index)"
                    dense
                    class="q-mr-md"
                  />
                  <span :class="{ 'text-line-through': todo.completed, 'text-dark': !todo.completed }" class="text-subtitle2">{{ todo.text }}</span>
                </div>
                <div>
                  <q-btn
                    icon="delete"
                    dense
                    @click="deleteTodo(index)"
                    class="q-ml-md no-hover-btn"
                    style="width: 50px"
                    color="negative"
                    flat
                  />
                </div>

              </div>
              <!-- Delete Task Button -->

            </q-item-section>
          </q-item>
        </q-list>

        <!-- Filters and remaining items counter -->
        <div class="q-mt-md q-gutter-md row items-center justify-between">
          <div class="text-caption">
            <span>{{ remainingTodos }} items left</span>
          </div>
          <div>
            <q-btn flat label="All" @click="setFilter('all')" />
            <q-btn flat label="Active" @click="setFilter('active')" />
            <q-btn flat label="Completed" @click="setFilter('completed')" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

// Define reactive properties
const newTodo = ref('')
const searchQuery = ref('')
const todos = ref([
  { text: 'Learn Vue 3', completed: false },
  { text: 'Build a To-Do app', completed: false }
])

// Filter logic for todos
const filter = ref('all')

const filteredTodos = computed(() => {
  let filteredList = todos.value.filter(todo => {
    return todo.text.toLowerCase().includes(searchQuery.value.toLowerCase())
  })

  if (filter.value === 'active') {
    filteredList = filteredList.filter(todo => !todo.completed)
  } else if (filter.value === 'completed') {
    filteredList = filteredList.filter(todo => todo.completed)
  }

  return filteredList
})

// Remaining todos count
const remainingTodos = computed(() => {
  return todos.value.filter(todo => !todo.completed).length
})

// Add new todo (on button click)
function addTodo() {
  if (newTodo.value.trim() !== '') {
    todos.value.push({ text: newTodo.value.trim(), completed: false })
    newTodo.value = '' // Clear the input after adding the task
  }
}

// Update todo completion status
function updateTodo(index) {
  todos.value[index].completed = !todos.value[index].completed
}

// Delete todo
function deleteTodo(index) {
  todos.value.splice(index, 1)
}

// Set the current filter
function setFilter(newFilter) {
  filter.value = newFilter
}
</script>

<style scoped>
.text-line-through {
  text-decoration: line-through;
}

.text-dark {
  color: #333;
}

.q-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.text-h5 {
  font-weight: 700;
  color: #007bff; /* Primary color */
}

.q-btn {
  font-weight: 600;
  padding: 10px;
  border-radius: 8px;
}

.q-btn:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  background-color: #0069d9;
  color: white;
}

.q-btn:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

.q-item {
  border-radius: 10px;
  padding: 10px;
  background-color: #f9f9f9;
}

.q-item-section {
  display: flex;
  align-items: center;
}

.q-checkbox {
  margin-right: 12px;
}

.q-btn.flat {
  padding: 6px 12px;
}
.no-hover-btn:hover {
  background-color: transparent !important;
  box-shadow: none !important;
}
</style>
