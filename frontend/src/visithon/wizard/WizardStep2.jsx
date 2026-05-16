import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../../apiClient';
import { getWizardState, patchStep2, uploadAvatarFile } from '../../api/visithonApi';
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
  const blobPreviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarStoragePath, setAvatarStoragePath] = useState('');

  const revokeBlobPreview = () => {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('visithon_card_token');
    if (!token) {
      navigate('/card/login');
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await getWizardState();
        if (cancelled) return;
        const s2 = data.profile?.step2 || {};
        setFullName(s2.full_name || '');
        setPosition(s2.position || '');
        setCompany(s2.company || '');
        setBio(s2.bio || '');
        const rel = String(s2.avatar_url || '').trim();
        if (rel) {
          setAvatarStoragePath(rel);
          setAvatarPreview(staticUrl(rel));
        }
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load profile.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      revokeBlobPreview();
    };
  }, [navigate]);

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPG or PNG image.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be 2MB or smaller.');
      e.target.value = '';
      return;
    }

    setError('');
    revokeBlobPreview();
    const localUrl = URL.createObjectURL(file);
    blobPreviewRef.current = localUrl;
    setAvatarPreview(localUrl);

    setUploading(true);
    try {
      const { relativePath, displayUrl } = await uploadAvatarFile(file);
      revokeBlobPreview();
      setAvatarStoragePath(relativePath);
      setAvatarPreview(displayUrl);
    } catch (err) {
      setError(apiErrorMessage(err, 'Avatar upload failed.'));
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
      const body = {
        full_name: fullName.trim(),
        position: position.trim(),
        company: company.trim(),
        bio: bio.trim(),
      };
      if (avatarStoragePath) {
        body.avatar_url = avatarStoragePath;
      }
      await patchStep2(body);
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
          <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading || uploading}>
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