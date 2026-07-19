import { redirect } from 'next/navigation';

export default function RootLayout() {
  // Redirect to the default locale
  redirect('/fr');
}
