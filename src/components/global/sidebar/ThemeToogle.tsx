"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { MoonIcon, SunIcon } from "lucide-react";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();

  // Avoids hydration mismatch
  if (typeof window === "undefined") {
    // Render a placeholder or nothing on the server
    return (
      <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full' />
    );
  }

  const toggleTheme = () => {
    // We toggle between 'dark' and 'light' directly.
    // 'resolvedTheme' tells us the current active theme, even if the preference is 'system'.
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const iconVariants = {
    initial: { y: -20, opacity: 0, rotate: -90 },
    animate: { y: 0, opacity: 1, rotate: 0 },
    exit: { y: 20, opacity: 0, rotate: 90 },
  };

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label='Toggle theme'
      whileTap={{ scale: 0.9, rotate: 15 }}
      className='relative flex items-center justify-center w-10 h-10 rounded-lg bg-transparent text-primary-foreground dark:text-primary-foreground transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-offset-white dark:focus:ring-offset-black focus:ring-blue-500 border border-primary-border cursor-pointer hover:border-primary'
    >
      <AnimatePresence mode='wait' initial={false}>
        {resolvedTheme === "dark" ? (
          <motion.div
            key='moon'
            variants={iconVariants}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <MoonIcon className='h-5 w-5' />
          </motion.div>
        ) : (
          <motion.div
            key='sun'
            variants={iconVariants}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SunIcon className='h-5 w-5 text-yellow-500' />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
