"use client";

import Input from "@/src/shared/ui/Input/ui-input";
import styles from "@/src/pages/home/index.module.css";
import { Checkbox, UiButton } from "@/src/shared/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import DescriptionField from "@/src/shared/ui/DescriptionField/DescriptionField";
import { Form } from "@/src/shared/ui/DescriptionField/form";

/**
 * @page Home
 */

interface HomeFormData {
  title: string;
  description: string;
  isActive: boolean;
}

const HomePage = () => {
  const [isChecked, setIsChecked] = useState(false);

  const form = useForm<HomeFormData>({
    defaultValues: {
      title: "",
      description: "",
      isActive: false,
    },
  });

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    form.setValue("isActive", !isChecked);
  };

  const onSubmit = (data: HomeFormData) => {
    console.log("Form data:", data);
    // Add save logic here
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Home Page Settings</h1>
          <p>Configure home page metadata and configuration parameters</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className={styles.formGroup}>
              <label>Title</label>
              <Input
                className={styles.input}
                type="text"
                theme="secondary"
                icon="right"
                placeholder="Enter page title"
                {...form.register("title")}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <DescriptionField
                form={form}
                name="description"
                label=""
                placeholder="Enter description in Markdown..."
              />
            </div>

            <div className={styles.checkboxContainer}>
              <Checkbox checked={isChecked} onChange={handleCheckboxChange} />
              <span className={styles.checkboxLabel} onClick={handleCheckboxChange}>
                Is Active Page
              </span>
            </div>

            <div className={styles.actions}>
              <UiButton type="submit" theme="primary">
                Save Settings
              </UiButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default HomePage;
