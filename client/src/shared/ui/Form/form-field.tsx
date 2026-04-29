'use client';

import React from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import styles from './form.module.css';

interface FormFieldProps<T extends FieldValues> {
  control: UseFormReturn<T>['control'];
  name: FieldPath<T>;
  render: (field: { field: any }) => React.ReactNode;
  children?: React.ReactNode;
}

export function FormField<T extends FieldValues>({ 
  control, 
  name, 
  render, 
  children 
}: FormFieldProps<T>) {
  const field = control.register(name);
  
  return (
    <div className={styles.formField}>
      {render({ field })}
      {children}
    </div>
  );
}

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export function FormItem({ children, className }: FormItemProps) {
  return (
    <div className={`${styles.formItem} ${className || ''}`}>
      {children}
    </div>
  );
}

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function FormLabel({ children, className }: FormLabelProps) {
  return (
    <label className={`${styles.formLabel} ${className || ''}`}>
      {children}
    </label>
  );
}

interface FormControlProps {
  children: React.ReactNode;
}

export function FormControl({ children }: FormControlProps) {
  return (
    <div className={styles.formControl}>
      {children}
    </div>
  );
}
