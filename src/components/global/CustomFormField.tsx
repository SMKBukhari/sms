"use client";
import {
  Control,
  FieldValues,
  FieldPath,
  FieldPathValue,
  FieldError,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Eye, EyeOff, Minus, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { FormFieldType } from "@/lib/enums";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RadioGroup } from "../ui/radio-group";

// Types for date picker configurations
interface DatePickerConfig {
  placeholder?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: Date[];
}

interface DateRangePickerConfig extends DatePickerConfig {
  rangePlaceholder?: string;
}

interface CustomFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  isRequired?: boolean;
  placeholder?: string;
  currency?: string;
  iconSrc?: string;
  icon?: React.ElementType;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkelton?: (field: any) => React.ReactNode;
  renderCustomInput?: (field: any) => React.ReactNode;
  fieldType?: FormFieldType;
  isForgotPassword?: boolean;
  onChange?: (value: FieldPathValue<T, FieldPath<T>>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: {
    value: string;
    label: string;
    color?: string;
    disabled?: boolean;
  }[];
  className?: string;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;

  // Date picker specific props
  datePickerConfig?: DatePickerConfig | DateRangePickerConfig;
  numberOfMonths?: number;
  captionLayout?: "dropdown" | "buttons" | "dropdown-buttons" | "label";
}

interface RenderInputProps<T extends FieldValues> {
  field: {
    value: FieldPathValue<T, FieldPath<T>>;
    onChange: (value: FieldPathValue<T, FieldPath<T>>) => void;
    onBlur: () => void;
  };
  props: CustomFormFieldProps<T>;
  error?: FieldError;
}

// Utility functions for date formatting
const formatDate = (d?: Date | null | string, format?: string): string => {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return "";

  if (format === "yyyy-mm-dd") {
    return dateObj.toISOString().split("T")[0];
  }
  return dateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatDateTime = (d?: Date | null | string): string => {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRange = (
  from?: Date | null,
  to?: Date | null,
  config?: DateRangePickerConfig,
): string => {
  if (!from && !to) return "";
  const format = config?.dateFormat;
  if (from && !to) return `${formatDate(from, format)} →`;
  if (!from && to) return `→ ${formatDate(to, format)}`;
  return `${formatDate(from, format)} → ${formatDate(to, format)}`;
};

const RenderInput = <T extends FieldValues>({
  field,
  props,
  error,
}: RenderInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    field.onBlur();
    if (props.onBlur) props.onBlur();
  };
  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    field.onBlur();
  };

  const handleChange = (value: FieldPathValue<T, FieldPath<T>>) => {
    field.onChange(value);
    if (props.onChange) {
      props.onChange(value);
    }
  };

  // Helper to render the Lucide icon with dynamic class
  const renderIcon = () => {
    if (!props.icon) return null;
    const IconComponent = props.icon;
    return (
      <div className='flex items-center justify-center ml-2.5 '>
        <IconComponent
          className={cn(
            "h-4 w-4 transition-colors ",
            error
              ? "text-red-500"
              : isFocused
                ? "text-primary"
                : "text-muted-foreground",
          )}
        />
      </div>
    );
  };

  // Common calendar props
  const getCalendarProps = () => ({
    className: "rounded-lg",
    captionLayout: props.captionLayout as any,
    numberOfMonths: props.numberOfMonths,
  });

  // Shake animation configuration
  const shakeAnimation = {
    x: [0, -6, 6, -6, 6, 0], // Adjusted to be slightly more subtle but visible
    transition: { duration: 0.4 },
  };

  // Border Color Logic
  const getBorderClass = () => {
    if (error) return "border-red-500";
    if (isFocused) return "border-primary";
    return "border-primary-border";
  };

  if (props.renderCustomInput) {
    return props.renderCustomInput(field);
  }

  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <motion.div
          animate={error ? shakeAnimation : {}}
          className={cn(
            "flex rounded-lg border transition-all items-center bg-sidebar/50!",
            getBorderClass(),
          )}
        >
          {props.iconSrc && (
            <Image
              src={props.iconSrc}
              width={24}
              height={24}
              alt={props.iconAlt || "icon"}
              className='ml-2'
            />
          )}
          {renderIcon()}
          <FormControl>
            <Input
              placeholder={props.placeholder}
              value={field.value as string}
              onChange={(e) =>
                handleChange(e.target.value as FieldPathValue<T, FieldPath<T>>)
              }
              onFocus={handleFocus}
              onBlur={handleBlur}
              defaultValue={props.defaultValue}
              className='shad-input border-none'
            />
          </FormControl>
        </motion.div>
      );

    case FormFieldType.PASSWORD_INPUT:
      return (
        <motion.div
          animate={error ? shakeAnimation : {}}
          className={cn(
            "flex relative rounded-lg border transition-all items-center bg-sidebar/50!",
            getBorderClass(),
          )}
        >
          {props.iconSrc && (
            <Image
              src={props.iconSrc}
              width={24}
              height={24}
              alt={props.iconAlt || "icon"}
              className='ml-2'
            />
          )}
          {renderIcon()}
          <FormControl>
            <Input
              placeholder={props.placeholder}
              type={showPassword ? "text" : "password"}
              value={field.value as string}
              onChange={(e) =>
                handleChange(e.target.value as FieldPathValue<T, FieldPath<T>>)
              }
              onFocus={handleFocus}
              defaultValue={props.defaultValue}
              onBlur={handleBlur}
              className='shad-input border-none'
            />
          </FormControl>
          {showPassword ? (
            <EyeOff
              className={cn(
                "mr-2 cursor-pointer w-5 h-5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2",
                error ? "text-red-500" : isFocused ? "text-primary" : "",
              )}
              onClick={() => setShowPassword(!showPassword)}
            />
          ) : (
            <Eye
              className={cn(
                "mr-2 cursor-pointer w-5 h-5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2",
                error ? "text-red-500" : isFocused ? "text-primary" : "",
              )}
              onClick={() => setShowPassword(!showPassword)}
            />
          )}
        </motion.div>
      );
    case FormFieldType.TEXTAREA:
      return (
        <motion.div
          animate={error ? shakeAnimation : {}}
          className={cn(
            "flex rounded-lg border transition-all bg-sidebar/50",
            getBorderClass(),
          )}
        >
          {props.iconSrc && (
            <Image
              src={props.iconSrc}
              width={24}
              height={24}
              alt={props.iconAlt || "icon"}
              className='ml-2'
            />
          )}
          {renderIcon()}
          <FormControl>
            <Textarea
              placeholder={props.placeholder}
              value={field.value as string}
              onChange={(e) =>
                handleChange(e.target.value as FieldPathValue<T, FieldPath<T>>)
              }
              className='shad-textArea'
              disabled={props.disabled}
              onFocus={handleFocus}
              defaultValue={props.defaultValue}
              onBlur={handleTextareaBlur}
            />
          </FormControl>
        </motion.div>
      );
    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className='flex items-center gap-4'>
            <Checkbox
              id={props.name}
              checked={field.value as boolean}
              onCheckedChange={(checked) => {
                handleChange(checked as FieldPathValue<T, FieldPath<T>>);
              }}
              className={cn("checkbox", error && "border-red-500")}
            />
            <Label
              htmlFor={props.name}
              className={cn("checkbox-label", error && "text-red-500")}
            >
              {props.label}
            </Label>
          </div>
        </FormControl>
      );
    case FormFieldType.DATE_PICKER: {
      const current = field.value as unknown as Date | null | undefined;
      const config = props.datePickerConfig as DatePickerConfig;

      return (
        <motion.div
          animate={error ? shakeAnimation : {}}
          className='flex items-center gap-2 bg-sidebar/50!'
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  "w-full justify-start text-left font-normal rounded-lg border bg-sidebar/20 hover:bg-transparent h-11",
                  getBorderClass(),
                  !current && "text-muted-foreground",
                )}
                disabled={props.disabled}
              >
                <CalendarIcon
                  className={cn("mr-2 h-4 w-4", error && "text-red-500")}
                />
                <span className='truncate'>
                  {current
                    ? config?.showTimeSelect
                      ? formatDateTime(current)
                      : formatDate(current, config?.dateFormat)
                    : (config?.placeholder ??
                      props.placeholder ??
                      "Select date")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto p-2 z-9999999999999'
              align='start'
            >
              <Calendar
                {...getCalendarProps()}
                mode='single'
                selected={current ?? undefined}
                onSelect={(date: Date | undefined) => {
                  handleChange(
                    (date ?? null) as FieldPathValue<T, FieldPath<T>>,
                  );
                }}
                fromYear={1900}
                toYear={2100}
                captionLayout='dropdown'
                initialFocus
                disabled={config?.disabledDays}
              />
            </PopoverContent>
          </Popover>
        </motion.div>
      );
    }

    case FormFieldType.DATE_RANGE_PICKER: {
      const val = field.value as unknown as
        | { from?: Date | null; to?: Date | null }
        | null
        | undefined;

      const config = props.datePickerConfig as DateRangePickerConfig;
      const from = val?.from ?? null;
      const to = val?.to ?? null;

      return (
        <motion.div
          animate={error ? shakeAnimation : {}}
          className='flex items-center gap-2 bg-sidebar/50!'
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  "w-full justify-between text-left font-normal rounded-lg border bg-sidebar/20 hover:bg-transparent h-11",
                  getBorderClass(),
                  !from && !to && "text-muted-foreground",
                )}
                disabled={props.disabled}
              >
                <span className='truncate md:text-base text-sm'>
                  {from || to
                    ? formatRange(from ?? undefined, to ?? undefined, config)
                    : (config?.rangePlaceholder ??
                      config?.placeholder ??
                      props.placeholder ??
                      "Select date range")}
                </span>
                <CalendarIcon
                  className={cn("mr-2 h-4 w-4", error && "text-red-500")}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto p-2 z-9999999999999'
              align='start'
            >
              <Calendar
                {...getCalendarProps()}
                mode='range'
                selected={
                  from || to
                    ? { from: from ?? undefined, to: to ?? undefined }
                    : undefined
                }
                onSelect={(range: any) => {
                  const next = range ?? { from: null, to: null };
                  handleChange(next as FieldPathValue<T, FieldPath<T>>);
                }}
                initialFocus
                disabled={config?.disabledDays}
              />
            </PopoverContent>
          </Popover>
        </motion.div>
      );
    }
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <motion.div animate={error ? shakeAnimation : {}}>
            <Select
              value={field.value as string}
              onValueChange={handleChange}
              disabled={props.disabled}
            >
              <SelectTrigger
                className={cn(
                  "rounded-lg border w-full h-10! bg-sidebar/50!",
                  getBorderClass(),
                )}
              >
                <SelectValue
                  placeholder={props.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent className='z-9999999999999 w-full'>
                {props.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <motion.div
                      className='flex items-center text-xs gap-1.5 capitalize rounded-md px-2 py-0.5'
                      style={{
                        backgroundColor: option.color
                          ? `${option.color}15`
                          : "#6b728020",
                      }}
                    >
                      <motion.span
                        className='h-1.5 w-1.5 rounded-full'
                        style={{
                          backgroundColor: option.color || "#6b7280",
                        }}
                      />
                      <motion.span style={{ color: option.color || "#000000" }}>
                        {option.label}
                      </motion.span>
                    </motion.div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </FormControl>
      );
    case FormFieldType.RADIO_GROUP: {
      const current = (field.value as string) ?? "";

      return (
        <motion.div animate={error ? shakeAnimation : {}}>
          <FormControl>
            <RadioGroup
              value={current}
              onValueChange={(val) =>
                handleChange(val as FieldPathValue<T, FieldPath<T>>)
              }
              className='flex flex-wrap gap-3'
            >
              {props.options?.map((opt) => {
                const active = current === opt.value;

                return (
                  <motion.button
                    key={opt.value}
                    type='button'
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                    onClick={() => {
                      if (opt.disabled) return;
                      handleChange(
                        opt.value as FieldPathValue<T, FieldPath<T>>,
                      );
                    }}
                    className={cn(
                      "flex-1",
                      "flex items-center justify-between gap-4",
                      "rounded-lg px-5 py-4",
                      "transition-all duration-200",
                      "border cursor-pointer",
                      active
                        ? "bg-primary/10 border-primary"
                        : "border-primary-border hover:border-primary bg-sidebar/50!",
                      error && !active ? "border-primary-danger/40" : "",
                      opt.disabled && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {opt.label}
                    </span>

                    {/* Right-side circle indicator (like screenshot) */}
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center border",
                        active
                          ? "border-primary"
                          : "border-muted-foreground/30",
                        error && !active ? "border-primary-danger" : "",
                      )}
                    >
                      <span
                        className={cn(
                          "h-3 w-3 rounded-full transition-transform",
                          active ? "bg-primary scale-100" : "scale-0",
                        )}
                      />
                    </span>
                  </motion.button>
                );
              })}
            </RadioGroup>
          </FormControl>
        </motion.div>
      );
    }

    case FormFieldType.SKELETON:
      return props.renderSkelton ? props.renderSkelton(field) : null;
    default:
      return null;
  }
};

const CustomFormField = <T extends FieldValues>(
  props: CustomFormFieldProps<T>,
) => {
  const { control, name, label } = props;

  return (
    <FormField
      control={control}
      name={name}
      // Access fieldState here to get the error
      render={({ field, fieldState }) => (
        <FormItem className='flex-1'>
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel
              className={cn(
                "shad-input-label",
                fieldState.error && "text-red-500",
              )}
            >
              {label}
              {props.isRequired && <span className='text-red-500'>*</span>}
            </FormLabel>
          )}

          {/* Pass the error object to RenderInput */}
          <RenderInput field={field} props={props} error={fieldState.error} />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
