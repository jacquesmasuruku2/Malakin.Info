export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <img
            src="/images/logo.png"
            alt="MalakInfo"
            className="h-16 w-auto max-w-[220px] object-contain animate-pulse sm:h-20 md:h-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '50ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
        </div>
      </div>
    </div>
  );
}
