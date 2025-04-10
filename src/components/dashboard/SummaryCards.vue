<template>
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Total Tasks Card -->
      <div class="col-12 col-md-4">
        <q-card class="dashboard-card" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle1 text-grey-6">Total Tasks</div>
                <div class="text-h3 text-weight-bold">{{ stats.total }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="task" size="48px" color="primary" class="q-ml-sm" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
  
      <!-- Completed Tasks Card -->
      <div class="col-12 col-md-4">
        <q-card class="dashboard-card" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle1 text-grey-6">Completed</div>
                <div class="text-h3 text-weight-bold text-positive">{{ stats.completed }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="check_circle" size="48px" color="positive" class="q-ml-sm" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
  
      <!-- Completion Rate Card -->
      <div class="col-12 col-md-4">
        <q-card class="dashboard-card" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle1 text-grey-6">Completion Rate</div>
                <div class="text-h3 text-weight-bold text-primary">{{ Math.round(completionRate * 100) }}%</div>
              </div>
              <div class="col-auto">
                <q-circular-progress
                  :value="completionRate * 100"
                  size="60px"
                  :thickness="0.15"
                  color="primary"
                  track-color="grey-3"
                  class="q-ml-sm"
                >
                  <q-icon name="insights" size="24px" color="primary" />
                </q-circular-progress>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
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
  
  <style lang="scss" scoped>
  .dashboard-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
  }
  </style>