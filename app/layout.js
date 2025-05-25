// app/layout.js
import './globals.css'; // Your global styles

export const metadata = {
  title: 'Candidate Heatmap', // Default title, can be overridden by pages
  description: 'View and compare candidate skills.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children} {/* This is where app/page.js will be rendered */}
      </body>
    </html>
  );
}