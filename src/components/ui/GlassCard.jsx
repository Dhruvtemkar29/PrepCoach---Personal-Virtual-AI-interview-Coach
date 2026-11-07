
import { motion } from "motion/react";

export default function GlassCard({
  children,
  className = "",
  hover = false,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -3 } : undefined}
      className={`glass-card p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}
