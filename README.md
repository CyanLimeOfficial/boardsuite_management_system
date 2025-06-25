# BoardSuite Management System

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/MySQL-8.x-orange?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/AI-Gemini-purple?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini AI"/>
</p>

An AI-enhanced, full-stack web application designed to provide a robust and efficient platform for managing boarding house operations in Naval, Eastern Visayas, Philippines.

## About The Project

BoardSuite Management System is a comprehensive solution built with Next.js, leveraging modern web technologies to deliver a seamless user experience. It offers property managers a centralized dashboard to oversee tenants, rooms, billing, and financial reporting. A key feature is its integration with Google's Gemini AI, which provides intelligent insights and summaries for financial reports, transforming raw data into actionable information.

### Core Technologies
* **Framework:** [Next.js](https://nextjs.org/)
* **UI Library:** [React](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Database:** [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Authentication:** [JWT](https://jwt.io/) & [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
* **AI Integration:** [Google Gemini API](https://ai.google.dev/)
* **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

---

## Features

BoardSuite provides a rich set of features designed to streamline property management:

#### 📊 **Dynamic Dashboard**
* Get a real-time overview of key metrics, including total tenants, room occupancy, pending payments, and current monthly revenue.

#### 🚪 **Room Management**
* A dedicated interface to **add, view, edit, and delete** rooms.
* Track room status (e.g., 'Available', 'Occupied', 'Under Maintenance') and manage rental rates.

#### 👥 **Tenant Management**
* Full CRUD (Create, Read, Update, Delete) functionality for tenant records.
* Easily **relocate** tenants to different available rooms.
* Store comprehensive tenant details, including contact information and emergency contacts.

#### 💰 **Automated Billing & Payments**
* **Generate due bills** for all tenants with a single click, based on their individual billing cycles.
* Automatically apply **late fees** (fixed or percentage-based) for overdue payments, based on rules you define in the settings.
* Record full or partial payments against outstanding bills.

#### 📈 **AI-Powered Reporting**
* View detailed financial reports for any given month.
* **Generate an AI-powered summary** of the monthly report, providing a concise, professional analysis of sales and pending dues.
* **Export comprehensive PDF reports**, complete with the AI-generated summary and itemized data tables.

#### ⚙️ **System Settings**
* **Business Profile:** Configure your boarding house name, address, and contact information, which appears on reports.
* **Financial Rules:** Customize the billing cycle, default due periods, late fee policies, and accepted payment methods.
* **Integrations:** Securely manage your **Google AI (Gemini) API Key**.
* **User Account:** Update your administrator profile and change your password.

---

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites
* Node.js (v18 or later)
* NPM or Yarn
* A running instance of MySQL or MariaDB

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/CyanLimeOfficial/boardsuite_management_system
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd boardsuite-management-system
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Set up environment variables:**
    * Create a file named `.env.local` in the root of your project.
    * Add your database credentials and a secure JWT secret:
        ```env
        DB_HOST=127.0.0.1
        DB_USER=root
        DB_PASSWORD=your_db_password
        DB_DATABASE=boardsuite_management_system
        JWT_SECRET=your-super-secret-key-that-is-long-and-random
        ```

### Database Setup

This project includes migration scripts to create all necessary tables.

1.  **First, create the database itself.** You can do this manually in your database client (like phpMyAdmin) or by using the included utility:
    ```bash
    node commands/db_maker.js --create=db
    ```
2.  **Then, run the migration command** to create all the required tables (`users`, `settings`, `rooms`, `tenants`, `bills`, `payments`):
    ```bash
    npm run migrate
    ```
    This command executes all the scripts inside the `/src/migrations/` directory.

### Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
