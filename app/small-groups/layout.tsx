import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Small Groups — Salem Primitive Baptist Church',
  description: 'Find a small group at Salem Primitive Baptist Church — connect, grow, and study scripture together.',
};

export default function SmallGroupsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
