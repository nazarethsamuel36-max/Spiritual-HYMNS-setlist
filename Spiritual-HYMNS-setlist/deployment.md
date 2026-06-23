# 🚀 Deployment Guide

This project is containerized using Docker and is ready for deployment on any cloud provider (Render, Railway, Fly.io) or local infrastructure.

## 📋 Prerequisites

*   **Docker** installed on your machine.
*   **MySQL Database** (Local or Cloud like Aiven/Render).
*   **Maven** (optional, if building without Docker).

---

## 🛠️ Local Docker Setup

### 1. Build the Image
Run the following command in the project root:
```bash
docker build -t worship-app .
```

### 2. Run the Container
Replace the placeholders with your database credentials:
```bash
docker run -p 8080:8080 \
  -e DB_URL="jdbc:mysql://YOUR_DB_HOST:3306/worship_db?useSSL=true" \
  -e DB_USER="your_username" \
  -e DB_PASSWORD="your_password" \
  worship-app
```
The app will be available at `http://localhost:8080`.

---

## ☁️ Cloud Deployment (Render / Railway)

### 1. Connect Repository
*   Push your code to GitHub.
*   Connect the repository to **Render** or **Railway**.

### 2. Configure Service
*   **Service Type:** Web Service (Render) or New Project (Railway).
*   **Runtime:** Docker (it will automatically detect the `Dockerfile`).

### 3. Set Environment Variables
In the service dashboard, add the following variables:
| Key | Value (Example) |
| :--- | :--- |
| `DB_URL` | `jdbc:mysql://mysql-test.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | `your_secret_password` |

---

## 🗄️ Aiven Database Connection

If using **Aiven for MySQL**:
1.  Copy the **Service URI** from the Aiven Console.
2.  The format should look like this:
    `jdbc:mysql://<HOST>:<PORT>/<DATABASE>?ssl-mode=REQUIRED`
3.  Ensure you include `ssl-mode=REQUIRED` in the `DB_URL` for secure connection.

---

## 🧪 Validation
Once deployed, verify:
1.  **Homepage:** Loads at the root URL (`/`).
2.  **Search:** Number search (e.g., #1001) and text search work correctly.
3.  **Database:** Songs are retrieved from the external database, not local files.
