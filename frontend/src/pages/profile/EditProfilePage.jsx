import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { memberProfileService } from '../../services/memberProfile.service.js';
import ProfileAvatar from '../../components/profile/ProfileAvatar.jsx';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton.jsx';

const parseList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const initialForm = {
  phone: '',
  alternatePhone: '',
  address: '',
  city: '',
  region: '',
  country: '',
  bio: '',
  occupation: '',
  education: '',
  favoriteVerse: '',
  churchRole: '',
  ministry: '',
  skills: '',
  talents: '',
  interests: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  facebook: '',
  telegram: '',
  instagram: '',
  youtube: '',
  website: '',
  profilePhoto: '',
};

export default function EditProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwnProfile = !id;
  const backPath = isOwnProfile ? '/dashboard/profile' : `/dashboard/profiles/${id}`;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = isOwnProfile
          ? await memberProfileService.getMyProfile()
          : await memberProfileService.getProfile(id);
        const data = response.data;
        setProfile(data);
        setForm({
          phone: data.phone || '',
          alternatePhone: data.alternatePhone || '',
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          country: data.country || '',
          bio: data.bio || '',
          occupation: data.occupation || '',
          education: data.education || '',
          favoriteVerse: data.favoriteVerse || data.favoriteBibleVerse || '',
          churchRole: data.churchRole || '',
          ministry: data.ministry || '',
          skills: (data.skills || []).join(', '),
          talents: (data.talents || []).join(', '),
          interests: (data.interests || []).join(', '),
          emergencyContactName: data.emergencyContact?.name || '',
          emergencyContactPhone: data.emergencyContact?.phone || '',
          emergencyContactRelationship: data.emergencyContact?.relationship || '',
          facebook: data.socialLinks?.facebook || '',
          telegram: data.socialLinks?.telegram || '',
          instagram: data.socialLinks?.instagram || '',
          youtube: data.socialLinks?.youtube || '',
          website: data.socialLinks?.website || '',
          profilePhoto: data.profilePhoto || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, isOwnProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        phone: form.phone,
        alternatePhone: form.alternatePhone,
        address: form.address,
        city: form.city,
        region: form.region,
        country: form.country,
        bio: form.bio,
        occupation: form.occupation,
        education: form.education,
        favoriteVerse: form.favoriteVerse,
        churchRole: form.churchRole,
        ministry: form.ministry,
        skills: parseList(form.skills),
        talents: parseList(form.talents),
        interests: parseList(form.interests),
        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship,
        },
        socialLinks: {
          facebook: form.facebook,
          telegram: form.telegram,
          instagram: form.instagram,
          youtube: form.youtube,
          website: form.website,
        },
        profilePhoto: form.profilePhoto,
      };

      const profileId = isOwnProfile ? profile.id : id;
      await memberProfileService.updateProfile(profileId, payload);
      setSuccess('Profile updated successfully.');
      setTimeout(() => navigate(backPath), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Update your personal and church information.
          </p>
        </div>
        <Link
          to={backPath}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Photo</h2>
          <div className="mt-4 flex items-center gap-6">
            <ProfileAvatar profile={{ ...profile, profilePhoto: form.profilePhoto }} size="lg" />
            <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </section>

        <FormSection title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Input
              label="Alternate Phone"
              name="alternatePhone"
              value={form.alternatePhone}
              onChange={handleChange}
            />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} />
            <Input label="City" name="city" value={form.city} onChange={handleChange} />
            <Input label="Region" name="region" value={form.region} onChange={handleChange} />
            <Input label="Country" name="country" value={form.country} onChange={handleChange} />
          </div>
        </FormSection>

        <FormSection title="About">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} />
            <Input label="Education" name="education" value={form.education} onChange={handleChange} />
            <Input label="Church Role" name="churchRole" value={form.churchRole} onChange={handleChange} />
            <Input label="Ministry" name="ministry" value={form.ministry} onChange={handleChange} />
          </div>
          <TextArea label="Biography" name="bio" value={form.bio} onChange={handleChange} />
          <Input
            label="Favorite Bible Verse"
            name="favoriteVerse"
            value={form.favoriteVerse}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Skills & Interests">
          <Input
            label="Skills (comma separated)"
            name="skills"
            value={form.skills}
            onChange={handleChange}
          />
          <Input
            label="Talents (comma separated)"
            name="talents"
            value={form.talents}
            onChange={handleChange}
          />
          <Input
            label="Interests (comma separated)"
            name="interests"
            value={form.interests}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Emergency Contact">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Name"
              name="emergencyContactName"
              value={form.emergencyContactName}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="emergencyContactPhone"
              value={form.emergencyContactPhone}
              onChange={handleChange}
            />
            <Input
              label="Relationship"
              name="emergencyContactRelationship"
              value={form.emergencyContactRelationship}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        <FormSection title="Social Links">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Facebook" name="facebook" value={form.facebook} onChange={handleChange} />
            <Input label="Telegram" name="telegram" value={form.telegram} onChange={handleChange} />
            <Input label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} />
            <Input label="YouTube" name="youtube" value={form.youtube} onChange={handleChange} />
            <Input label="Website" name="website" value={form.website} onChange={handleChange} />
          </div>
        </FormSection>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
    </label>
  );
}

function TextArea({ label, name, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
    </label>
  );
}
