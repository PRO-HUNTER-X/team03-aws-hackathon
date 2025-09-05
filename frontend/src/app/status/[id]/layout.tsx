// 서버 컴포넌트로 generateStaticParams 제공
export function generateStaticParams() {
  return [
    { id: 'demo' },
    { id: 'sample' },
    { id: 'test' }
  ];
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}