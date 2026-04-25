'use client'
import React from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';
import styles from './analytics.module.css';

const AnalyticsPage = () => {
  const stats = [
    { title: 'Total Revenue', value: '$124,563', change: '+12.5%', icon: <DollarSign size={24} />, color: '#10b981' },
    { title: 'Active Users', value: '8,549', change: '+23.1%', icon: <Users size={24} />, color: '#3b82f6' },
    { title: 'Total Orders', value: '1,245', change: '+8.2%', icon: <ShoppingCart size={24} />, color: '#8b5cf6' },
    { title: 'Conversion Rate', value: '3.2%', change: '+2.1%', icon: <TrendingUp size={24} />, color: '#f59e0b' },
  ];

  const chartData = [
    { month: 'Jan', revenue: 12000, orders: 120 },
    { month: 'Feb', revenue: 15000, orders: 150 },
    { month: 'Mar', revenue: 13000, orders: 130 },
    { month: 'Apr', revenue: 17000, orders: 170 },
    { month: 'May', revenue: 19000, orders: 190 },
    { month: 'Jun', revenue: 22000, orders: 220 },
  ];

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <h1>CEO Analytics Dashboard</h1>
        <p>Overview of your business performance</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: stat.color + '20', color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <h3>{stat.title}</h3>
              <p className={styles.statValue}>{stat.value}</p>
              <span className={styles.statChange} style={{ color: stat.color }}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h2>Revenue Overview</h2>
          <div className={styles.chartPlaceholder}>
            <BarChart3 size={48} />
            <p>Revenue chart will be displayed here</p>
            <div className={styles.simpleChart}>
              {chartData.map((data, index) => (
                <div key={index} className={styles.chartBar}>
                  <div 
                    className={styles.bar} 
                    style={{ height: `${(data.revenue / 22000) * 100}%` }}
                  />
                  <span>{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2>Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <Activity size={16} />
              <span>New user registration</span>
              <span className={styles.activityTime}>2 minutes ago</span>
            </div>
            <div className={styles.activityItem}>
              <ShoppingCart size={16} />
              <span>New order #1234</span>
              <span className={styles.activityTime}>5 minutes ago</span>
            </div>
            <div className={styles.activityItem}>
              <DollarSign size={16} />
              <span>Payment received</span>
              <span className={styles.activityTime}>12 minutes ago</span>
            </div>
            <div className={styles.activityItem}>
              <Users size={16} />
              <span>User updated profile</span>
              <span className={styles.activityTime}>1 hour ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h2>Top Products</h2>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Product Name</span>
            <span>Category</span>
            <span>Sales</span>
            <span>Revenue</span>
          </div>
          <div className={styles.tableRow}>
            <span>Premium Package</span>
            <span>Services</span>
            <span>245</span>
            <span>$24,500</span>
          </div>
          <div className={styles.tableRow}>
            <span>Basic Plan</span>
            <span>Services</span>
            <span>189</span>
            <span>$9,450</span>
          </div>
          <div className={styles.tableRow}>
            <span>Enterprise Suite</span>
            <span>Software</span>
            <span>67</span>
            <span>$67,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
