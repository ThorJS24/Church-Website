import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources — Salem Primitive Baptist Church',
  description: 'Bible studies, devotionals, and downloadable resources from Salem Primitive Baptist Church.',
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
