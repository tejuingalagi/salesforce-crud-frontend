# Salesforce CRUD Application — Frontend

A React-based web application for managing Salesforce records through a Spring Boot backend.

## Features

- Salesforce OAuth login integration
- Dashboard to select and view Salesforce objects
- Display records retrieved from Salesforce
- Create Salesforce Account records
- React frontend integrated with the backend using Axios

## Technologies Used

- React.js
- Vite
- JavaScript
- Axios
- CSS
- Salesforce REST API integration through Spring Boot

## Supported Salesforce Objects

- Account
- Opportunity
- Lead
- Contact
- Case

## Prerequisites

- Node.js and npm
- The Salesforce CRUD Spring Boot backend
- A configured Salesforce account and OAuth application

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tejuingalagi/salesforce-crud-frontend.git
cd salesforce-crud-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

Open the local URL shown in your terminal, usually `http://localhost:5173`.

## Backend Configuration

The frontend communicates with the Spring Boot backend at `http://localhost:8080` during local development.

Start the backend separately and configure Salesforce OAuth credentials using the backend's configuration.

## Project Status

The dashboard, Salesforce login integration, record retrieval, and Account creation have been tested. Additional CRUD operations, pagination, and deployment are in progress.

## Repositories

- **Frontend:** https://github.com/tejuingalagi/salesforce-crud-frontend
- **Backend:** https://github.com/tejuingalagi/salesforce-crud

---

Developed as a Salesforce CRUD application project.