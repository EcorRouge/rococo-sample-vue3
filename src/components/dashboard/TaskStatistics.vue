<template>
    <q-card>
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-weight-bold">Task Completion Progress</div>
        <p class="text-grey-7 q-mt-sm">Your overall progress is shown below</p>
      </q-card-section>
  
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-xs">Overall Progress</div>
        <q-linear-progress
          :value="completionRate"
          size="25px"
          class="q-mb-lg rounded-borders"
          :color="completionRate < 0.3 ? 'negative' : completionRate < 0.7 ? 'warning' : 'positive'"
        >
          <div class="absolute-full flex flex-center">
            <q-badge :color="completionRate < 0.3 ? 'negative' : completionRate < 0.7 ? 'warning' : 'positive'" class="text-white">
              {{ Math.round(completionRate * 100) }}% Complete
            </q-badge>
          </div>
        </q-linear-progress>
  
        <div class="text-subtitle1 text-weight-medium q-mb-xs q-mt-lg">Tasks by Priority</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-linear-progress
              :value="stats.priority.normal / Math.max(1, stats.total - stats.completed)"
              size="10px"
              class="q-mb-sm rounded-borders"
              color="grey-6"
            />
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-8">Normal</div>
              <div class="text-body2 text-grey-8">{{ stats.priority.normal }}</div>
            </div>
          </div>
          
          <div class="col-12 col-sm-4">
            <q-linear-progress
              :value="stats.priority.high / Math.max(1, stats.total - stats.completed)"
              size="10px"
              class="q-mb-sm rounded-borders"
              color="warning"
            />
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-8">High</div>
              <div class="text-body2 text-grey-8">{{ stats.priority.high }}</div>
            </div>
          </div>
          
          <div class="col-12 col-sm-4">
            <q-linear-progress
              :value="stats.priority.urgent / Math.max(1, stats.total - stats.completed)"
              size="10px"
              class="q-mb-sm rounded-borders"
              color="negative"
            />
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-8">Urgent</div>
              <div class="text-body2 text-grey-8">{{ stats.priority.urgent }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    stats: {
      type: Object,
      required: true
    }
  })
  
  const completionRate = computed(() => {
    if (props.stats.total === 0) return 0
    return props.stats.completed / props.stats.total
  })
  </script>