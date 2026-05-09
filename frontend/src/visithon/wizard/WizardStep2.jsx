import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, apiErrorMessage } from '../../apiClient';
import CardWrapper from '../components/CardWrapper';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import GlassShell from '../components/GlassShell';
import ProfileAvatarUpload from '../components/ProfileAvatarUpload';
import { staticUrl } from '../utils/staticUrl';

const BIO_MAX = 150;

export default function WizardStep2() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    // Security Guard: Check if user is logged in
    const token = localStorage.getItem('visithon_card_token');
    if (!token) {
      navigate('/card/login');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get('/visithon/wizard/state');
        if (cancelled) return;
        const s2 = data.profile?.step2 || {};
        setFullName(s2.full_name || '');
        setPosition(s2.position || '');
        setCompany(s2.company || '');
        setBio(s2.bio || '');
        if (s2.avatar_url) setAvatarPreview(staticUrl(s2.avatar_url));
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load profile.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await apiClient.post('/visithon/wizard/avatar', fd);
      if (data.avatar_url) setAvatarPreview(staticUrl(data.avatar_url));
    } catch (err) {
      setError(apiErrorMessage(err, 'Avatar upload failed.'));
      setAvatarPreview('');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onContinue = async () => {
    setError('');
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/visithon/wizard/step2', {
        full_name: fullName.trim(),
        position: position.trim(),
        company: company.trim(),
        bio: bio.trim(),
      });
      
      // AB YE SEEDHA STEP-3 PAR JAYEGA (THEMES)
      navigate('/card/wizard/step-3'); 
      
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save basic info.'));
    } finally {
      setSaving(false);
    }
};

  return (
    <GlassShell>
      <CardWrapper
        title="Basic Information"
        subtitle="Your public details on Visithon Card."
        bgClassName="bg-transparent"
        footer={
          <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span>
          </CustomButton>
        }
      >
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mb-2"></div>
            <p className="text-sm text-white/50">Loading Information...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}

            <ProfileAvatarUpload
              previewUrl={avatarPreview}
              uploading={uploading}
              fileInputRef={fileRef}
              onPick={onPickFile}
              onFileChange={onFileChange}
              hint="JPG or PNG. Maximum size 2MB."
            />

            <div className="flex flex-col gap-4 pb-2">
              <CustomInput
                label="Full Name"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ammad"
              />
              <CustomInput
                label="Position / Title"
                name="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Software Developer"
              />
              <CustomInput
                label="Company / Business"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name"
              />
              <div className="relative">
                <CustomInput
                  label="Short Bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people what you do..."
                  multiline
                  maxLength={BIO_MAX}
                />
                <span className="pointer-events-none absolute bottom-3 right-3 text-xs text-cyan-200/60">
                  {bio.length}/{BIO_MAX}
                </span>
              </div>
            </div>
          </>
        )}
      </CardWrapper>
    </GlassShell>
  );
}