import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Key, Bell, Shield } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.full_name || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center mb-4">
            <Key className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">API Keys</h3>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-4">
              Configure your API keys in the environment variables. Contact your administrator for changes.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">OpenAI API Key</span>
                <span className="text-sm text-gray-500">••••••••••••</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Deepgram API Key</span>
                <span className="text-sm text-gray-500">••••••••••••</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Cartesia API Key</span>
                <span className="text-sm text-gray-500">••••••••••••</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Twilio Credentials</span>
                <span className="text-sm text-gray-500">••••••••••••</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Email notifications for new calls
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Email notifications for failed calls
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Weekly summary reports
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
