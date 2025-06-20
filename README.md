# BoardSuite Management System

BoardSuite Management System is a full-stack web application built with Next.js, designed to provide a robust and efficient platform for managing business operations.

## About The Project

This project serves as a comprehensive management solution, leveraging the power of modern web technologies to deliver a seamless user experience. The front end is built with React and Next.js, offering server-side rendering and static site generation for optimal performance. It's connected to a MySQL/MariaDB database, managed by a powerful command-line utility for easy setup and maintenance.

**Core Technologies:**
* [Next.js](https://nextjs.org/) - A React framework for production.
* [React](https://react.dev/) - A JavaScript library for building user interfaces.
* [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript.
* [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/) - A relational database for data persistence.
* [Node.js](https://nodejs.org/) - Used for the backend and scripting.
* [Geist](https://vercel.com/font) - The font family used for styling.

## Getting Started

To get a local copy up and running, follow these steps.

1.  **Clone the repository:**
    ```sh
    git clone [https://your-repository-url.com](https://your-repository-url.com)
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    ```
3.  **Set up the database:**
    Use the included database utility to create the database, table, and initial admin user. See the "Database Setup" section below for details.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

This project includes a command-line tool to automate database setup, including creating the database, tables, and initial user credentials.

The tool is located at `commands/db_maker.js`.

### **Showing Help and Usage**

To see the list of available commands and how to use the tool, run the script with the `--help` flag or with no arguments at all.

```bash
node commands/db_maker.js --help
```

This will display the following guide:
```
    Usage: node commands/db_maker.js [command]

    Commands:
      --help            Shows this help message.

      --create=all      Creates the database, the table, and the admin user.
      --create=db       Creates only the database.
      --create=table    Creates only the table (database must exist).
      --create=cred     Creates only the admin user (db and table must exist).

      --delete=db       Deletes the entire database.
      --delete=table    Deletes the user table.
      --delete=cred     Deletes the admin user credential.
```

### **Recommended First-Time Setup**
To perform the complete initial setup (database, table, and admin user), run the following command:
```bash
node commands/db_maker.js --create=all
```

### **Migrate all tables**
To perform the complete initial setup of all tables needed:
```bash
npm run migrate
```


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.