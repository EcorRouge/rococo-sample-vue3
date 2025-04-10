<template>
    <q-card class="q-mb-lg">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6 text-weight-bold">Quick Actions</div>
      </q-card-section>
  
      <q-card-section class="q-pa-none">
        <q-list padding>
          <q-item clickable v-ripple @click="$emit('addNewTask')" class="q-py-md">
            <q-item-section avatar>
              <q-icon name="add_task" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Add New Task</q-item-label>
              <q-item-label caption>Create a new task to track</q-item-label>
            </q-item-section>
          </q-item>
  
          <q-item clickable v-ripple @click="$emit('navigateToTasks', 'incomplete')" class="q-py-md">
            <q-item-section avatar>
              <q-icon name="pending_actions" color="warning" />
            </q-item-section>
            <q-item-section>
              <q-item-label>View Pending Tasks</q-item-label>
              <q-item-label caption>Focus on unfinished tasks</q-item-label>
            </q-item-section>
          </q-item>
  
          <q-item clickable v-ripple @click="$emit('navigateToTasks', 'completed')" class="q-py-md">
            <q-item-section avatar>
              <q-icon name="task_alt" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label>View Completed Tasks</q-item-label>
              <q-item-label caption>See what you've accomplished</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  defineEmits(['addNewTask', 'navigateToTasks'])
  </script>