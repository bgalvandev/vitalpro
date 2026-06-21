import './global.css';

export const metadata = {
  title: 'VitalPro Core — Appointments',
  description: 'Daily appointment console for VitalPro Core service businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
