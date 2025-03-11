
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

interface StepTransitionProps {
  className?: string;
}

export const StepTransition = ({ 
  children, 
  className = "" 
}: PropsWithChildren<StepTransitionProps>) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
