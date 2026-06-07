"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Activity, Calendar, RefreshCw } from "lucide-react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { fetchAnalyticsStats, fetchAnalytics } from "@/src/shared/api/analytics";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import styles from "./analytics.module.css";

interface StatsData {
  totalViews: number;
  uniqueViews: number;
  avgBounceRate: number;
  avgTimeOnPage: number;
  topPages: Array<{
    id: number;
    title: string;
    views: number;
  }>;
  topReferrers: Array<{
    url: string;
    count: number;
  }>;
}

const AnalyticsPage = () => {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalViews: 0,
    uniqueViews: 0,
    avgBounceRate: 0,
    avgTimeOnPage: 0,
    topPages: [],
    topReferrers: [],
  });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date filter
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, entriesData] = await Promise.all([
        fetchAnalyticsStats(accessToken, { startDate, endDate }),
        fetchAnalytics(accessToken, { limit: 10, startDate, endDate }),
      ]);
      setStats(statsData);
      setRecentEntries(entriesData.data || []);
    } catch (error) {
      console.error(error);
      showToast("Ошибка при загрузке аналитики", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken, startDate, endDate]);

  const cards = [
    {
      title: "Всего просмотров",
      value: stats.totalViews.toLocaleString(),
      change: "Всего визитов",
      icon: <Activity size={24} />,
      color: "#3b82f6",
    },
    {
      title: "Уникальные посетители",
      value: stats.uniqueViews.toLocaleString(),
      change: "По кукам за 24ч",
      icon: <Users size={24} />,
      color: "#10b981",
    },
    {
      title: "Показатель отказов",
      value: `${stats.avgBounceRate}%`,
      change: "Ушли сразу",
      icon: <TrendingUp size={24} />,
      color: "#ef4444",
    },
    {
      title: "Время на сайте (среднее)",
      value: `${Math.round(stats.avgTimeOnPage)} сек`,
      change: "Вовлеченность",
      icon: <TrendingUp size={24} />,
      color: "#f59e0b",
    },
  ];

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <div>
          <h1>Аналитика посещаемости</h1>
          <p>Реальные данные о популярности вашего контента</p>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.datePicker}>
            <Calendar size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
            <span>по</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <button onClick={loadData} className={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={18} className={loading ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка данных...</p>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {cards.map((card, index) => (
              <div key={index} className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: `${card.color}20`, color: card.color }}
                >
                  {card.icon}
                </div>
                <div className={styles.statContent}>
                  <h3>{card.title}</h3>
                  <p className={styles.statValue}>{card.value}</p>
                  <span className={styles.statChange} style={{ color: card.color }}>
                    {card.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.chartsSection}>
            <div className={styles.chartCard}>
              <h2>Популярные страницы</h2>
              {stats.topPages.length === 0 ? (
                <div className={styles.emptyState}>Нет данных о просмотрах</div>
              ) : (
                <div className={styles.simpleChart}>
                  {stats.topPages.map((data, index) => {
                    const maxViews = Math.max(...stats.topPages.map((p) => p.views), 1);
                    return (
                      <div key={index} className={styles.chartBar}>
                        <div
                          className={styles.bar}
                          style={{ height: `${(data.views / maxViews) * 80 + 20}%` }}
                          title={`${data.title}: ${data.views} просмотров`}
                        />
                        <span className={styles.barLabel}>{data.title.substring(0, 10)}...</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.chartCard}>
              <h2>Источники переходов (Referrers)</h2>
              <div className={styles.activityList}>
                {stats.topReferrers.length === 0 ? (
                  <div className={styles.emptyState}>Прямые переходы или нет данных</div>
                ) : (
                  stats.topReferrers.map((ref, index) => (
                    <div key={index} className={styles.activityItem}>
                      <Activity size={16} />
                      <span className={styles.refUrl}>{ref.url || "Прямой переход"}</span>
                      <span className={styles.activityTime}>{ref.count} кликов</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className={styles.tableSection}>
            <h2>Последние просмотры по датам</h2>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>Дата</span>
                <span>Страница / Пост</span>
                <span>Просмотры</span>
                <span>Уникальные</span>
              </div>
              {recentEntries.length === 0 ? (
                <div className={styles.emptyRow}>Нет данных за выбранный период</div>
              ) : (
                recentEntries.map((entry, index) => {
                  const title = entry.page?.title || entry.post?.title || entry.record?.title || entry.blogPost?.title || entry.article?.title || "Главная";
                  return (
                    <div key={index} className={styles.tableRow}>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span>{title}</span>
                      <span>{entry.totalViews}</span>
                      <span>{entry.uniqueViews}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
