# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# SoulSync 🌿

**SoulSync** — это веб-приложение, разработанное в рамках дипломного проекта. Приложение объединяет функции личного дневника, календаря и базового ИИ-чата. Пользователь может вести записи, отслеживать события по датам, а также зарегистрироваться и войти с подтверждением по email.

## 📌 Основной функционал

- 🔐 Регистрация и вход через Supabase с подтверждением по электронной почте.
- 🗓 Календарь с возможностью выбора даты и отображения записей по дате.
- 📝 Добавление и просмотр записей на главной странице.
- 💬 Прототип чата с ИИ (в стадии разработки).
- 🔒 Выход из аккаунта.

## 🛠 Технологии

- **Frontend**: React, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL, Auth)
- **AI Chat**: интеграция готовится (OpenAI / Gemini)

## 🚀 Установка и запуск

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/your-username/SoulSync.git
   cd SoulSync
   Установите зависимости:
npm install
Создайте .env файл и добавьте параметры Supabase:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
npm run dev
Подтверждение по email
При регистрации пользователь указывает свою почту, на которую автоматически отправляется письмо с подтверждением. Только после подтверждения аккаунт активируется.
Статус разработки
✅ Регистрация, вход, выход

✅ Календарь и записи

⚠️ Чат с ИИ — в разработке

👨‍🎓 Автор
Этот проект был создан как часть дипломной работы студента Нурсата Даригула.

📄 Лицензия
MIT — свободно используйте, развивайте и распространяйте.
