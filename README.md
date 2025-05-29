# 🌐 QuickCert: Online Income Statements Requesting System

QuickCert is a web-based platform that enables Sri Lankan citizens—especially pensioners—to request, track, and receive official income statements digitally. Designed with both efficiency and accessibility in mind, this system helps digitize Divisional Secretariat operations, reduces administrative burden, and improves the user experience for both citizens and government officers.

---

## 🚀 Project Summary

- 📌 **University:** Sabaragamuwa University of Sri Lanka  
- 📚 **Course Code:** SE4106 - Web Systems and Technologies  
- 👨‍🏫 **Supervisor:** Mrs. K.G.L. Chathumini (Lecturer)  
- 👥 **Group 07 Members:**
  - Isuranga Dasun Jayassri (21CSE0166)
  - Welivita H.M.B.B. (Bhagya) (21CSE0167)
  - Thennakoon T.M.T.T. (Tharuka) (21CSE0169)

---

## 🛠️ Tech Stack

### Frontend
- Angular
- HTML5, CSS3
- TypeScript
- Bootstrap / Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MySQL
- Sequelize ORM

### Others
- JWT for authentication
- PDF and QR Code generation libraries
- SendGrid / Twilio for email & SMS
- Hosted on AWS / Azure / Google Cloud

---

## 🔐 User Roles

- **Citizen (Pensioner):** Apply for income statements, track status, and download documents.
- **Divisional Secretariat Officer:** Review applications, verify records, and approve/reject requests.
- **Admin:** Manage users, view system analytics, and monitor platform activity.

---

## 🧭 Navigation and Pages

| Page                        | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| `/home`                     | Introduction and overview of the platform                                  |
| `/about`                    | Background and goals of QuickCert                                          |
| `/contact`                  | Contact information and feedback form                                      |
| `/register`                 | NIC-based registration for all user types                                 |
| `/login`                    | Secure login with optional 2FA                                             |
| `/apply`                    | Application form for income statement request                             |
| `/track`                    | Track application status and history                                       |
| `/dashboard/officer`        | Officer portal to review and process requests                              |
| `/dashboard/admin`          | Admin dashboard for system and user management                            |
| `/documents/:id`            | View and download generated PDF statements                                |
| `/calculator`               | Estimate pension income before applying                                    |
| `/help`                     | FAQ and user guides                                                        |
| `/feedback`                 | Submit service ratings and feedback                                       |
| `/notifications`            | View received email/SMS notifications                                     |
| `/privacy` & `/terms`       | Legal pages outlining user rights and responsibilities                     |
| `/404`                      | Custom error page for broken routes                                        |

---

## ✅ Features

- Secure user authentication (JWT + hashed passwords)
- Role-based access control (RBAC)
- Online application submission and tracking
- Real-time notifications (Email/SMS)
- Digital PDF generation with QR code and digital signature
- Officer and Admin dashboards with analytics
- Feedback collection and support pages

---

## 🔒 Security Considerations

- Password hashing (bcrypt)
- Encrypted data storage (AES-256)
- HTTPS and SSL certificate usage
- OAuth2 and 2FA integration
- Regular vulnerability assessments and audit logs

---

## 📦 Setup & Installation

> **Requirements:**
> - Node.js v18+
> - MySQL Server
> - Angular CLI

### 1. Clone the repository

```bash
git clone https://github.com/quantumLoop99/QuickCert.git
cd quickcert
