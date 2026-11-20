# TimeBud Frontend

<div align="center">

  <h3>Client-side application for the TimeBud Daily Time Record (DTR) System</h3>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 About

**TimeBud Frontend** is the client-side application for the TimeBud Daily Time Record (DTR) system. It provides a clean, responsive, and modern interface where employees can manage their work records, view earnings, and access their attendance history.

The application communicates securely with the **TimeBud Backend API** to handle authentication, time tracking logic, and earnings calculations.

### API configuration

`src/api/axios.ts` resolves the API base URL as follows:

1. `VITE_API_BASE_URL` (if set) wins — useful for custom environments.
2. Production builds use `https://timebud-backend-qs8l.onrender.com/api`.
3. Local dev uses `http://127.0.0.1:8000/api`, or `http://<same-host>:8000/api` when
   opened from another device on the LAN.

The deployed backend must allow the frontend origin in `CORS_ALLOWED_ORIGINS`
(currently `https://timebud-frontend.vercel.app`).

## ✨ Features

- ⏱️ **Time In / Time Out:** Intuitive interface for clocking in and out.
- 💰 **Earnings Dashboard:** Real-time view of daily and accumulated earnings.
- 📊 **Detailed Reports:** View earnings broken down by Weekly, Monthly, and Total.
- 🔐 **Secure Authentication:** Robust Login and Registration system.
- 📱 **Mobile-First Design:** Fully responsive UI that works seamlessly on all devices.
- ⚡ **High Performance:** Built with modern React for a fast, snappy user experience.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Version Control:** Git & GitHub
