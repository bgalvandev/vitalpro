import { redirect } from 'next/navigation';

export default function HomePage() {
  // The first surface of VitalPro Core web is the appointment console.
  redirect('/appointments');
}
