/**
 * @page Public Post Detail
 */

'use client'
import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, User, Eye, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Button from "@/src/shared/ui/Button/ui-button";
import PublicHeader from "@/src/widgets/public-header/PublicHeader";
import { getPublicPostById } from "@/src/shared/api/public-posts";
import { Post } from "@/src/shared/types/posts";
import { API } from "@/src/shared/api/constants";
import styles from "./page.module.css";

const PostDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost(parseInt(postId));
    }
  }, [postId]);

  const loadPost = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPublicPostById(id);
      setPost(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки поста");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/posts');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} мин чтения`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка поста...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <Button theme="secondary" onClick={handleBack}>
            <ArrowLeft size={16} />
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Пост не найден</h2>
          <p>Запрашиваемый пост не существует или был удален</p>
          <Button theme="secondary" onClick={handleBack}>
            <ArrowLeft size={16} />
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Кнопка назад */}
      <div className={styles.backButton}>
        <Button theme="third" onClick={handleBack}>
          <ArrowLeft size={16} />
          Назад к списку
        </Button>
      </div>

      {/* Заголовок поста */}
      <header className={styles.postHeader}>
        <div className={styles.postMeta}>
          <span className={styles.category}>{post.category.name}</span>
          <span className={styles.date}>
            <Calendar size={16} />
            {formatDate(post.updatedAt)}
          </span>
          <span className={styles.readingTime}>
            <Clock size={16} />
            {getReadingTime(post.text)}
          </span>
        </div>
        <h1 className={styles.postTitle}>{post.title}</h1>
        {post.announcement && (
          <p className={styles.postAnnouncement}>{post.announcement}</p>
        )}
        <div className={styles.postAuthor}>
          <User size={16} />
          <span>Автор: {post.user.name}</span>
        </div>
      </header>

      {/* Изображение поста */}
      {post.image && (
        <div className={styles.postImageContainer}>
          <img 
            src={`${API}${post.image.filepath}`} 
            alt={post.title}
            className={styles.postImage}
          />
        </div>
      )}

      {/* Содержимое поста */}
      <main className={styles.postContent}>
        <div 
          className={styles.postText}
          dangerouslySetInnerHTML={{ __html: post.text }}
        />
      </main>

      {/* SEO информация */}
      {post.seo && (
        <aside className={styles.seoInfo}>
          <h3>Дополнительная информация</h3>
          {post.seo.seo_description && (
            <p className={styles.seoDescription}>{post.seo.seo_description}</p>
          )}
          {post.seo.seo_keywords && post.seo.seo_keywords.length > 0 && (
            <div className={styles.seoKeywords}>
              <strong>Ключевые слова:</strong>
              <div className={styles.keywordsList}>
                {post.seo.seo_keywords.map((keyword, index) => (
                  <span key={index} className={styles.keyword}>{keyword}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Навигация */}
      <nav className={styles.postNavigation}>
        <Button theme="secondary" onClick={handleBack}>
          <ArrowLeft size={16} />
          Все статьи
        </Button>
      </nav>
    </div>
  );
};

export default PostDetailPage;
