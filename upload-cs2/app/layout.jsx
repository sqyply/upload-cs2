import "./globals.css";

export const metadata = {
  title: "CS2 Upgrader",
  description: "Upgrade your CS2 skins",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, background: "#111", color: "#fff", fontFamily: "sans-serif" }}>
        {children}
      </body>
    </html>
  );
}