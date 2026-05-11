import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login as apiLogin } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const location = useLocation();
  const isAdminUrl = new URLSearchParams(location.search).get('admin') === '1';

  const [form, setForm]           = useState({ email: '', password: '', role: '' });
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [adminMode, setAdminMode] = useState(isAdminUrl);
  const [adminClicks, setAdminClicks] = useState(isAdminUrl ? 5 : 0);

  useEffect(() => {
    if (isAdminUrl) {
      setAdminMode(true);
      setForm(f => ({ ...f, role: 'admin' }));
    }
  }, [isAdminUrl]);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleAdminTextClick = () => {
    const next = adminClicks + 1;
    setAdminClicks(next);
    if (next >= 5) {
      setAdminMode(true);
      setForm({ email: '', password: '', role: 'admin' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const role = adminMode ? 'admin' : form.role;
    if (!role) { toast.error('Please select a role'); return; }
    setLoading(true);
    try {
      const { data } = await apiLogin({ ...form, role });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate({ admin: '/admin', developer: '/developer', client: '/client' }[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = 'rgba(56,178,172,0.8)';
    e.target.style.background  = 'rgba(255,255,255,0.1)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.18)';
    e.target.style.background  = 'rgba(255,255,255,0.07)';
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M7 14L12 19L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.logoText}>BPQG</span>
        </div>

        <h1 style={styles.title}>{adminMode ? 'Admin Portal' : 'Welcome Back'}</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!adminMode && (
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Select Role</label>
              <div style={styles.inputWrap}>
                <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                  <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={styles.input}
                  required
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="" style={{ background: '#203a43' }}>Choose Role</option>
                  <option value="developer" style={{ background: '#203a43' }}>Developer</option>
                  <option value="client"    style={{ background: '#203a43' }}>Client</option>
                </select>
              </div>
            </div>
          )}

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                <path d="M2 5l8 5 8-5M2 5h16v12H2V5z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                placeholder="Email address"
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                <rect x="3" y="9" width="14" height="10" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                <path d="M7 9V6a3 3 0 016 0v3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={styles.input}
                placeholder="Enter password"
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                  <path d="M1 10s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="3" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6 }}
            onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 30px rgba(56,178,172,0.55)'; }}}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 18px rgba(56,178,172,0.35)'; }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={styles.spinner} /> Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p style={{ ...styles.bottomText, marginTop: 24 }}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.accentLink}>Create one free</Link>
        </p>

        {!adminMode && (
          <p onClick={handleAdminTextClick} style={styles.hiddenAdminText}>
            Admin Portal
          </p>
        )}
        {adminMode && (
          <p style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={() => { setAdminMode(false); setAdminClicks(0); setForm({ email: '', password: '', role: '' }); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12 }}
            >
              ← Back
            </button>
          </p>
        )}
      </div>

      <style>{`
        @keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(28px,-22px) scale(1.06)}}
        @keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-22px,28px) scale(1.06)}}
        @keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(14px,14px) scale(0.94)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(255,255,255,0.25);}
        input{caret-color:#38b2ac;}
        select option{color:white;}
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflow: 'hidden' },
  blob1: { position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,178,172,0.28), transparent 70%)', top: '-110px', left: '-110px', animation: 'float1 9s ease-in-out infinite' },
  blob2: { position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(32,90,100,0.32), transparent 70%)', bottom: '-90px', right: '-90px', animation: 'float2 11s ease-in-out infinite' },
  blob3: { position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(44,83,100,0.35), transparent 70%)', top: '35%', right: '12%', animation: 'float3 13s ease-in-out infinite' },
  card: { width: '100%', maxWidth: 430, position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 24, padding: '38px 38px 28px', boxShadow: '0 28px 56px rgba(0,0,0,0.38)', animation: 'slideUp 0.5s ease forwards' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 },
  logoIcon: { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #38b2ac, #2c7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(56,178,172,0.4)' },
  logoText: { fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '1.5px' },
  title: { fontSize: 26, fontWeight: 700, color: 'white', margin: '0 0 6px' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.65)' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, width: 17, height: 17, pointerEvents: 'none', zIndex: 1 },
  input: { width: '100%', padding: '13px 44px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, color: 'white', fontSize: 14, outline: 'none', transition: 'border-color 0.25s, background 0.25s', boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none' },
  eyeBtn: { position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #38b2ac, #2c7a7b)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, letterSpacing: '0.3px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 18px rgba(56,178,172,0.35)' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },
  bottomText: { textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 },
  accentLink: { color: '#81e6d9', textDecoration: 'none', fontWeight: 600 },
  hiddenAdminText: { textAlign: 'center', marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.08)', cursor: 'default', userSelect: 'none', letterSpacing: '0.5px' },
};