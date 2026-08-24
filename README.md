# GymLibrary Client 🏋️‍♂️

The frontend application for GymLibrary. Built with a modern React stack, it provides a seamless and responsive user experience for browsing and streaming gym media assets, complete with secure authentication.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- npm or yarn
- The backend API (`gym-library-server`) must be running locally or deployed.

## 🛠️ Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd gym-library-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env.local` file in the root directory and add the required configuration:

   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_super_secret_nextauth_key
   
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server with Fast Refresh.
- `npm run build`: Builds the application for production usage.
- `npm start`: Starts a Next.js production server (must run `build` first).
- `npm run lint`: Runs ESLint to statically analyze the code and catch errors.

## 🗂️ Project Structure

```text
/
├── app/                  # Next.js App Router root
│   ├── api/              # API routes (e.g., NextAuth endpoints, media proxies)
│   ├── gym/              # The main Gym Library dashboard and video player pages
│   ├── login/            # Login page route
│   └── register/         # Registration page route
├── Components/           # Reusable React UI Components
│   ├── Gym/              # Components specific to the gym/video library (e.g., VideoPlayerModal)
│   ├── Home/             # Landing page components
│   ├── Shared/           # Global components (Navbar, Footers, Modals, Buttons)
│   ├── login/            # Login form components
│   └── register/         # Registration form components
├── public/               # Static assets (images, fonts)
└── .env.local            # Environment variables (ignored by git)
```

## ✨ Key Features

- **Shorts-Style Video Player**: A custom, responsive vertical video player (`VideoPlayerModal`) designed for a mobile-first premium experience.
- **Secure Sessions**: Protected routes and server-side session management via NextAuth.
- **Seamless Navigation**: Utilizing Next.js App Router for instant page transitions and server-side rendering where applicable.
- **Dynamic Styling**: Handcrafted with Tailwind CSS v4 ensuring highly responsive design out-of-the-box.
