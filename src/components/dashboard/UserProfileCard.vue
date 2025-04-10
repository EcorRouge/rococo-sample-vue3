<template>
    <q-card>
      <q-card-section class="bg-grey-2">
        <div class="row items-center">
          <q-avatar size="56px" color="primary" text-color="white" class="q-mr-md shadow-3">
            {{ userInitials }}
          </q-avatar>
          <div>
            <div class="text-h6 text-weight-bold">{{ user?.first_name }} {{ user?.last_name }}</div>
          </div>
        </div>
      </q-card-section>
  
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Account Summary</div>
        
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-card flat bordered class="bg-grey-1">
              <q-card-section class="q-pa-sm text-center">
                <div class="text-h5 text-primary text-weight-bold">{{ stats.total }}</div>
                <div class="text-caption">Total Tasks</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-6">
            <q-card flat bordered class="bg-grey-1">
              <q-card-section class="q-pa-sm text-center">
                <div class="text-h5 text-positive text-weight-bold">{{ stats.completed }}</div>
                <div class="text-caption">Completed</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
      
      <q-separator />
      
      <q-card-actions align="center">
        <q-btn flat color="primary" icon="account_circle" label="My Profile" to="/profile" />
      </q-card-actions>
    </q-card>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    user: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      required: true
    }
  })
  
  const userInitials = computed(() => {
    if (!props.user) return '?'
    return (
      (props.user.first_name?.[0] || '') + 
      (props.user.last_name?.[0] || '')
    ).toUpperCase()
  })
  </script>