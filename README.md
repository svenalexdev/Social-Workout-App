# 🏋️‍♂️ Social Workout Tracker

A mobile-first fullstack application that empowers fitness enthusiasts to plan and track their workouts and to exercise together with other users! Whether you're a seasoned gym-goer or just getting started, Social Workout Tracker helps you stay consistent and connected.

👨‍💻 This was our **final team project** at the end of the WBS CODING SCHOOL fullstack web development bootcamp.

---

## 📱 Live Demo

👉 [Live Demo on Render](https://finalproject-frontend-d2e7.onrender.com/)

*The app is currently designed mobile-first based on the iPhone 12 Pro screen size, but it is not yet fully responsive. Due to some issues detected on iPhones, we recommend using the app on a desktop browser with device emulation set to iPhone 12 Pro for the best experience. Improvements to responsiveness and mobile compatibility are planned for future iterations.*

---

## 💡 Features

- ✅ **User Authentication** – Register and log in securely
- 📝 **Custom Workout Plan Creation** – Design your own routines
- 🤖 **AI-Generated Workout Plans** – Generate plans using Gemini (via prompt input)
- 🏃 **Interactive Workout Mode** – Execute and follow your plans during training
- 📅 **Create Group Activities** – Let others join your gym session
- 🔍 **Browse Community Workouts** – View workouts created by other users

---

## 👥 Target Audience

- Fitness enthusiasts & gym lovers
- Beginners looking to follow structured training

---

## ⚙️ Tech Stack

## 🖼️ Frontend

- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🔧 Backend

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [zod](https://github.com/colinhacks/zod)

**AI**
- Gemini AI (Google)

---

## 📁 Project Structure

This project uses a **monorepo** structure:

    Social-Workout-Tracker/
    ├── backend/      → Express backend with MongoDB
    └── frontend/     → React + Vite frontend

---

## 🚀 Getting Started

The app is deployed and ready to use at:  
👉 **[https://finalproject-frontend-d2e7.onrender.com/](https://finalproject-frontend-d2e7.onrender.com/)**

> To run the project locally, create `.env` files in both backend and frontend folders as follows:

*Note: You will need to create accounts and generate your own API keys/secrets for MongoDB, RapidAPI, Gemini AI, and Cloudinary. These must be set in your local .env file before running the backend.*

### Backend `.env` (in `/backend`)

    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    SPA_ORIGIN=http://localhost:5173
    RAPIDAPI_KEY=<your_rapidapi_key_for_exercisedb>
    RAPIDAPI_HOST=exercisedb.p.rapidapi.com
    GEMINI_API_KEY=<your_gemini_api_key>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>

### Frontend `.env` (in `/frontend`)

    VITE_API_URL=http://localhost:8080

Then install dependencies and run both servers:

    # Backend
    cd backend
    npm install
    npm run dev

    # Frontend
    cd frontend
    npm install
    npm run dev

---

## 👨‍💻 Team

- [@svenalexdev](https://github.com/your-github-handle)
- [@AnkitaMalani](https://github.com/AnkitaMalani)
- [@marcochippy](https://github.com/marcochippy)  
- [@Stradow](https://github.com/Stradow)

---

## 📜 License

This project was created for educational purposes as part of a Web Development Bootcamp.  
Not intended for commercial use.
