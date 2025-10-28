/**
 * @page Home
 */

'use client'
import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Users, Zap, Shield } from "lucide-react";
import Button from "@/src/shared/ui/Button/ui-button";
import PublicHeader from "@/src/widgets/public-header/PublicHeader";
import styles from "./page.module.css";

const HomePage = () => {
  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Герой секция */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Добро пожаловать в <span className={styles.highlight}>TypeWord CMS</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Современная система управления контентом для создания и публикации статей, 
            блогов и новостей с удобным интерфейсом и мощными возможностями.
          </p>
          <div className={styles.heroActions}>
            <Link href="/posts">
              <Button theme="primary" className={styles.ctaButton}>
                <BookOpen size={20} />
                Читать блог
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/admin">
              <Button theme="secondary" className={styles.secondaryButton}>
                Админ панель
              </Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.imagePlaceholder}>
            <BookOpen size={80} />
          </div>
        </div>
      </section>

      {/* Особенности */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.featuresTitle}>Возможности системы</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <BookOpen size={32} />
              </div>
              <h3 className={styles.featureTitle}>Управление контентом</h3>
              <p className={styles.featureDescription}>
                Создавайте, редактируйте и публикуйте статьи с богатым текстовым редактором
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Users size={32} />
              </div>
              <h3 className={styles.featureTitle}>Многопользовательская система</h3>
              <p className={styles.featureDescription}>
                Управляйте пользователями и их правами доступа к различным функциям
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Zap size={32} />
              </div>
              <h3 className={styles.featureTitle}>SEO оптимизация</h3>
              <p className={styles.featureDescription}>
                Встроенные инструменты для оптимизации контента под поисковые системы
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Shield size={32} />
              </div>
              <h3 className={styles.featureTitle}>Безопасность</h3>
              <p className={styles.featureDescription}>
                Надежная система аутентификации и авторизации для защиты ваших данных
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Готовы начать?</h2>
          <p className={styles.ctaSubtitle}>
            Создайте свой первый пост или изучите существующие статьи
          </p>
          <div className={styles.ctaActions}>
            <Link href="/posts">
              <Button theme="primary" size="large">
                <BookOpen size={20} />
                Перейти к блогу
              </Button>
            </Link>
            <Link href="/admin">
              <Button theme="secondary" size="large">
                Открыть админ панель
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <BookOpen size={24} />
              <span>TypeWord CMS</span>
            </div>
            <p className={styles.footerText}>
              © 2024 TypeWord CMS. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
