# 🏗️ MGNREGA Portal — Maharashtra (mgnrega-portal)

### 🌍 About the Project
The **MGNREGA Maharashtra Portal** is a **bilingual (English + Hindi)**, **mobile-friendly**, and **offline-capable** web dashboard designed to visualize district-level performance data from the **Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)**.  
It helps users — especially citizens and officials — easily view **person-days generated, total expenditure, active job cards, and employment patterns** in their region.

Built under the vision of **Build for Bharat / Civic Tech initiative**, this project simplifies access to open government data and empowers citizens with transparency and usability.

---

## 📸 Screenshots

![MGNREGA Portal Screenshot 1](./screenshots/Screenshot%201.png)




![MGNREGA Portal Screenshot 2](./screenshots/Screenshot%202.png)

----

## ⚙️ Tech Stack

### 🎨 Frontend
- **HTML5, CSS3, JavaScript (Vanilla JS)**
- **Chart.js** for visual analytics
- **Service Worker (sw.js)** for offline caching
- **IndexedDB (idb.js)** for local storage
- **Responsive Design** for mobile and desktop devices

### 🧠 Backend
- **Node.js + Express**
- **Axios** for API requests
- **MongoDB (optional)** via **Mongoose**
- **Environment Configuration** using `.env`
- **Caching Layer** to reduce redundant API calls

### 🚀 Deployment
- **PM2** for process management
- **Nginx** for reverse proxy
- **Linux (Ubuntu)** compatible deploy script `deploy.sh`
- **GitHub** for version control

---

## 💡 Key Features

✅ **Bilingual UI** – English and Hindi support  
✅ **Offline-first Mode** – Auto caches previous data  
✅ **Real-time Data Fetching** from [data.gov.in](https://data.gov.in/)  
✅ **Interactive Visualizations** using Chart.js  
✅ **Geo-district Detection** for user convenience  
✅ **Responsive Design** optimized for low-end devices  
✅ **Fallback Mode** – Works even when API is down  
✅ **Simple Deployment** – PM2 + Nginx ready  

---

## 📁 Project Structure

mgnrega-portal
├── backend/
│ ├── server.js
│ ├── package.json
│ ├── package-lock.json
│ ├── routes/
│ │ └── api.js
│ ├── services/
│ │ └── dataService.js
│ ├── models/
│ │ └── CacheEntry.js
│ ├── .env.example
│ └── .gitignore
├── frontend/
│ ├── index.html
│ ├── css/
│ │ └── styles.css
│ ├── js/
│ │ ├── app.js
│ │ ├── api.js
│ │ ├── i18n.js
│ │ ├── idb.js
│ │ └── sw.js
├── deployment/
│ ├── deploy.sh
│ ├── ecosystem.config.js
│ └── nginx.conf
└── README.md


---

## ⚡ Setup & Run Instructions

### 📦 Prerequisites
Make sure you have installed:
- Node.js (v18+)
- npm
- Git
- Optional: http-server for frontend preview

---

### 🖥️ Step-by-Step Setup

#### 🔹 Backend Setup
```cmd
cd "C:\Users\MCL\3D Objects\mgnrega_portal\backend"
npm install
node server.js

Server runs at: http://127.0.0.1:5000 


### 🔹 Frontend Setup
```cmd
cd "C:\Users\MCL\3D Objects\mgnrega_portal\frontend"
npx http-server -c-1 -p 8080 .

Server runs at: http://127.0.0.1:8080

------


🏆 Achievements & Highlights

🏅 Improved data accessibility for rural citizens of Maharashtra
📊 Enabled interactive visualization of MGNREGA data
📱 Designed for mobile-first users in remote areas
⚡ Implemented offline access for regions with limited connectivity
🧠 Simplified government data APIs into easy-to-understand charts
🧩 Clean modular architecture (frontend-backend separated)


🔮 Future Enhancements

Add Marathi as a third language
Integrate AI-based anomaly detection (e.g., low wage anomalies)
Add admin dashboard for monitoring and custom reports
Add data export (CSV, PDF) options
Cloud-hosted version with HTTPS (AWS / Render / Vercel backend)
Progressive Web App (PWA) installation for offline use

