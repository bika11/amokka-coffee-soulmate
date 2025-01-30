export const LoadingDots = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-muted p-3 rounded-lg">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
};