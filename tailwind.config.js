/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", // Add this line for shadcn/ui components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}