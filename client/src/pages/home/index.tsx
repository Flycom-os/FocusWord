'use client'
import Input from "@/src/shared/ui/Input/ui-input";
import styles from "@/src/pages/home/index.module.css";
import { Checkbox } from "@/src/shared/ui";
import Search from "@/src/widgets/search";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/src/shared/ui/Button/ui-button";
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
      title: '',
      description: '',
      isActive: false,
    },
  });

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    form.setValue('isActive', !isChecked);
    console.log(!isChecked);
  };

  const onSubmit = (data: HomeFormData) => {
    console.log('Form data:', data);
    // Здесь можно добавить логику сохранения данных
  };

  return (
    <div className={styles.container}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Input
          className={styles.input}
          type="text"
          theme="secondary"
          icon="right"
          placeholder="Primary Input"
          {...form.register('title')}
        />
        
        <DescriptionField
          form={form}
          name="description"
          label="Description"
          placeholder="Enter description in Markdown..."
        />
        
        <Checkbox checked={isChecked} onChange={handleCheckboxChange} />
        
        <Button type="submit" theme="primary" className="mt-4">
          Save
        </Button>
      </form>
      </Form>
    </div>
  );
};
//TODO: fix page, wiki, get pages
//TODO: fix admin: mediafiles, sliders, pages, records, category records, roles, users
//TODO: roles: fix in server initialization, dix in front access, fix methods, and add roles in admin

export default HomePage;
