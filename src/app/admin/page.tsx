'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Upload, Trash2 } from 'lucide-react';

type PortfolioData = {
  personalInfo: any;
  workExperience: any[];
  education: any[];
  skills: any[];
  projects: any[];
  currentlyLearning: any;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  const [data, setData] = useState<PortfolioData | null>(null);
  const [originalData, setOriginalData] = useState<PortfolioData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data && originalData) {
      setHasChanges(JSON.stringify(data) !== JSON.stringify(originalData));
    }
  }, [data, originalData]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/data');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch data');
      }
      const fetchedData = await response.json();
      setData(fetchedData);
      setOriginalData(JSON.parse(JSON.stringify(fetchedData)));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      setOriginalData(JSON.parse(JSON.stringify(data)));
      setHasChanges(false);
      setMessage({ type: 'success', text: 'Changes saved successfully!' });
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setData(JSON.parse(JSON.stringify(originalData)));
      setHasChanges(false);
      setMessage(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleImageUpload = async (file: File, field: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();

      // Update the appropriate field with the new URL
      if (field === 'profileImage') {
        setData((prev) => prev ? {
          ...prev,
          personalInfo: { ...prev.personalInfo, profileImageUrl: result.url }
        } : null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load data</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Portfolio Admin
            </h1>
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Apply Changes'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 ${
            message.type === 'success' ? 'text-green-800 bg-green-50' : 'text-red-800 bg-red-50'
          } p-4 rounded-md`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'personal', label: 'Personal Info' },
              { id: 'experience', label: 'Work Experience' },
              { id: 'education', label: 'Education' },
              { id: 'skills', label: 'Skills' },
              { id: 'projects', label: 'Projects' },
              { id: 'learning', label: 'Currently Learning' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8 pb-12">
          {activeTab === 'personal' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h2>
              <input
                type="text"
                placeholder="Name"
                value={data.personalInfo?.name || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    personalInfo: { ...prev.personalInfo, name: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Title"
                value={data.personalInfo?.title || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    personalInfo: { ...prev.personalInfo, title: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={data.personalInfo?.email || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={data.personalInfo?.phone || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={data.personalInfo?.linkedin || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Location"
                value={data.personalInfo?.location || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <textarea
                placeholder="Bio"
                rows={4}
                value={data.personalInfo?.bio || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    personalInfo: { ...prev.personalInfo, bio: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'profileImage');
                  }}
                  className="w-full"
                />
                {data.personalInfo?.profileImageUrl && (
                  <p className="mt-2 text-sm text-gray-500">Current: {data.personalInfo.profileImageUrl}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Currently Learning</h2>
              <textarea
                rows={4}
                value={data.currentlyLearning?.content || ''}
                onChange={(e) =>
                  setData((prev) => prev ? {
                    ...prev,
                    currentlyLearning: { ...prev.currentlyLearning, content: e.target.value },
                  } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="What are you currently learning about?"
              />
            </div>
          )}

          {/* Simplified view for other tabs - you can expand these as needed */}
          {activeTab !== 'personal' && activeTab !== 'learning' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Editing interface for {activeTab} - Full implementation available in the complete version
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
