<script setup>
import WelcomeItem from './WelcomeItem.vue'
import IconCommunity from './icons/IconCommunity.vue'
import IconDocumentation from './icons/IconDocumentation.vue'
import IconEcosystem from './icons/IconEcosystem.vue'
import IconSupport from './icons/IconSupport.vue'
import IconTooling from './icons/IconTooling.vue'
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <IconDocumentation />
    </template>
    <template #heading>Documentation</template>

    Vue’s
    <a href="https://vuejs.org/" target="_blank" rel="noopener">official documentation</a>
    provides you with all information you need to get started.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconTooling />
    </template>
    <template #heading>Tooling</template>

    This project is served and bundled with
    <a href="https://vitejs.dev/guide/features.html" target="_blank" rel="noopener">Vite</a>. The
    recommended IDE setup is
    <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VSCode</a> +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank" rel="noopener">Volar</a>.
    If you need to test your components and web pages, check out
    <a href="https://www.cypress.io/" target="_blank" rel="noopener">Cypress</a> and
    <a href="https://on.cypress.io/component" target="_blank" rel="noopener"
      >Cypress Component Testing</a
    >.

    <br />

    More instructions are available in <code>README.md</code>.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconEcosystem />
    </template>
    <template #heading>Ecosystem</template>

    Get official tools and libraries for your project:
    <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Pinia</a> |
    <a href="https://router.vuejs.org/" target="_blank" rel="noopener">Vue Router</a>
    <template #footnote>
      Or try other popular libraries such as
      <a href="https://github.com/vueuse/vueuse" target="_blank" rel="noopener">VueUse</a>,
      <a href="https://github.com/vuejs/vue-devtools" target="_blank" rel="noopener">Vue DevTools</a>, and
      <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">Awesome Vue</a>.
    </template>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconCommunity />
    </template>
    <template #heading>Community</template>

    Got stuck? Ask your question on
    <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Vue Land</a>, our official
    Discord server, or
    <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener">StackOverflow</a>. You might also want to join the official
    <a href="https://news.vuejs.org" target="_blank" rel="noopener">newsgroup</a> and subscribe
    to our
    <a href="https://www.youtube.com/@VueMastery" target="_blank" rel="noopener">YouTube channel</a>.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconSupport />
    </template>
    <template #heading>Support Vue</template>

    As an independent project, Vue relies on community backing for its sustainability. You can help
    us by
    <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">becoming a sponsor</a>.
  </WelcomeItem>
</template>
