# University Student Issue & Requirement Management System 🎓

A professional full-stack platform designed specifically for university environments to streamline student–administration communication, issue reporting, departmental resolution workflows, status tracking, and student feedback.

---

## 📱 How to Download the Android APK via GitHub Actions

This repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/build-apk.yml`) that automatically compiles and packages the Android `.apk` file using GitHub's cloud build servers.

### Steps to generate and download your APK:
1. **Create a new repository on GitHub** (e.g. `university-issue-management`).
2. **Push this code to your GitHub repository**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. **Go to your GitHub repository** in your web browser:
   - Click on the **Actions** tab at the top.
   - You will see the **Build Android APK** workflow running automatically.
   - Once it finishes (approx. 3-4 minutes), click on the workflow run.
   - Under the **Artifacts** section, click **`University-Student-Issue-Portal-debug.apk`** to download the APK file directly to your computer or phone!
4. **Install on your Android Phone**:
   - Transfer the `.apk` file to your Android device (or download directly on your phone's browser).
   - Tap the APK file to install and launch your app.

---

## ⚡ Instant Mobile App (PWA - No Compilation Needed)

The application is also built as an installable Progressive Web App (PWA):
1. Run the app locally on your computer:
   ```bash
   npm start
   ```
2. Open Google Chrome on your Android phone connected to the same Wi-Fi network and visit:
   `http://<your-computer-ip>:5000`
3. Tap the **⋮** menu in Chrome and select **"Install app"** or **"Add to Home screen"**.
4. The University Portal will install to your app drawer and open as a standalone fullscreen app with an app launcher icon, offline caching, and native app behavior!

---

## 👥 Demo User Accounts (Pre-seeded)

### Student Accounts (Student Portal):
| Name | Username / ID | Password | Department & Year | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Kumar** | `student1` | `student123` | Computer Science, Year 3 | Has active Wi-Fi issue & resolved exam clash |
| **Priya Sharma** | `student2` | `student123` | Electrical Engineering, Year 2 | Has pending classroom projector issue |
| **Arjun Reddy** | `student3` | `student123` | Mechanical Engineering, Year 4 | Has resolved hostel water pressure issue |

*Tip: The login page also features **1-Click Quick Demo Login buttons** so you can log in instantly without typing!*

### Administrator Account (Admin Portal):
| Name | Username / ID | Password | Role & Department |
| :--- | :--- | :--- | :--- |
| **Dr. Sarah Jenkins** | `admin` | `admin123` | Dean of Student Affairs |

---

## 🚀 Running Locally

### 1. Unified Single-Server Mode (Runs Backend + Built Frontend on Port 5000)
```bash
# In project root:
npm start
```
Access at: `http://localhost:5000` (or `http://127.0.0.1:5000`)

### 2. Development Mode with Hot Module Reload (HMR)
```bash
# Terminal 1 - Backend:
npm run dev:backend

# Terminal 2 - Frontend:
npm run dev:frontend
```
Frontend runs at: `http://localhost:5173`
Backend API runs at: `http://localhost:5000`

---

## 🌟 Key Application Features

### 1. Student Portal
- **Dashboard**: Live metrics (Total Raised, Pending Review, Under Review, Resolved), recent issue history, and quick access.
- **Raise Issue Form**: Categorized tickets (Academic, Examination, Faculty, Classroom, Hostel, Transport, Infrastructure, Library, Wi-Fi, Other) with priority tagging (Low, Medium, High).
- **My Issues**: Responsive filterable table and mobile card view with search and sorting.
- **Communication & Threading**: Real-time conversation thread displaying official administrator replies.
- **Resolution Feedback**: 1-to-5 star rating and optional comments with celebration confetti upon resolution.
- **Notification Center**: Bell icon with unread badge counter for status changes and admin messages.
- **Student Profile**: Academic details, year, and editable contact info.

### 2. Administrator Portal
- **Oversight Dashboard**: Executive KPIs (Total, Pending, Under Review, Resolved, Rejected, Urgent High Priority).
- **Category Analytics**: Visual distribution bars showing issues across university departments.
- **Satisfaction Monitoring**: Verified student rating score (average stars out of 5).
- **Issue Management**: Multi-filter search (by Issue ID, Student Name, Student ID, Title, Category, Priority, and Status).
- **Status Lifecycle**: Transition issues through `Pending` $\rightarrow$ `Under Review` $\rightarrow$ `Resolved` or `Rejected`.
- **Canned Quick Responses**: 1-click university response templates for maintenance, IT, examination, and hostel teams.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT), bcryptjs.
- **Database**: Node.js 24 native built-in `node:sqlite` (zero compilation dependencies, persistent `database.sqlite`).
- **Mobile**: Progressive Web App (PWA) Manifest + Service Worker, Capacitor Android config, GitHub Actions APK compiler.
