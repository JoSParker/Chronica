'use client';
import { supabase } from '../../../../lib/supabaseClient';
import React, { useState } from 'react';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add authentication functionality
    console.log('Form submitted:', formData);
  };

  const toggleMode = () => {
    setIsFlipping(true);
    
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }, 300); // Half of the flip animation duration

    setTimeout(() => {
      setIsFlipping(false);
    }, 600); // Full animation duration
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.flipContainer} ${isFlipping ? styles.flipping : ''}`}>
        <div className={styles.authCard}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>CHRONICA</h1>
            <p className={styles.subtitle}>
              {isLogin ? 'SIGN IN TO YOUR ACCOUNT' : 'CREATE NEW ACCOUNT'}
            </p>
          </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                FULL NAME
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              PASSWORD
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Confirm your password"
                required={!isLogin}
              />
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className={styles.submitButton}>
            {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>OR</span>
        </div>

        {/* Google Button */}
        <button type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className={styles.googleButton}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        {/* Toggle Mode */}
        <div className={styles.toggleSection}>
          <p className={styles.toggleText}>
            {isLogin ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY HAVE AN ACCOUNT?'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className={styles.toggleButton}
          >
            {isLogin ? 'CREATE ONE' : 'SIGN IN'}
          </button>
        </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              SECURE TIME TRACKING FOR PROFESSIONALS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;