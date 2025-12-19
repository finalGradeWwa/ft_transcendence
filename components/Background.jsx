export function Background({ children }) {
  return (
    <div className="relative">
      {/* tło które pokrywa całość */}
      <div 
        className="fixed inset-0 opacity-80"
        style={{ 
          backgroundImage: "url('/images/background/background_image.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center', // centrowanie LTR/RTL
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="fixed inset-0 bg-black/40" />
      {/* kontener zawartości */}
      <div className="relative text-white">
        {children}
      </div>
    </div>
  );
}
