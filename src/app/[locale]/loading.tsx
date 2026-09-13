export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/20 pointer-events-none"
      aria-hidden="true"
    >
      <img
        src="/images/logo.png"
        alt=""
        className="h-14 w-auto max-w-[180px] object-contain sm:h-16"
      />
    </div>
  );
}
