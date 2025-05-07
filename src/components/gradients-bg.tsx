export function GradientsBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[10%] top-[20%] h-96 w-96 rounded-full bg-purple-100 opacity-40 blur-3xl"></div>
      <div className="absolute left-[60%] top-[10%] h-72 w-72 rounded-full bg-blue-100 opacity-30 blur-3xl"></div>
      <div className="absolute -right-[10%] top-[40%] h-80 w-80 rounded-full bg-pink-100 opacity-40 blur-3xl"></div>
      <div className="absolute bottom-[20%] left-[30%] h-64 w-64 rounded-full bg-teal-100 opacity-30 blur-3xl"></div>
      <div className="absolute bottom-[10%] right-[20%] h-56 w-56 rounded-full bg-indigo-100 opacity-30 blur-3xl"></div>
      <div className="absolute left-[10%] top-[5%] h-60 w-60 rounded-full bg-rose-100 opacity-25 blur-3xl"></div>
      <div className="absolute right-[35%] top-[60%] h-48 w-48 rounded-full bg-amber-100 opacity-20 blur-3xl"></div>
    </div>
  )
}