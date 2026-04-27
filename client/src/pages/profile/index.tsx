/**
 * @page Profile
 */
'use client';

import { useState, useEffect } from 'react';
import { fetchUser, updateCurrentUser, UserDto } from '@/src/shared/api/users';
import { useAuth } from '@/src/app/providers/auth-provider';
import { showToast, UiButton } from '@/src/shared/ui';
import { User, Mail, Phone, Calendar, Shield, Camera, Edit3, Save, X } from 'lucide-react';
import styles from './index.module.css';

const ProfilePage = () => {
  const { user, accessToken } = useAuth();
  const [userData, setUserData] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (user?.id && accessToken) {
      loadUserData();
    }
  }, [user?.id, accessToken]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await fetchUser(accessToken, user!.id);
      setUserData(data);

      // Build full URL for avatar
      const avatarUrl = data.avatarUrl ?
        (data.avatarUrl.startsWith('http') ? data.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331'}${data.avatarUrl}`)
        : '';

      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username || '',
        email: data.email || '',
        phone: '',
        avatarUrl: avatarUrl
      });
      setAvatarPreview(avatarUrl);
    } catch (error) {
      showToast('Error loading profile data', 'error');
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setAvatarFile(null);
    if (userData) {
      // Build full URL for avatar
      const avatarUrl = userData.avatarUrl ?
        (userData.avatarUrl.startsWith('http') ? userData.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331'}${userData.avatarUrl}`)
        : '';

      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: '',
        avatarUrl: avatarUrl
      });
      setAvatarPreview(avatarUrl);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File validation
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        showToast('File size must not exceed 5MB', 'error');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !accessToken) return;

    try {
      setLoading(true);

      // Update user profile, sending avatar directly
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email
      };

      // Add avatar file if present
      if (avatarFile) {
        setAvatarUploading(true);
        updateData.face = avatarFile;
      }

      const updatedUser = await updateCurrentUser(accessToken, updateData);
      setUserData(updatedUser);
      setEditing(false);
      setAvatarFile(null);

      // Update avatar preview with new URL
      const newAvatarUrl = updatedUser.avatarUrl ?
        (updatedUser.avatarUrl.startsWith('http') ? updatedUser.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331'}${updatedUser.avatarUrl}`)
        : '';
      setAvatarPreview(newAvatarUrl);
      setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));

      if (avatarFile) {
        showToast('Avatar updated successfully!', 'success');
      } else {
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      showToast('Error updating profile', 'error');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
      setAvatarUploading(false);
    }
  };

  if (loading && !userData) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>User Profile</h1>
            <p className={styles.subtitle}>Manage your personal information</p>
          </div>
          {!editing && (
            <UiButton theme="primary" onClick={handleEdit} className={styles.editButton}>
              <Edit3 size={16} />
              Edit
            </UiButton>
          )}
        </div>

        {/* Avatar Section */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarWrapper}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User size={48} />
                </div>
              )}
              {editing && (
                <label className={`${styles.avatarUpload} ${avatarUploading ? styles.loading : ''}`}>
                  {avatarUploading ? '' : <Camera size={20} />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className={styles.fileInput}
                    disabled={avatarUploading}
                  />
                </label>
              )}
            </div>
            <div className={styles.avatarInfo}>
              <h3 className={styles.userName}>
                {userData?.firstName} {userData?.lastName}
              </h3>
              <p className={styles.userRole}>
                {userData?.role?.name || 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            {/* First Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <User size={16} />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editing}
                className={styles.input}
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <User size={16} />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!editing}
                className={styles.input}
                placeholder="Enter last name"
              />
            </div>

            {/* Username */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <User size={16} />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!editing}
                className={styles.input}
                placeholder="Enter username"
              />
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editing}
                className={styles.input}
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <Calendar size={16} />
              <div>
                <p className={styles.infoLabel}>Registration Date</p>
                <p className={styles.infoValue}>
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US') : '—'}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Shield size={16} />
              <div>
                <p className={styles.infoLabel}>Role</p>
                <p className={styles.infoValue}>{userData?.role?.name || 'User'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className={styles.actionButtons}>
            <UiButton
              theme="secondary"
              onClick={handleCancel}
              disabled={loading || avatarUploading}
              className={styles.cancelButton}
            >
              <X size={16} />
              Cancel
            </UiButton>
            <UiButton
              theme="primary"
              onClick={handleSave}
              disabled={loading || avatarUploading}
              className={styles.saveButton}
            >
              <Save size={16} />
              {avatarUploading ? 'Uploading avatar...' : loading ? 'Saving...' : 'Save'}
            </UiButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;