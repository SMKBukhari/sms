export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen w-full'>
      {/* Left Side: Form */}
      <div className='flex w-full flex-col items-center justify-center bg-white px-4 py-8 md:w-1/2 lg:px-8 dark:bg-zinc-900'>
        {children}
      </div>

      {/* Right Side: Branding */}
      <div className='hidden w-1/2 flex-col items-center justify-center bg-[#1e293b] p-8 text-white md:flex relative overflow-hidden'>
        {/* Abstract Background Shapes (Optional imitation of design) */}
        <div className='absolute top-0 right-0 h-full w-full opacity-10'>
          <div className='absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 blur-3xl'></div>
          <div className='absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500 blur-3xl'></div>
        </div>

        <div className='relative z-10 flex flex-col items-center text-center'>
          {/* Logo Placeholder */}
          <div className='mb-8 flex items-center space-x-3'>
            <div className='h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
              <span className='text-xl font-bold'>S</span>
            </div>
            <span className='text-3xl font-bold text-white'>Schola</span>
          </div>

          <h1 className='text-4xl font-bold tracking-tight mb-4'>
            Welcome to Schola
          </h1>
          <p className='max-w-md text-blue-100'>
            Connect, manage, and grow your school community effortlessly.
            Experience the future of school management today.
          </p>

          {/* Card Mockup (Optional - matching the image which has a floating card) */}
          <div className='mt-12 relative w-full max-w-[400px] aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl p-6 hidden lg:block'>
            <div className='absolute -left-12 -bottom-12 w-48 h-64 bg-white rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-1000'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
