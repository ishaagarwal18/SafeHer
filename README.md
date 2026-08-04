# 🛡️ SafeHer – Women's Safety and Emergency Assistance System

SafeHer is a full-stack web application designed to enhance women's safety by providing quick access to emergency assistance, live journey tracking, safe location discovery, and emergency contact management. The platform empowers users with real-time safety features and an intuitive interface for emergency situations.

---

## 📌 Features

### 🔐 Authentication
- User Registration
- Secure Login
- OTP Verification
- JWT Authentication
- Protected Routes

### 🚨 SOS Emergency
- One-click SOS Alert
- Emergency Notification
- Instant Alert Generation
- SOS History

### 📍 Journey Tracking
- Start Safe Journey
- Track Journey Status
- View Journey History
- Journey Completion Monitoring

### 👥 Emergency Contacts
- Add Emergency Contacts
- Edit Contact Information
- Delete Contacts
- Quick Access During Emergencies

### 🗺️ Safe Places
- View Nearby Safe Locations
- Police Stations
- Hospitals
- Emergency Help Centers

### 📄 Reports
- Report Unsafe Locations
- Submit Incident Reports
- View Previous Reports

### 👤 User Profile
- Update Personal Information
- Manage Account Settings

---

# 🏗️ Project Structure

```
SafeHer/
│
├── Backend/
│   ├── authentication/
│   ├── dashboard/
│   ├── journey/
│   ├── reports/
│   ├── safeher/
│   ├── manage.py
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

## Backend

- Django
- Django REST Framework
- JWT Authentication
- SQLite

## APIs & Services

- Twilio (SMS Alerts)
- Gmail SMTP (OTP Verification)

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/ishaagarwal18/SafeHer.git

cd SafeHer
```

---

## Backend Setup

```bash
cd Backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend will run on

```
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd Frontend

npm install

npm run dev
```

Frontend will run on

```
http://localhost:5173
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the Backend directory.

```env
SECRET_KEY=your_secret_key

EMAIL_HOST_USER=your_email@gmail.com

EMAIL_HOST_PASSWORD=your_email_app_password

TWILIO_ACCOUNT_SID=your_twilio_sid

TWILIO_AUTH_TOKEN=your_twilio_auth_token

TWILIO_PHONE_NUMBER=your_twilio_number
```


---

# 📚 API Modules

| Module | Description |
|----------|-------------|
| Authentication | Login, Signup, OTP Verification |
| Dashboard | User Dashboard |
| Journey | Journey Tracking |
| Reports | Incident Reports |
| SOS | Emergency Alerts |
| Contacts | Emergency Contact Management |

---

# 🔒 Security Features

- JWT Authentication
- Protected Routes
- Password Encryption
- OTP Verification
- Secure API Communication

---

# 🌟 Future Enhancements

- 📍 Live GPS Tracking
- 🎤 Voice Activated SOS
- 🤖 AI Safety Assistant
- 🗺️ Safe Route Recommendation
- 📹 Automatic Audio/Video Recording
- 📲 Push Notifications
- 📡 Real-Time Location Sharing
- ☁️ Cloud Deployment
- 📊 Analytics Dashboard
- 🌙 Dark Mode

---

# 👩‍💻 Team Members

- **Isha Agarwal**
- **Rishita**
- **Nitya**

---

# 🎯 Project Objective

SafeHer aims to provide women with a reliable digital safety companion by integrating emergency assistance, location tracking, contact management, and reporting features into a single platform. The project focuses on improving personal safety through technology and enabling quick action during emergencies.

---

# 📜 License

This project is developed for educational purposes.

---

# ⭐ Support

If you like this project, don't forget to **Star ⭐ the repository** on GitHub.

---

## ❤️ Made with dedication to build a safer tomorrow.