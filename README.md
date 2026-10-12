# 💊 1TAP Pharmacy

**1TAP Pharmacy** is a modern pharmacy e-commerce web application designed to make browsing pharmacy products and managing online orders simple and convenient.

## ✨ Features

- 🛍️ **Product Browsing** — Explore pharmacy products and categories.
- 🔍 **Product Search** — Find products quickly and easily.
- 👤 **User Authentication** — Secure authentication using Supabase Auth and Google OAuth.
- 🛒 **E-commerce Experience** — Browse products and interact with the online store.
- 🤖 **AI Chatbot** — Gemini-powered chatbot for conversational assistance.
- 🛠️ **Admin Dashboard** — Manage products and monitor customer orders.
- 📦 **Order Management** — View orders and track their statuses.
- 📱 **Responsive UI** — Designed for desktop and mobile devices.
- ⚡ **Loading States** — Skeleton loaders and user-friendly feedback during loading.

## 🧰 Tech Stack

**Frontend**
- React.js
- Vite
- CSS / Tailwind CSS

**Backend**
- Node.js
- Express.js
- Gemini API

**Database & Authentication**
- Supabase
- PostgreSQL
- Supabase Auth
- Google OAuth

## 📁 Project Structure

```text
1TAP/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── ...
├── server.js
├── package.json
├── .gitignore
└── README.md
```

*The structure above is illustrative; your actual folders may differ.*

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A Supabase project
- A Gemini API key

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### 2. Install dependencies

Install the frontend dependencies:

```bash
npm install
```

If the backend uses a separate `package.json`, navigate to its folder and run `npm install` there as well.

### 3. Configure environment variables

Create the required `.env` files based on your project's configuration.

Example frontend variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Example backend variable:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Use the exact variable names expected by your code. Keep real API keys and secrets private; never commit them to GitHub.

### 4. Run the application

Start the frontend development server:

```bash
npm run dev
```

If your root `package.json` includes a backend script named `server`, start the backend in a separate terminal:

```bash
npm run server
```

Open the local URL printed by Vite in your terminal.

## 🔐 Security

- Environment variables are excluded from version control.
- Admin access should be restricted to authorized users.
- Supabase Row Level Security (RLS) should protect database records.
- Sensitive API keys must remain on the server.
- OAuth redirect URLs should be configured for the deployed domain.

## 🌐 Deployment

The frontend can be deployed using platforms such as Vercel. The backend must also be deployed to a suitable server if the application relies on Express routes.

Configure production environment variables and update Supabase and Google OAuth redirect settings before enabling authentication on the live domain.

## 📌 Project Status

Developed as a pharmacy e-commerce web application, with a focus on usability, responsive design, authentication, and administrative management.

## 👩‍💻 Author

**Sanuba Khan**

- GitHub: [Sanubakhan](https://github.com/Sanubakhan)

---

*1TAP Pharmacy — Pharmacy shopping, made simple.*