// components/ui/dialog.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import React, { createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

interface DialogContextType {
  onClose: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a Dialog");
  }
  return context;
};

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isBreadcrumbs?: boolean;
  breadcrumbTitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";
  position?: "right" | "center" | "left";
  autoHeight?: boolean;
}

const Dialog = ({
  isOpen,
  onClose,
  title,
  isBreadcrumbs = false,
  breadcrumbTitle,
  children,
  size = "md",
  position = "right",
  autoHeight = false,
}: DialogProps) => {
  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    xxl: "max-w-2xl",
    xxxl: "max-w-3xl",
  };

  // Position classes and animations
  const positionClasses = {
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
      positionClass: "right-3 top-1/2 -translate-y-1/2",
    },
    center: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 50, opacity: 0 },
      positionClass: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    },
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
      positionClass: "left-0 top-1/2 -translate-y-1/2",
    },
  };

  const currentPosition = positionClasses[position];
  const heightClass = autoHeight ? "h-auto max-h-[95vh]" : "h-[95%] inset-y-0";

  return (
    <DialogContext.Provider value={{ onClose }}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/70 z-40'
              onClick={onClose}
            />

            {/* Dialog Content */}
            <motion.div
              initial={currentPosition.initial}
              animate={currentPosition.animate}
              exit={currentPosition.exit}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className={`fixed ${heightClass} rounded-lg ${currentPosition.positionClass} w-full ${sizeClasses[size]} bg-background shadow-lg overflow-y-auto border border-primary-bg z-99999999`}
            >
              <div className='h-full flex flex-col'>
                {/* Header */}
                <div className='sticky top-0 z-10 flex px-5 py-3 bg-sidebar/40 backdrop-blur supports-backdrop-filter:bg-sidebar/40 justify-between items-center mb-6 border-b border-primary-border'>
                  {isBreadcrumbs ? (
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem className='text-lg font-semibold'>
                          {breadcrumbTitle}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage className='text-lg font-semibold text-foreground'>
                            {title}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  ) : (
                    <h2 className='text-lg font-semibold text-foreground'>
                      {title}
                    </h2>
                  )}
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={onClose}
                    className=''
                    aria-label='Close dialog'
                  >
                    <X />
                  </Button>
                </div>

                {/* Main Content */}
                <div className='flex-1'>{children}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
};

// Dialog Footer component
interface DialogFooterProps {
  children: React.ReactNode;
}

const DialogFooter = ({ children }: DialogFooterProps) => {
  return (
    <div className='flex justify-end gap-3 p-4 mt-auto border-t border-primary-border bg-background sticky bottom-0 z-10'>
      {children}
    </div>
  );
};

Dialog.Footer = DialogFooter;

export default Dialog;
