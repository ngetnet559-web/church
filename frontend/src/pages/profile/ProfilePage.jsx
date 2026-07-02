import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { memberProfileService } from '../../services/memberProfile.service.js';
import { ROLES } from '../../constants/roles.js';
import ProfileHeader from '../../components/profile/ProfileHeader.jsx';
import ProfileStats from '../../components/profile/ProfileStats.jsx';
import ProfileSkills from '../../components/profile/ProfileSkills.jsx';
import ProfileAchievements from '../../components/profile/ProfileAchievements.jsx';
import ProfileTimeline from '../../components/profile/ProfileTimeline.jsx';
import ProfileTabs from '../../components/profile/ProfileTabs.jsx';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton.jsx';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'skills', label: 'Skills & Talents' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'timeline', label: 'Timeline' },
];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

export default function ProfilePage() {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = !id;
  const canEdit =
    isOwnProfile ||
    hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) ||
    (profile?.user?.id === user?.id || profile?.user?._id === user?.id);

  const editPath = isOwnProfile ? '/dashboard/profile/edit' : `/dashboard/profiles/${id}/edit`;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = isOwnProfile
          ? await memberProfileService.getMyProfile()
          : await memberProfileService.getProfile(id);
        setProfile(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, isOwnProfile]);

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        <p className="font-medium">{error}</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-red-800 underline dark:text-red-200"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isOwnProfile && (
        <Link
          to="/dashboard/profiles"
          className="inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          ← Back to profiles
        </Link>
      )}

      <ProfileHeader profile={profile} canEdit={canEdit} editPath={editPath} />
      <ProfileStats profile={profile} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} tabs={TABS} />

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <InfoSection title="Personal Information">
            <InfoRow label="Email" value={profile.email || profile.user?.email} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow label="Alternate Phone" value={profile.alternatePhone} />
            <InfoRow label="Gender" value={profile.gender} />
            <InfoRow label="Date of Birth" value={formatDate(profile.dateOfBirth || profile.birthDate)} />
            <InfoRow label="Occupation" value={profile.occupation} />
            <InfoRow label="Education" value={profile.education} />
          </InfoSection>

          <InfoSection title="Church Information">
            <InfoRow label="Church Role" value={profile.churchRole} />
            <InfoRow label="Ministry" value={profile.ministry} />
            <InfoRow label="Joined Church" value={formatDate(profile.joinedChurchDate)} />
            <InfoRow label="Baptism Date" value={formatDate(profile.baptismDate)} />
            <InfoRow
              label="Favorite Bible Verse"
              value={profile.favoriteBibleVerse || profile.favoriteVerse}
            />
            <InfoRow label="Donations" value={profile.donationsCount} />
          </InfoSection>

          <InfoSection title="Address">
            <InfoRow label="Address" value={profile.address} />
            <InfoRow label="City" value={profile.city} />
            <InfoRow label="Region" value={profile.region} />
            <InfoRow label="Country" value={profile.country} />
          </InfoSection>

          <InfoSection title="Emergency Contact">
            <InfoRow label="Name" value={profile.emergencyContact?.name} />
            <InfoRow label="Phone" value={profile.emergencyContact?.phone} />
            <InfoRow label="Relationship" value={profile.emergencyContact?.relationship} />
          </InfoSection>

          <InfoSection title="Social Links" className="lg:col-span-2">
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(profile.socialLinks || {})
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <a
                    key={key}
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium capitalize text-indigo-600 transition-all hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    {key}
                  </a>
                ))}
              {Object.values(profile.socialLinks || {}).every((value) => !value) && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No social links added.</p>
              )}
            </div>
          </InfoSection>
        </div>
      )}

      {activeTab === 'skills' && <ProfileSkills profile={profile} />}
      {activeTab === 'achievements' && (
        <ProfileAchievements
          achievements={profile.achievements}
          badges={profile.badges}
        />
      )}
      {activeTab === 'timeline' && <ProfileTimeline profile={profile} />}
    </div>
  );
}

function InfoSection({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</span>
    </div>
  );
}
