<div align="center">
<img width="1200" alt="SupportFlow Logo" src="./SupportFlow_logo.png" />
</div>

# SupportFlow Guide Book

An intelligent customer support ticket management platform with an integrated Machine Learning backend. The system uses highly-customized XLM-RoBERTa neural networks to automatically read ticket subjects and descriptions, and predict the **Priority** and target **Department**.

## System Architecture
This application consists of two main pieces that must be run simultaneously:
1. **Frontend**: React + TypeScript interface (running on Node.js)
2. **Backend**: Python + FastAPI service that loads and runs the `.pt` Machine Learning models

---

## 📖 User, Admin & Developer Guide

SupportFlow provides tailored environments based on the user's role. Here is a guide on how to navigate and use the platform for each target role.

### 🔐 Getting Access (Quick Login)
When you open the application, you can quickly log in by using the buttons at the bottom of the login form or by typing these credentials:
*   **User Role:** `user@test.com` (Password: `password123`)
*   **Admin Role:** `admin@test.com` (Password: `password123`)
*   **Developer Role:** `dev@test.com` (Password: `password123`)

---

### 👤 1. User Portal Guide
The User Portal is designed for clients or customers who need to report an issue.

*   **Submitting a Ticket:**
    1. Click the **"+ New Ticket"** button.
    2. Enter a **Subject** and a detailed **Description** of your issue.
    3. Click **"Submit Ticket"**.
    4. *Under the hood:* The platform sends this description to the Machine Learning models, which instantly categorize your ticket (e.g. assigning it to *Billing and Payments* or *IT Support*) and set its priority level (e.g. *High* or *Low*).
*   **Viewing Tickets:**
    *   You will see a beautiful timeline of all your submitted tickets with their real-time statuses: `Open` (yellow), `In Progress` (blue), or `Resolved` (green).
*   **Editing Tickets:**
    *   If you need to update a ticket's description or subject, click on the ticket.
    *   Make your changes in the modal and click **"Update Ticket"**.
    *   *ML Feature:* The system will automatically re-run the AI classification on your new text to update the department and priority dynamically!

---

### 👑 2. Admin Dashboard Guide
The Admin Dashboard is built for customer support team leads to oversee and manage incoming tickets.

*   **Metrics Overview:**
    *   Get an instant high-level snapshot of total tickets and how many are marked as **High Priority** to handle first.
*   **Filtering Tickets:**
    *   Filter the list of tickets by department (e.g. *Billing & Payments*, *Customer Service*, *IT & Technical*, or *Product Support*) to focus on specific issues.
*   **Managing Ticket Details:**
    *   Click on any ticket in the active list to view its full details.
    *   Use the drop-down selectors to **manually reassign the priority** (*Low*, *Medium*, *High*) or **change the assigned department**.
    *   Update the creation date/time if backdating is required.
*   **Deleting Tickets:**
    *   Admins can clean up or delete duplicate/spam tickets using the **Trash/Delete** button.

---

### 💻 3. Developer Guide
The Developer view inherits all admin privileges and provides dedicated utilities for machine learning performance auditing and system monitoring.

*   **Confidence Auditing:**
    *   Developers can view the exact **AI Confidence level %** for each automatically classified ticket (both for priority and department classification).
*   **System Diagnostics Dashboard:**
    *   Click the **History/Logs icon** in the top right of the Admin Dashboard.
    *   This opens the **Ticket Logs** system, where you can view Recharts charts showing:
        *   Ticket volume trends over the last 7 or 30 days.
        *   Average Machine Learning classification confidence levels over time.
        *   Ticket counts broken down by Low, Medium, and High priority.
    *   Review the detailed audit logs containing raw payload predictions, tokenization results, and classification confidence scores.

---

<!--
## 🚀 How to Start the Application

Because this uses a local web server and a local Python AI engine, whenever you turn your computer off and on, you will need to start both pieces using two separate terminal windows.

### Step 1: Start the AI Backend Engine (Terminal 1)
This terminal will load the heavy PyTorch models into memory and listen for predictions from the website.

1. Open your terminal (PowerShell or Command Prompt)
2. Navigate to the backend folder:
   ```powershell
   cd d:\Self_SupportFlow\backend
   ```
3. Activate the Python virtual environment:
   ```powershell
   .\venv\Scripts\activate
   ```
4. Start the FastAPI server:
   ```powershell
   uvicorn main:app --reload
   ```
*Wait until the terminal says "Application startup complete" before moving to the next step.*

### Step 2: Start the Web App (Terminal 2)
This terminal will launch the User Interface.

1. Open a **new, separate** terminal window
2. Navigate to the main project folder:
   ```powershell
   cd d:\Self_SupportFlow
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```

### Step 3: Access the App
Open your web browser and go to:
**http://localhost:3000**

---

## 🛠️ First-Time Setup Instructions

If you are setting this project up on a new computer for the very first time, follow these steps before doing the regular startup:

**1. Machine Learning Setup**
Make sure your models are placed in the `models/` directory:
- `models/xlmr_priority_model.pt`
- `models/xlmr_routing_model.pt`
- `models/xlm_tokenizer/`

Install Python dependencies:
```powershell
cd d:\Self_SupportFlow\backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

**2. Web App Setup**
Install Node.js dependencies:
```powershell
cd d:\Self_SupportFlow
npm install
```

---

## 🧠 About the AI Integration

The `UserPortal` form sends the ticket text to the local Python backend at `http://127.0.0.1:8000/predict`.

The Python API automatically reconstructs the custom classifier architecture for both models:
- **Priority**: P1 (high), P2 (medium), P3 (low)
- **Department**: Billing & Payments, Customer Service, IT & Technical Support, Product Support

If the AI confidence is extremely low or if the models fail to load, the system has a built-in safety fallback that defaults to routing tickets to `Customer Service` at `medium` priority.
-->
