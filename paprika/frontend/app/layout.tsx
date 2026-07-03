import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '../components/layout/Header';
import { AuthProvider } from '../contexts/AuthContext';
import { UnreadProvider } from '../contexts/UnreadContext';

export const metadata: Metadata = {
  title: 'Paprika - 동네 중고 마켓',
  description: '신선한 중고 거래, 파프리카',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <AuthProvider>
          <UnreadProvider>
            <Header />
            <div style={{ paddingTop: 72 }}>{children}</div>
          </UnreadProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
