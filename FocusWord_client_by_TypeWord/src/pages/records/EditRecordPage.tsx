/**
 * @page EditRecord
 */

'use client'
import React, { useState, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link, 
  Code, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  Image,
  Trash2,
  Eye,
  Save
} from "lucide-react";
import Button from "@/src/shared/ui/Button/ui-button";
import Input from "@/src/shared/ui/Input/ui-input";
import styles from "./EditRecordPage.module.css";

interface Record {
  id?: number;
  title: string;
  content: string;
  status: "draft" | "published";
  visibility: "public" | "private";
  publishDate: string;
  template: string;
  categories: string[];
  thumbnail?: string;
}

const categories = [
  "Без категории",
  "Блюда", 
  "Автомобили",
  "Обучение"
];

const EditRecordPage = () => {
  const [record, setRecord] = useState<Record>({
    title: "",
    content: "",
    status: "draft",
    visibility: "public",
    publishDate: "Сейчас",
    template: "Запись",
    categories: ["Без категории"],
    thumbnail: undefined
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecord(prev => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    setRecord(prev => ({ ...prev, content: e.target.innerHTML }));
  };

  const handleCategoryToggle = (category: string) => {
    setRecord(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRecord(prev => ({ ...prev, thumbnail: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Сохранение записи:", record);
    // Здесь будет логика сохранения
  };

  const handlePublish = () => {
    setRecord(prev => ({ ...prev, status: "published" }));
    console.log("Публикация записи:", record);
    // Здесь будет логика публикации
  };

  const handleDelete = () => {
    if (window.confirm("Вы уверены, что хотите удалить эту запись?")) {
      console.log("Удаление записи");
      // Здесь будет логика удаления
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Функции форматирования текста
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Введите URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Введите URL изображения:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Добавить новую</h1>
          <p className={styles.subtitle}>Записи/Добавить новую</p>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Основной контент */}
        <div className={styles.editorSection}>
          <div className={styles.editorHeader}>
            <h2 className={styles.sectionTitle}>Новая запись</h2>
          </div>

          {/* Панель инструментов */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
              <select className={styles.formatSelect}>
                <option>Normal text</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
                <option>Heading 3</option>
              </select>
            </div>

            <div className={styles.toolbarGroup}>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("bold")}
                title="Жирный"
              >
                <Bold size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("italic")}
                title="Курсив"
              >
                <Italic size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("underline")}
                title="Подчеркнутый"
              >
                <Underline size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("strikeThrough")}
                title="Зачеркнутый"
              >
                <Strikethrough size={16} />
              </button>
            </div>

            <div className={styles.toolbarGroup}>
              <button 
                className={styles.toolbarButton}
                onClick={insertLink}
                title="Ссылка"
              >
                <Link size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("insertCode")}
                title="Код"
              >
                <Code size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("formatBlock", "blockquote")}
                title="Цитата"
              >
                <Quote size={16} />
              </button>
            </div>

            <div className={styles.toolbarGroup}>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("justifyLeft")}
                title="Выровнять по левому краю"
              >
                <AlignLeft size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("justifyCenter")}
                title="Выровнять по центру"
              >
                <AlignCenter size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("justifyRight")}
                title="Выровнять по правому краю"
              >
                <AlignRight size={16} />
              </button>
            </div>

            <div className={styles.toolbarGroup}>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("insertUnorderedList")}
                title="Маркированный список"
              >
                <List size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={() => execCommand("insertOrderedList")}
                title="Нумерованный список"
              >
                <ListOrdered size={16} />
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={insertImage}
                title="Изображение"
              >
                <Image size={16} />
              </button>
            </div>
          </div>

          {/* Область редактирования */}
          <div className={styles.editorContainer}>
            <div
              ref={editorRef}
              className={styles.editor}
              contentEditable
              onInput={handleContentChange}
              dangerouslySetInnerHTML={{
                __html: record.content || `
                  <h1>Heading1</h1>
                  <h2>Heading2</h2>
                  <h3>Heading3</h3>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  <p><a href="#">Link text reuse anchor component</a></p>
                  <ul>
                    <li>List item 1</li>
                    <li>List item 2</li>
                    <li>List item 3</li>
                  </ul>
                  <ol>
                    <li>Numbered item 1</li>
                    <li>Numbered item 2</li>
                    <li>Numbered item 3</li>
                  </ol>
                  <pre><code>Code block example</code></pre>
                `
              }}
            />
          </div>
        </div>

        {/* Боковая панель */}
        <div className={styles.sidebar}>
          {/* Опубликовать */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Опубликовать</h3>
            <div className={styles.sidebarContent}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Текущий статус</label>
                <div className={styles.statusBadge}>
                  {record.status === "published" ? "Опубликовано" : "Черновик"}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Видимость</label>
                <select 
                  className={styles.select}
                  value={record.visibility}
                  onChange={(e) => setRecord(prev => ({ ...prev, visibility: e.target.value as "public" | "private" }))}
                >
                  <option value="public">Открыто</option>
                  <option value="private">Закрыто</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Опубликовать</label>
                <select 
                  className={styles.select}
                  value={record.publishDate}
                  onChange={(e) => setRecord(prev => ({ ...prev, publishDate: e.target.value }))}
                >
                  <option value="Сейчас">Сейчас</option>
                  <option value="Запланировать">Запланировать</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Шаблон</label>
                <select 
                  className={styles.select}
                  value={record.template}
                  onChange={(e) => setRecord(prev => ({ ...prev, template: e.target.value }))}
                >
                  <option value="Запись">Запись</option>
                  <option value="Страница">Страница</option>
                </select>
              </div>

              <div className={styles.actionButtons}>
                <Button theme="warning" onClick={handleDelete}>
                  <Trash2 size={16} />
                  Удалить
                </Button>
                <Button theme="third" onClick={handlePreview}>
                  <Eye size={16} />
                  Просмотреть
                </Button>
                <Button theme="secondary" onClick={handlePublish}>
                  <Save size={16} />
                  Опубликовать
                </Button>
              </div>
            </div>
          </div>

          {/* Категория */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Категория</h3>
            <div className={styles.sidebarContent}>
              <div className={styles.categoriesList}>
                {categories.map((category) => (
                  <label key={category} className={styles.categoryItem}>
                    <input
                      type="checkbox"
                      checked={record.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Миниатюра */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Миниатюра</h3>
            <div className={styles.sidebarContent}>
              <div className={styles.thumbnailContainer}>
                {record.thumbnail ? (
                  <img src={record.thumbnail} alt="Thumbnail" className={styles.thumbnail} />
                ) : (
                  <div className={styles.thumbnailPlaceholder}>
                    Отсутствует
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className={styles.fileInput}
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className={styles.uploadButton}>
                  Загрузить изображение
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRecordPage;
