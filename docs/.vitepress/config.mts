import { defineConfig } from "vitepress"

export default defineConfig({
  title: "My Blog",
  description: "My Blog",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "ASP.NET", link: "/aspnet/" },
      { text: "C", link: "/c/" },
      { text: "CSAPP", link: "/csapp/" },
    ],
    sidebar: {
      "/aspnet/": [
        {
          items: [
            { text: "总览", link: "/aspnet/" },
          ],
        },
      ],
      "/c/": [
        {
          items: [
            { text: "总览", link: "/c/" },
          ],
        },
      ],
      "/csapp/": [
        {
          items: [
            { text: "总览", link: "/csapp/" },
          ],
        },
      ],
    },
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
