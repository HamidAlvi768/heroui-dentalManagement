import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#e6fffd",
              100: "#b3fffa",
              200: "#80fff7",
              300: "#4dfff4",
              400: "#1afff1",
              500: "#00e6d6",
              600: "#00b3a6",
              700: "#008075",
              800: "#004d45",
              900: "#001a15",
              DEFAULT: "#00e6d6",
              foreground: "#ffffff"
            }
          }
        }
      }
    })
  ]
};
