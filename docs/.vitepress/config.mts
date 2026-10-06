import { defineConfig } from "vitepress"

export default defineConfig({
  title: "My Blog",
  description: "My Blog",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/z2847492481" },
    ],
    outline: {
      label: "本页目录",
    },
  },
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  ignoreDeadLinks: [/^https?:\/\/localhost/],
})
