import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Blog",
  description: "My Blog",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Kafka", link: "/Kafka/index" },
      { text: "K8S", link: "/K8S/index" },
    ],

    sidebar: {
      "/Kafka": [
        {
          items: [
            { text: "介绍", link: "/Kafka/" },
            { text: "基本使用", link: "/Kafka/basic-use" },
          ],
        },
      ],
      "/K8S": [
        {
          items: [{ text: "介绍", link: "/K8S/" }],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
    outline: {
      label: "本页目录",
    },
  },
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
})
