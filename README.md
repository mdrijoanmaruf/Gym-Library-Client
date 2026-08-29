<div align="center">
  <img src="https://raw.githubusercontent.com/mdrijoanmaruf/Gym-Library-Client/main/public/logo.png" alt="GymLibrary Logo" width="250" />
  
  # GymLibrary 🏋️‍♂️ (Frontend)
  
  **The ultimate modern fitness library and workout planner.**
  
  [Live Demo](https://gym.rijoan.com) • [Backend Repo](https://github.com/mdrijoanmaruf/Gym-Library-Server)

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
</div>

<br />

GymLibrary is a premium, beautifully crafted web application designed to help users discover proper exercise form and construct personalized workout routines. 

The frontend provides a seamless, dynamic, and responsive user experience with glassmorphism aesthetics, secure edge video streaming via Cloudflare R2, and robust authentication.

---

## ✨ Features

- **📺 Edge Media Streaming:** Videos and GIFs are delivered blazingly fast and securely via Cloudflare R2 pre-signed URLs, keeping the backend lightweight.
- **📱 TikTok/Shorts-Style Player:** A custom, fully responsive vertical video player designed for a modern, mobile-first experience.
- **🔓 Public Library, Private Workouts:** Anyone can browse the extensive gym library and watch forms without an account. However, saving exercises and building workout routines requires authentication.
- **🔐 Secure Authentication:** Powered by **NextAuth.js**. Users can sign up using traditional email/password credentials or instantly log in using **Google OAuth**.
- **💅 Premium UI/UX:** Built with Tailwind CSS v4 featuring sleek dark mode, vibrant micro-animations, glassmorphism overlays, and smooth transitions.
- **⚡ Next.js App Router:** Utilizes the latest Next.js paradigms for instant page transitions, optimized server-side rendering, and API proxies.

---

## 🚀 Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
- **Edge Storage:** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)

---

## 🗂️ Project Structure

```text
/
├── app/                  # Next.js App Router root
│   ├── api/              # API proxies (NextAuth, Media routing, User data)
│   ├── gym/              # The main Gym Library dashboard and media grid
│   ├── my-workout/       # User's personalized saved workout dashboard
│   ├── login/            # Secure login page
│   └── register/         # Secure registration page
├── Components/           # Reusable React UI Components
│   ├── Gym/              # Specialized library components (MediaGrid, VideoCard, Modals)
│   ├── Home/             # Landing page aesthetics
│   └── Shared/           # Global components (Navbar, Inputs, Buttons)
├── public/               # Static assets (images, icons)
└── .env.local            # Environment variables (ignored by git)
```

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- The [GymLibrary Backend Server](https://github.com/mdrijoanmaruf/Gym-Library-Server) must be running.

### 2. Clone the repository
```bash
git clone https://github.com/mdrijoanmaruf/Gym-Library-Client.git
cd Gym-Library-Client
```

### 3. Install dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env.local` file in the root directory and configure it:

```env
# MongoDB (Used by NextAuth for session storage)
MONGODB_URI=mongodb://your_db_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_key

# Google OAuth (For Google Login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Backend API URL (Proxy Target)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Start the Application
```bash
npm run dev
```
The application will instantly be available at [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles and optimizes the application for production usage.
- `npm start`: Starts the Next.js production server (requires `build` to be run first).
- `npm run lint`: Runs ESLint to statically analyze the code and enforce best practices.

---

<div align="center">
  <p>Developed by <b><a href="https://rijoan.com">Md Rijoan Maruf</a></b></p>
</div>
