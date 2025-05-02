export function ChatLoading() {
  return (
    <div className="flex items-center space-x-1 animate-pulse">
      <div className="size-2 bg-muted-foreground/70 rounded-full"></div>
      <div className="size-2 bg-muted-foreground/70 rounded-full animation-delay-200"></div>
      <div className="size-2 bg-muted-foreground/70 rounded-full animation-delay-500"></div>
    </div>
  );
} 