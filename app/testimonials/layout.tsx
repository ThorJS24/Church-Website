import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimonials — Salem Primitive Baptist Church',
  description: 'Stories of faith and God’s work in the lives of our church family.',
};

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
