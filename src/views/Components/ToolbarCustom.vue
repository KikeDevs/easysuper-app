<script setup lang="ts">
import { IonToolbar, IonButtons } from "@ionic/vue";
</script>

<template>
  <ion-toolbar
      class="
      [--background:#f5f5f5]
      [--ion-toolbar-background:#f5f5f5]
      [--ion-toolbar-border-color:#f5f5f5]
      dark:[--background:#121212]
      dark:[--ion-toolbar-background:#121212]
      dark:[--ion-toolbar-border-color:#121212]"
  >
    <slot/>
    <ion-buttons :collapse="true" slot="start">
      <slot name="start"/>
    </ion-buttons>
    <ion-buttons :collapse="true" slot="end" class="gap-1">
      <slot name="end"/>
    </ion-buttons>
  </ion-toolbar>
</template>
