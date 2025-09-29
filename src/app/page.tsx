'use client';

import Link from 'next/link';

export default function HomePage() {
  const generateSquares = (count: number) => {
    return Array.from({ length: count }, (_, index) => (
      <span key={index} style={{
        float: 'left',
        width: '10%',
        paddingBottom: '10%',
        backgroundColor: '#1d1d1d',
        border: '1px solid #0f0f0f',
        transition: '0.1s ease'
      }}></span>
    ));
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'monospace'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 10,
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '200px',
          height: '200px',
          margin: '0 auto',
          border: '6px solid #ffffff',
          borderRadius: '100%',
          position: 'relative'
        }}>
          <div style={{
            content: "''",
            width: '6px',
            height: '80px',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translate(-50%, 0)',
            transformOrigin: 'bottom',
            animation: 'spin 12s linear infinite'
          }}></div>
        </div>
        
        <h1 style={{
          margin: '25px 0 0 0',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '48px',
          fontWeight: '700',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          lineHeight: '1.2'
        }}>
          Track Time.<br />Stay Focused.
        </h1>
        
        <p style={{
          color: '#888888',
          fontSize: '18px',
          marginTop: '16px',
          letterSpacing: '1px',
          fontWeight: '300'
        }}>
          Master productivity with our minimal time tracking solution
        </p>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginTop: '40px'
        }}>
          <Link href="/pages/AuthPage" style={{
            padding: '16px 32px',
            background: '#ffffff',
            color: '#0a0a0a',
            border: '2px solid #ffffff',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }}>
            Get Started
          </Link>
           <Link href="/pages/MainClockPage" style={{
            padding: '16px 32px',
            background: '#ffffff',
            color: '#0a0a0a',
            border: '2px solid #ffffff',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }}>
            No Account? Try Now!
          </Link>
        </div>
      </div>
      
      {generateSquares(100)}
      
      <style jsx>{`
        @keyframes spin {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
