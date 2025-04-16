<template>
  <q-page class="flex flex-center column">
    <h4>Hi, {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</h4>
    <div class="q-pa-none q-mb-none q-gutter-none justify-center">
      <q-btn
        label="Add Task"
        color="primary"
        class="q-mt-lg"
        @click="addTask"
      />
    </div>
  </q-page>
</template>


<script setup>
import { useAuthStore } from 'stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()


function addTask() {
  router.push('/add-task')
}

</script>
