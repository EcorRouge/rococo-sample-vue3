<template>
    <q-page class="q-pa-md">
      <div class="row q-mb-md">
        <div class="col-12">
          <h4 class="q-my-md">Task Manager</h4>
        </div>
      </div>
      
      <TaskList />
    </q-page>
  </template>
  
  <script setup>
  import TaskList from '@/components/TaskList.vue'
  </script>