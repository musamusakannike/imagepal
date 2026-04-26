import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editor — ImagePal',
  description: 'Edit your image with crop, filters, adjustments, layers, resize, and export tools.',
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
