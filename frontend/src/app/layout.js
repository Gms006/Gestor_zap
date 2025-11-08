import '../styles/globals.css';

export const metadata = {
  title: 'Gestor Zap',
  description: 'Dashboard de automação contábil',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
