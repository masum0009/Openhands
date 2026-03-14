import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callsApi, agentsApi } from '../../api/client';
import { Call, Agent } from '../../types';
import { ArrowLeft, Phone, Clock, User, Play, Download } from 'lucide-react';
import { format } from 'date-fns';

export function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<Call | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCall(parseInt(id));
    }
  }, [id]);

  const fetchCall = async (callId: number) => {
    try {
      const response = await callsApi.get(callId);
      setCall(response.data);
      
      // Fetch agent
      const agentRes = await agentsApi.get(response.data.agent_id);
      setAgent(agentRes.data);
    } catch (error) {
      console.error('Failed to fetch call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p className="text-gray-500">Call not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/calls')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calls
        </button>
      </div>

      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Call #{call.id}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              SID: {call.call_sid || 'N/A'}
            </p>
          </div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(call.status)}`}>
            {call.status}
          </span>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Caller Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{call.caller_number || 'Unknown'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Agent
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{agent?.name || 'Unknown'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Duration
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{call.duration_seconds} seconds</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Started</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(call.started_at), 'MMM d, yyyy HH:mm:ss')}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Ended</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {call.ended_at ? format(new Date(call.ended_at), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
              </dd>
            </div>
            {call.recording_url && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Recording</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={call.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-500 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Transcript
          </h3>
          
          {(!call.transcript || call.transcript.length === 0) ? (
            <p className="text-gray-500 text-center py-8">No transcript available</p>
          ) : (
            <div className="space-y-4">
              {call.transcript.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary-100 text-primary-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {message.role === 'user' ? 'Caller' : 'AI Agent'}
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {message.timestamp ? format(new Date(message.timestamp), 'HH:mm:ss') : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
