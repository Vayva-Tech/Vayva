export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#f0fdf4',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(52, 211, 153, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(52, 211, 153, 0.06) 0px, transparent 50%)
        `,
      }}
    >
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  );
}
