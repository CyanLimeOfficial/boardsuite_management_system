// app/layout.tsx
import { AuthProvider } from "@/app/credentials/AuthCredentials"; // Correctly import the provider
import "./globals.css";

export const metadata = {
  title: "BoardSuite App",
  description: "Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* By wrapping here, every page and component can use the useAuth() hook */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}