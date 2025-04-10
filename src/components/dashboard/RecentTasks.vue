<template>
    <q-card class="q-mb-lg">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-weight-bold">Recent Tasks</div>
        <p class="text-grey-7 q-mt-sm">Your most recent tasks are shown below</p>
      </q-card-section>
  
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item
            v-for="task in tasks"
            :key="task.entity_id"
            clickable
            v-ripple
            @click="onViewTask(task)"
            class="q-py-md"
          >
            <q-item-section avatar>
              <q-checkbox
                v-model="task.is_completed"
                @click.stop
                @update:model-value="onToggleTask(task)"
                color="primary"
              />
            </q-item-section>
  
            <q-item-section>
              <q-item-label :class="{ 'text-strike': task.is_completed }">
                {{ task.title }}
              </q-item-label>
              <q-item-label caption v-if="task.description" class="q-mt-xs text-grey-6">
                {{ task.description.length > 60 ? task.description.slice(0, 60) + '...' : task.description }}
              </q-item-label>
              <q-item-label caption v-if="task.due_date" class="q-mt-xs">
                <q-icon name="event" size="xs" color="grey-6" />
                <span class="q-ml-xs">{{ formatDate(task.due_date) }}</span>
              </q-item-label>
            </q-item-section>
  
            <q-item-section side>
              <q-chip
                dense
                outline
                :color="task.priority === 0 ? 'grey-6' : task.priority === 1 ? 'warning' : 'negative'"
                :text-color="task.priority === 0 ? 'grey-7' : ''"
                class="q-px-sm"
              >
                {{ task.priority === 0 ? 'Normal' : task.priority === 1 ? 'High' : 'Urgent' }}
              </q-chip>
            </q-item-section>
          </q-item>
  
          <q-item v-if="tasks.length === 0">
            <q-item-section class="text-center text-grey-6 q-py-lg">
              <q-icon name="inventory_2" size="48px" color="grey-4" />
              <div class="q-mt-sm">No tasks yet. Click "Add New Task" to get started!</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
  
      <q-separator />
  
      <q-card-actions align="center">
        <q-btn flat color="primary" label="View All Tasks" to="/tasks" class="q-px-md" />
        <q-btn flat color="positive" icon="add" label="Create Task" @click="onAddNewTask" class="q-px-md" />
      </q-card-actions>
    </q-card>
  </template>
  
  <script setup>
  import { format, parseISO } from 'date-fns'
  
  const emit = defineEmits(['viewTask', 'toggleTask', 'addNewTask'])
  
  function formatDate(dateString) {
    if (!dateString) return ''
    try {
      return format(parseISO(dateString), 'MMM d, yyyy')
    } catch {
      return dateString
    }
  }
  
  function onViewTask(task) {
    emit('viewTask', task)
  }
  
  function onToggleTask(task) {
    emit('toggleTask', task)
  }
  
  function onAddNewTask() {
    emit('addNewTask')
  }
  </script>
  
  <style lang="scss" scoped>
  .text-strike {
    text-decoration: line-through;
    color: #aaa;
  }
  </style>