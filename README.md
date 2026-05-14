<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SupportFlow Guide Book

An intelligent customer support ticket management platform with an integrated Machine Learning backend. The system uses highly-customized XLM-RoBERTa neural networks to automatically read ticket subjects and descriptions, and predict the **Priority** and target **Department**.

## System Architecture
This application consists of two main pieces that must be run simultaneously:
1. **Frontend**: React + TypeScript interface (running on Node.js)
2. **Backend**: Python + FastAPI service that loads and runs the `.pt` Machine Learning models

---

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
