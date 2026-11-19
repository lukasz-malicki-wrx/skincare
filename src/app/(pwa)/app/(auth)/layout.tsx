/** Sign-in and sign-up: one centred column, scrollable when the keyboard takes the space. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-y-auto px-6 py-10">{children}</main>;
}
