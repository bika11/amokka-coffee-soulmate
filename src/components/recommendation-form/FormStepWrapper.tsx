interface FormStepWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const FormStepWrapper = ({ title, subtitle, children }: FormStepWrapperProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">{title}</h2>
      {subtitle && (
        <p className="text-center text-muted-foreground">{subtitle}</p>
      )}
      {children}
    </div>
  );
};