import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { agentsApi, callsApi } from '../api/client';
import { Agent, Call } from '../types';
import { Phone, PhoneCall, Activity, Plus } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, callsRes] = await Promise.all([
          agentsApi.list(0, 5),
          callsApi.list(undefined, 0, 5),
        ]);
        setAgents(agentsRes.data);
        setCalls(callsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeAgents = agents.filter((a) => a.is_active).length;
  const totalCalls = calls.length;
  const avgDuration = calls.length > 0
    ? Math.round(calls.reduce((sum, c) => sum + c.duration_seconds, 0) / calls.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="text-gray-600">Here's an overview of your voice agents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Agents</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{activeAgents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <PhoneCall className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Calls</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{totalCalls}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Duration</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{avgDuration}s</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/agents/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Agent
        </button>
      </div>

      {/* Recent Agents */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Agents</h3>
          <button
            onClick={() => navigate('/agents')}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </button>
        </div>
        <div className="border-t border-gray-200">
          {agents.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No agents yet. Create your first voice agent!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {agents.map((agent) => (
                <li
                  key={agent.id}
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">{agent.name}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{agent.description || 'No description'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Calls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Calls</h3>
          <button
            onClick={() => navigate('/calls')}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </button>
        </div>
        <div className="border-t border-gray-200">
          {calls.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No calls yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {calls.map((call) => (
                <li
                  key={call.id}
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/calls/${call.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{call.caller_number || 'Unknown'}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        call.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : call.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {call.status}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(call.started_at).toLocaleString()} • {call.duration_seconds}s
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
