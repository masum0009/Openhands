import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { agentsApi } from '../../api/client';
import { Agent } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

export function AgentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: 'You are a helpful AI voice assistant. Be concise and friendly.',
    voice_id: 'cartesia',
    voice_speed: 1.0,
    voice_pitch: 1.0,
    llm_provider: 'openai',
    llm_model: 'gpt-4o',
    stt_provider: 'deepgram',
    tts_provider: 'cartesia',
    webhook_url: '',
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      fetchAgent(parseInt(id));
    }
  }, [id]);

  const fetchAgent = async (agentId: number) => {
    try {
      const response = await agentsApi.get(agentId);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to fetch agent:', error);
      setError('Failed to load agent');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isEditing && id) {
        await agentsApi.update(parseInt(id), formData);
      } else {
        await agentsApi.create(formData);
      }
      navigate('/agents');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save agent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Edit Agent' : 'Create New Agent'}
          </h1>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">System Prompt</h3>
              <textarea
                name="system_prompt"
                rows={6}
                value={formData.system_prompt}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono"
                placeholder="You are a helpful AI voice assistant..."
              />
              <p className="mt-2 text-xs text-gray-500">
                This prompt defines how the AI assistant behaves during calls
              </p>
            </div>

            {/* Voice Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Voice Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Voice ID</label>
                  <select
                    name="voice_id"
                    value={formData.voice_id}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="cartesia">Cartesia</option>
                    <option value="simono">Simono</option>
                    <option value="arigo">Arigo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">TTS Provider</label>
                  <select
                    name="tts_provider"
                    value={formData.tts_provider}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="cartesia">Cartesia</option>
                    <option value="elevenlabs">ElevenLabs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Speed ({formData.voice_speed}x)</label>
                  <input
                    type="range"
                    name="voice_speed"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={formData.voice_speed}
                    onChange={handleChange}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pitch ({formData.voice_pitch})</label>
                  <input
                    type="range"
                    name="voice_pitch"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={formData.voice_pitch}
                    onChange={handleChange}
                    className="mt-1 block w-full"
                  />
                </div>
              </div>
            </div>

            {/* LLM Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">LLM Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">LLM Provider</label>
                  <select
                    name="llm_provider"
                    value={formData.llm_provider}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <select
                    name="llm_model"
                    value={formData.llm_model}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STT Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Speech-to-Text</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">STT Provider</label>
                <select
                  name="stt_provider"
                  value={formData.stt_provider}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="deepgram">Deepgram</option>
                  <option value="assemblyai">AssemblyAI</option>
                </select>
              </div>
            </div>

            {/* Advanced */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
                  <input
                    type="url"
                    name="webhook_url"
                    value={formData.webhook_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Agent is active
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/agents')}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
