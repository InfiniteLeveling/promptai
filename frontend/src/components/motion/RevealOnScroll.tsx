import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className,
  delay = 0,
  yOffset = 24
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
