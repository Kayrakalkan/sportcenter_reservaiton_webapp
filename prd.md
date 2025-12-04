# 📘 PRD – Spor Salonu Rezervasyon Sistemi

---

## 1. Proje Adı

**Üniversite Spor Salonu Rezervasyon Sistemi**

---

## 2. Amaç

Fakültelerin haftalık antrenmanlarını planlayabilmesi ve idari personelin maç/etkinlik saatlerini organize edebilmesi için bir çevrimiçi rezervasyon sistemi geliştirmek. Kullanımı basit, erişimi hızlı ve mobil uyumlu bir sistem hedeflenmektedir.

---

## 3. Hedef Kitle

- Üniversitedeki fakülte spor takımları
- Spor salonundan sorumlu idari personel (admin)

---

## 4. Temel Özellikler

### 4.1 Giriş Sistemi
- Her fakülteye atanmış sabit kullanıcı adı ve parola
- Admin için özel bir kullanıcı hesabı

### 4.2 Rezervasyon Modülü (Fakülte Kullanıcısı)
- Haftalık takvim görünümünde saat seçimi
- Sadece boş saatlere rezervasyon
- Önceki rezervasyonları görüntüleme

### 4.3 Etkinlik/Blokaj Modülü (Admin)
- Haftalık maç, turnuva veya bakım saatleri için zaman aralığı kapatma
- Tüm rezervasyonları görme ve silme
- Kullanıcı ekleme/silme (opsiyonel)

### 4.4 Takvim Arayüzü
- Angular takvim görünümü (haftalık)
- Renk kodlu: fakülte rezervasyonu / admin etkinliği / boş saat
- Mobil ve masaüstü uyumlu

---

## 5. Teknik Mimarisi

### 5.1 Frontend

- **Framework:** Angular
- **UI Kütüphanesi:** Angular Material
- **Sayfalar:**
  - Login 
  - Rezervasyon Takvimi 
  - Admin Panel 

### 5.2 Backend

- **Platform:** ASP.NET Core 8 Web API
- **Veritabanı:** PostgreSQL
- **ORM:** Entity Framework Core
- **Katmanlar:**
  - Authentication ok
  - ReservationService ok
  - AdminService ok

---

## 6. Veritabanı Tasarımı

**Kullanıcılar (Users)**
- `Id`: GUID
- `Username`: string
- `PasswordHash`: string
- `Role`: enum (Admin, Faculty)

**Rezervasyonlar (Reservations)**
- `Id`: GUID
- `UserId`: foreign key
- `StartTime`: datetime
- `EndTime`: datetime
- `Type`: enum (Training, Event)

---

## 7. Kurulum Talimatları (macOS)

### 7.1 Temel Kurulumlar

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# .NET 8
brew install --cask dotnet-sdk

# Node + Angular CLI
brew install node
npm install -g @angular/cli

# PostgreSQL
brew install postgresql
brew services start postgresql
psql postgres -c "CREATE DATABASE sport_reservation;"
