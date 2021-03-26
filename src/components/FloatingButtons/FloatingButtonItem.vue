<template>
  <button class="floating-buttons__item" @tap="$emit('tap')" :open-type="openType">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'FloatingButtonItem',
  props: {
    openType: String
  },
  data() {
    return {}
  },
  computed: {},
  mounted() {},
  methods: {},
  watch: {}
}
</script>
