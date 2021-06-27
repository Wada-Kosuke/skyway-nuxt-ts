<template>
  <v-app dark>
    <nuxt-link to="/" class="home ml-12 my-5">
      <img src="/home.png" />
    </nuxt-link>
    <nuxt />
  </v-app>
</template>

<style lang="scss" scoped>
.home {
  width: 36px;
  > img {
    width: 100%;
    filter: contrast(0.3);
  }
}
</style>