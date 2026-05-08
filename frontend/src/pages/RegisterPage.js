import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerClient } from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const strength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthInfo = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#fc8181' },
    { label: 'Fair', color: '#f6ad55' },
    { label: 'Good', color: '#68d391' },
    { label: 'Strong', color: '#38b2ac' },
  ];

  const pw = strength(form.password);
  const passwordsMatch = form.confirm && form.confirm === form.password;
  const passwordsMismatch = form.confirm && form.confirm !== form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (pw < 2) return toast.error('Please use a stronger password');
    setLoading(true);
    try {
      await registerClient({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const focusStyle = (e) => { e.target.style.borderColor = 'rgba(56,178,172,0.8)'; e.target.style.background = 'rgba(255,255,255,0.1)'; };
  const blurStyle = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; e.target.style.background = 'rgba(255,255,255,0.07)'; };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M7 14L12 19L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.logoText}>BPQG</span>
        </div>

        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join BPQG and get started today</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Full Name */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe" style={styles.input}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                <path d="M2 5l8 5 8-5M2 5h16v12H2V5z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" style={styles.input}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                <rect x="3" y="9" width="14" height="10" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                <path d="M7 9V6a3 3 0 016 0v3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters" style={styles.input}
                onFocus={focusStyle} onBlur={blurStyle}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                  <path d="M1 10s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="3" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
            {/* Strength bar */}
            {form.password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= pw ? strengthInfo[pw].color : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthInfo[pw].color }}>
                  {strengthInfo[pw].label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                <path d="M9 12l2 2 4-4M7 3H4a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V7l-4-4H7z"
                  stroke={passwordsMatch ? 'rgba(56,178,172,0.7)' : 'rgba(255,255,255,0.5)'}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type={showConfirm ? 'text' : 'password'} required value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="Re-enter password"
                style={{
                  ...styles.input,
                  borderColor: passwordsMismatch
                    ? 'rgba(252,129,129,0.6)'
                    : passwordsMatch
                    ? 'rgba(56,178,172,0.7)'
                    : 'rgba(255,255,255,0.18)',
                }}
                onFocus={focusStyle}
                onBlur={e => {
                  if (passwordsMismatch) e.target.style.borderColor = 'rgba(252,129,129,0.6)';
                  else if (passwordsMatch) e.target.style.borderColor = 'rgba(56,178,172,0.7)';
                  else blurStyle(e);
                }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                  <path d="M1 10s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="3" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
            {passwordsMismatch && (
              <span style={{ fontSize: 11, color: '#fc8181', marginTop: 4 }}>
                ✕ Passwords don't match
              </span>
            )}
            {passwordsMatch && (
              <span style={{ fontSize: 11, color: '#38b2ac', marginTop: 4 }}>
                ✓ Passwords match
              </span>
            )}
          </div>

          {/* Register Button */}
          <button type="submit" disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6 }}
            onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 30px rgba(56,178,172,0.55)'; }}}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 18px rgba(56,178,172,0.35)'; }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={styles.spinner} /> Creating account...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        <p style={{ ...styles.bottomText, marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" style={styles.accentLink}>Sign in</Link>
        </p>
      </div>

      <style>{`
        @keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(28px,-22px) scale(1.06)}}
        @keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-22px,28px) scale(1.06)}}
        @keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(14px,14px) scale(0.94)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(255,255,255,0.25);}
        input{caret-color:#38b2ac;}
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', width: 420, height: 420, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(56,178,172,0.28), transparent 70%)',
    top: '-110px', left: '-110px', animation: 'float1 9s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute', width: 360, height: 360, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(32,90,100,0.32), transparent 70%)',
    bottom: '-90px', right: '-90px', animation: 'float2 11s ease-in-out infinite',
  },
  blob3: {
    position: 'absolute', width: 240, height: 240, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(44,83,100,0.35), transparent 70%)',
    top: '35%', right: '12%', animation: 'float3 13s ease-in-out infinite',
  },
  card: {
    width: '100%', maxWidth: 430, position: 'relative', zIndex: 10,
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 24, padding: '38px 38px 34px',
    boxShadow: '0 28px 56px rgba(0,0,0,0.38)',
    animation: 'slideUp 0.5s ease forwards',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, #38b2ac, #2c7a7b)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(56,178,172,0.4)',
  },
  logoText: { fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '1.5px' },
  title: { fontSize: 26, fontWeight: 700, color: 'white', margin: '0 0 6px' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.65)' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, width: 17, height: 17, pointerEvents: 'none', zIndex: 1 },
  input: {
    width: '100%', padding: '13px 44px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 12, color: 'white', fontSize: 14,
    outline: 'none', transition: 'border-color 0.25s, background 0.25s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: 14, background: 'none',
    border: 'none', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center',
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #38b2ac, #2c7a7b)',
    border: 'none', borderRadius: 12, color: 'white',
    fontSize: 15, fontWeight: 600, letterSpacing: '0.3px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 18px rgba(56,178,172,0.35)',
  },
  spinner: {
    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.8s linear infinite',
  },
  bottomText: { textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 },
  accentLink: { color: '#81e6d9', textDecoration: 'none', fontWeight: 600 },
};