<template>
  <v-app dark>
    <v-app-bar app class="pl-4">
      <nuxt-link to="/">TOP</nuxt-link>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer :absolute="false" app>
      <v-spacer></v-spacer>
      <a
        class="mr-10"
        href="https://webrtc.ecl.ntt.com/"
        target="_blank"
      >https://webrtc.ecl.ntt.com/</a>
    </v-footer>
  </v-app>
</template>

<script>
export default {};
</script>