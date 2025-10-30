/**
 * @page Public Posts List
 */

'use client'
import React, { useState, useEffect } from "react";
import { Search, Calendar, User, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/src/shared/ui/Button/ui-button";
import Input from "@/src/shared/ui/Input/ui-input";
import PublicHeader from "@/src/widgets/public-header/PublicHeader";
import { getPublicPosts, searchPublicPosts } from "@/src/shared/api/public-posts";
import { PostsPaginationResponse } from "@/src/shared/types/posts";
import { API } from "@/src/shared/api/constants";
import styles from "./page.module.css";

const PostsPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<PostsPaginationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPublicPosts(currentPage, itemsPerPage);
      setPosts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки постов");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPosts();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await searchPublicPosts(searchQuery, currentPage, itemsPerPage);
      setPosts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка поиска постов");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Заголовок */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Блог</h1>
          <p className={styles.subtitle}>Интересные статьи и новости</p>
        </div>
      </header>

      {/* Поиск */}
      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Input
            theme="secondary"
            icon="left"
            placeholder="Поиск по статьям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button theme="secondary" onClick={handleSearch} className={styles.searchButton}>
            <Search size={16} />
            Поиск
          </Button>
        </div>
      </section>

      {/* Ошибка */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Список постов */}
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка постов...</p>
          </div>
        ) : posts && posts.rows.length > 0 ? (
          <div className={styles.postsGrid}>
            {posts.rows.map((post) => (
              <article key={post.id} className={styles.postCard} onClick={() => handlePostClick(post.id)}>
                <div className={styles.postImage}>
                  {post.image?.miniature?.filepath ? (
                    <img 
                      src={`${API}${post.image.miniature.filepath}`} 
                      alt={post.title}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <Eye size={32} />
                    </div>
                  )}
                </div>
                <div className={styles.postContent}>
                  <div className={styles.postMeta}>
                    <span className={styles.category}>{post.category.name}</span>
                    <span className={styles.date}>
                      <Calendar size={14} />
                      {formatDate(post.updatedAt)}
                    </span>
                  </div>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <div className={styles.postAuthor}>
                    <User size={14} />
                    <span>{post.user.name}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>Посты не найдены</h3>
            <p>Попробуйте изменить поисковый запрос или вернитесь позже</p>
          </div>
        )}
      </main>

      {/* Пагинация */}
      {posts && posts.total_pages > 1 && (
        <nav className={styles.pagination}>
          <Button
            theme="third"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </Button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, posts.total_pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  theme={currentPage === page ? "secondary" : "third"}
                  onClick={() => setCurrentPage(page)}
                  className={styles.pageButton}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            theme="third"
            onClick={() => setCurrentPage(prev => Math.min(posts.total_pages, prev + 1))}
            disabled={currentPage === posts.total_pages}
          >
            Вперед →
          </Button>
        </nav>
      )}
    </div>
  );
};

export default PostsPage;
