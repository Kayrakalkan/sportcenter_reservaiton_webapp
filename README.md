# 🏀 University Sports Center Reservation System

<div align="center">

![Angular](https://img.shields.io/badge/Angular-19.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A full-stack web application for managing university sports facility reservations with role-based access control**

</div>

---

## 🎯 Overview

The **University Sports Center Reservation System** is a modern web application that streamlines sports facility scheduling for university faculty departments. Faculty members can reserve training slots through an interactive calendar, while administrators maintain full control over facility scheduling and event management.

This project demonstrates full-stack development skills with **Angular 19**, **ASP.NET Core 9**, and **PostgreSQL**, implementing RESTful APIs, role-based authentication, and real-time state management.

## ✨ Key Features

### 👥 Role-Based Access Control
- **Faculty Users**: Book weekly training sessions via interactive calendar
- **Admin Users**: Full system oversight with management capabilities
- Secure authentication with session persistence

### 📅 Smart Reservation System
- Interactive weekly calendar with color-coded time slots
- One reservation per week policy enforcement
- One-hour time slot validation
- Real-time availability checking with conflict prevention

### 🛡️ Admin Panel
- View all reservations across all faculty departments
- Create system-wide events (matches, tournaments, maintenance)
- Delete/cancel reservations
- User management

### 📱 Responsive Design
- Mobile-first approach with Angular Material
- Optimized for all devices
- Smooth animations and real-time updates

## 🛠️ Tech Stack

**Frontend:** Angular 19, TypeScript 5.7, Angular Material, RxJS, SCSS  
**Backend:** ASP.NET Core 9, Entity Framework Core 9, C# 12  
**Database:** PostgreSQL  
**Tools:** Git, Angular CLI, .NET CLI

## 💡 What I Built

**Full-Stack Development:**
- RESTful API with proper endpoint design and HTTP methods
- PostgreSQL database with normalized schema and relationships
- Role-based authentication and authorization
- RxJS state management with reactive patterns
- Comprehensive error handling on client and server

**Frontend Skills:**
- Angular 19 with standalone components and dependency injection
- Reactive programming with RxJS operators
- Route guards for authentication
- Responsive UI with Angular Material

**Backend Skills:**
- Clean architecture with Controllers, Services, and Data layers
- Entity Framework Core with code-first migrations
- Async/await patterns for non-blocking operations
- Business logic validation (weekly limits, conflict detection)
- CORS configuration for SPA integration

## 🚀 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL](https://www.postgresql.org/download/) (v12+)
- [Angular CLI](https://angular.io/cli)

### Setup

**1. Clone and Setup Database**
```bash
git clone https://github.com/Kayrakalkan/sport_center.git
cd sport_center

# Start PostgreSQL and create database
brew services start postgresql
psql postgres -c "CREATE DATABASE sport_reservation;"
```

**2. Backend Setup**
```bash
cd nosil
dotnet restore
dotnet ef database update
dotnet run  # Runs on http://localhost:5246
```

**3. Frontend Setup**
```bash
cd medlo
npm install
ng serve  # Runs on http://localhost:4200
```

**4. Seed Database (Optional)**
```sql
INSERT INTO "Users" ("Id", "Username", "Password", "Role") VALUES
('e27a1f79-35f8-45e3-9ad3-03fb76742db8', 'admin', 'admin123', 0),
('cf153e23-bf23-49da-a2a2-27c8bc869405', 'faculty', 'faculty123', 1);
```

## 🔐 Demo Credentials

**Admin:** `admin` / `admin123` (Full access)  
**Faculty:** `faculty` / `faculty123` (Create/view reservations)

> Note: Demo credentials for testing. Production would use JWT tokens and password hashing.

## 📡 API Endpoints

**Authentication:**
- `POST /api/user/login/admin` - Admin login
- `POST /api/user/login/faculty` - Faculty login
- `GET /api/user` - Get all users

**Reservations:**
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create reservation (validates: 1 hour duration, no conflicts, 1 per week)
- `DELETE /api/reservations/{id}` - Delete reservation

## 🔮 Future Enhancements

- JWT token authentication with password hashing
- Email notifications
- Multi-facility support
- Recurring reservations
- Unit and integration tests
- Docker containerization
- CI/CD pipeline

## 📫 Contact

**Kayra Kalkan**  
 GitHub: [@Kayrakalkan](https://github.com/Kayrakalkan)  
� Email: kayrakalkan@example.com  

---

<div align="center">

**⭐ Star this repo if you found it helpful! ⭐**

Made with ❤️ using Angular, .NET, and PostgreSQL

</div>
