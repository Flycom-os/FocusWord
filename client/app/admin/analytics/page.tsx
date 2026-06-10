"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Activity, Calendar, RefreshCw, Download } from "lucide-react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { fetchAnalyticsStats, fetchAnalytics } from "@/src/shared/api/analytics";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date filter
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'all' | 'pages' | 'articles' | 'records' | 'blog'>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await fetchAnalyticsStats(accessToken, { startDate, endDate });
      
      // Fetch all to allow proper export and filtering, limit 10000 to get 'absolutely all values'
      const entriesData = await fetchAnalytics(accessToken, { limit: 10000, startDate, endDate });
      
      setStats(statsData);
      setAllEntries(entriesData.data || []);
    } catch (error) {
      console.error(error);
      showToast("Error loading analytics", "error");
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
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      change: "Total visits",
      icon: <Activity size={24} />,
      color: "#3b82f6",
    },
    {
      title: "Unique Visitors",
      value: stats.uniqueViews.toLocaleString(),
      change: "By cookies",
      icon: <Users size={24} />,
      color: "#10b981",
    },
    {
      title: "Bounce Rate",
      value: `${stats.avgBounceRate}%`,
      change: "Left immediately",
      icon: <TrendingUp size={24} />,
      color: "#ef4444",
    },
    {
      title: "Time on Site (Average)",
      value: `${Math.round(stats.avgTimeOnPage)} sec`,
      change: "Engagement",
      icon: <TrendingUp size={24} />,
      color: "#f59e0b",
    },
  ];

  // Filtering based on active tab
  const getFilteredEntries = () => {
    if (activeTab === 'all') return allEntries;
    if (activeTab === 'pages') return allEntries.filter(e => e.pageId);
    if (activeTab === 'articles') return allEntries.filter(e => e.articleId);
    if (activeTab === 'records') return allEntries.filter(e => e.postId); // assuming postId is used for records/posts
    if (activeTab === 'blog') return allEntries.filter(e => e.blogPostId);
    return allEntries;
  };

  const filteredEntries = getFilteredEntries();

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredEntries.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Title: e.page?.title || e.post?.title || e.record?.title || e.blogPost?.title || e.article?.title || "Home",
      TotalViews: e.totalViews,
      UniqueViews: e.uniqueViews,
      BounceRate: e.bounceRate || 0,
      AvgTimeOnPage: e.avgTimeOnPage || 0,
      Type: e.pageId ? 'Page' : e.articleId ? 'Article' : e.postId ? 'Record' : e.blogPostId ? 'Blog' : 'General'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");
    XLSX.writeFile(wb, `analytics_${activeTab}_${startDate}_to_${endDate}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Analytics (${activeTab}) - ${startDate} to ${endDate}`, 14, 15);
    
    const tableColumn = ["Date", "Title", "Type", "Views", "Unique", "Bounce (%)", "Time (s)"];
    const tableRows = filteredEntries.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.page?.title || e.post?.title || e.record?.title || e.blogPost?.title || e.article?.title || "Home",
      e.pageId ? 'Page' : e.articleId ? 'Article' : e.postId ? 'Record' : e.blogPostId ? 'Blog' : 'General',
      e.totalViews,
      e.uniqueViews,
      e.bounceRate || 0,
      e.avgTimeOnPage || 0
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`analytics_${activeTab}_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <div>
          <h1>Traffic Analytics</h1>
          <p>Real data about the popularity of your content</p>
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
            <span>to</span>
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
          <p>Loading data...</p>
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
              <h2>Popular Pages</h2>
              {stats.topPages.length === 0 ? (
                <div className={styles.emptyState}>No view data</div>
              ) : (
                <div className={styles.simpleChart}>
                  {stats.topPages.map((data, index) => {
                    const maxViews = Math.max(...stats.topPages.map((p) => p.views), 1);
                    return (
                      <div key={index} className={styles.chartBar}>
                        <div
                          className={styles.bar}
                          style={{ height: `${(data.views / maxViews) * 80 + 20}%` }}
                          title={`${data.title}: ${data.views} views`}
                        />
                        <span className={styles.barLabel}>{data.title.substring(0, 10)}...</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.chartCard}>
              <h2>Referral Sources (Referrers)</h2>
              <div className={styles.activityList}>
                {stats.topReferrers.length === 0 ? (
                  <div className={styles.emptyState}>Direct traffic or no data</div>
                ) : (
                  stats.topReferrers.map((ref, index) => (
                    <div key={index} className={styles.activityItem}>
                      <Activity size={16} />
                      <span className={styles.refUrl}>{ref.url || "Direct traffic"}</span>
                      <span className={styles.activityTime}>{ref.count} clicks</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className={styles.tableSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setActiveTab('all')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: activeTab === 'all' ? '#3b82f6' : '#fff', color: activeTab === 'all' ? '#fff' : '#0f172a', fontWeight: 500, cursor: 'pointer' }}>All</button>
                <button onClick={() => setActiveTab('pages')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: activeTab === 'pages' ? '#3b82f6' : '#fff', color: activeTab === 'pages' ? '#fff' : '#0f172a', fontWeight: 500, cursor: 'pointer' }}>Pages</button>
                <button onClick={() => setActiveTab('articles')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: activeTab === 'articles' ? '#3b82f6' : '#fff', color: activeTab === 'articles' ? '#fff' : '#0f172a', fontWeight: 500, cursor: 'pointer' }}>Articles</button>
                <button onClick={() => setActiveTab('records')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: activeTab === 'records' ? '#3b82f6' : '#fff', color: activeTab === 'records' ? '#fff' : '#0f172a', fontWeight: 500, cursor: 'pointer' }}>Records</button>
                <button onClick={() => setActiveTab('blog')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: activeTab === 'blog' ? '#3b82f6' : '#fff', color: activeTab === 'blog' ? '#fff' : '#0f172a', fontWeight: 500, cursor: 'pointer' }}>Blog</button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>
                  <Download size={16} /> Excel
                </button>
                <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>
                  <Download size={16} /> PDF
                </button>
              </div>
            </div>
            
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>Date</span>
                <span>Title</span>
                <span>Type</span>
                <span>Views</span>
                <span>Unique</span>
                <span>Bounce</span>
                <span>Time (s)</span>
              </div>
              {filteredEntries.length === 0 ? (
                <div className={styles.emptyRow}>No data for the selected period in this category</div>
              ) : (
                filteredEntries.map((entry, index) => {
                  const title = entry.page?.title || entry.post?.title || entry.record?.title || entry.blogPost?.title || entry.article?.title || "Home";
                  const type = entry.pageId ? 'Page' : entry.articleId ? 'Article' : entry.postId ? 'Record' : entry.blogPostId ? 'Blog' : 'General';
                  return (
                    <div key={index} className={styles.tableRow}>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span>{title}</span>
                      <span>{type}</span>
                      <span>{entry.totalViews}</span>
                      <span>{entry.uniqueViews}</span>
                      <span>{entry.bounceRate || 0}%</span>
                      <span>{entry.avgTimeOnPage || 0}</span>
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
