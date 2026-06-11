import React, { useState, useMemo, useEffect } from 'react';
import { Mail, Search, AlertCircle, Calendar, Loader2, Send, Plus, Reply, User, Trash2 } from 'lucide-react';
import { messageService } from '@/modules/mailbox/services/messageService';
import { useAuth } from '@/core/context/AuthContext';
import { apiRequest } from '@/core/api/client';

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`fixed top-5 right-5 z-[999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all
      ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
      {msg}
    </div>
  );
}

export default function TeacherMailboxPage() {
  const { userProfile, role } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'sent'
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const [query, setQuery] = useState('');
  
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  // Compose / Reply State
  const [composeModal, setComposeModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Compose form
  const [form, setForm] = useState({ receiverId: '', subject: '', message: '', isBroadcastToClass: false });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadData();
    // Load students for dropdown
    apiRequest('/students').then(res => setStudents(res || [])).catch(() => {});
  }, [activeTab, query]);

  const loadData = () => {
    setLoading(true);
    const fetcher = activeTab === 'inbox' ? messageService.getConversations(query) : messageService.getSentMessages(query);
    fetcher.then(data => setConversations(data || []))
           .catch(() => setError('Failed to load messages'))
           .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedThreadId) {
      setThreadLoading(true);
      messageService.getConversationDetails(selectedThreadId)
        .then(data => {
          setThreadMessages(data || []);
          // if inbox, reload to update read status
          if (activeTab === 'inbox') loadData();
        })
        .catch(() => showToast('Failed to load thread', 'error'))
        .finally(() => setThreadLoading(false));
    } else {
      setThreadMessages([]);
    }
  }, [selectedThreadId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.receiverId && !form.isBroadcastToClass) return showToast('Select a student', 'error');
    if (!form.subject.trim() || !form.message.trim()) return showToast('Subject and message required', 'error');
    setSending(true);
    try {
      await messageService.sendMessage(form);
      setComposeModal(false);
      setForm({ receiverId: '', subject: '', message: '', isBroadcastToClass: false });
      showToast('Message sent!');
      if (activeTab === 'sent') loadData();
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
    }
    setSending(false);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await messageService.replyMessage(selectedThreadId, { message: replyText });
      setReplyText('');
      showToast('Reply sent!');
      // reload thread
      const data = await messageService.getConversationDetails(selectedThreadId);
      setThreadMessages(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to send reply', 'error');
    }
    setSending(false);
  };

  const handleDelete = async (id) => {
    try {
      await messageService.deleteMessage(id);
      showToast('Message deleted');
      if (selectedThreadId) {
        const data = await messageService.getConversationDetails(selectedThreadId);
        setThreadMessages(data || []);
        if (data.length === 0) setSelectedThreadId(null);
      }
      loadData();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <Toast msg={toast.msg} type={toast.type} />
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Mail size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Mailbox</h1>
            <p className="text-sm text-gray-500 mt-0.5">Communicate with your students</p>
          </div>
        </div>
        <button 
          onClick={() => setComposeModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus size={16} /> Compose
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <div className="w-1/3 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-w-[300px]">
          <div className="flex border-b border-gray-100">
            <button 
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'inbox' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('inbox'); setSelectedThreadId(null); }}
            >
              Inbox
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'sent' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('sent'); setSelectedThreadId(null); }}
            >
              Sent
            </button>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 text-sm">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No messages found.</div>
            ) : (
              <div className="flex flex-col">
                {conversations.map((msg) => {
                  const isUnread = activeTab === 'inbox' && !msg.isRead;
                  const otherName = activeTab === 'inbox' ? msg.senderName : msg.receiverName;
                  return (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedThreadId(msg.conversationId)}
                      className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${selectedThreadId === msg.conversationId ? 'bg-blue-50/50' : ''} ${isUnread ? 'bg-blue-50/20' : ''}`}
                    >
                      <div className="pt-1">
                        {isUnread ? <div className="w-2 h-2 bg-blue-600 rounded-full" /> : <div className="w-2 h-2 bg-transparent rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{otherName}</span>
                          <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className={`text-sm truncate mb-1 ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{msg.subject}</h3>
                        <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Thread View */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {selectedThreadId ? (
            threadLoading ? (
              <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900">{threadMessages[0]?.subject}</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {threadMessages.map(msg => {
                    const isMe = msg.senderRole === role;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-xs">
                          {msg.senderName?.charAt(0) || 'U'}
                        </div>
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-700">{msg.senderName}</span>
                            <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>
                          <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                            {msg.message}
                          </div>
                          {isMe && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-400">
                                {msg.isRead ? `Read ${msg.readAt ? new Date(msg.readAt).toLocaleString() : ''}` : 'Delivered'}
                              </span>
                              <button onClick={() => handleDelete(msg.id)} className="text-[10px] text-red-500 hover:underline">Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={e => e.key === 'Enter' && handleReply()}
                    />
                    <button 
                      onClick={handleReply}
                      disabled={!replyText.trim() || sending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center disabled:opacity-60 transition-colors"
                    >
                      {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <Mail size={48} className="mb-4 text-gray-200" />
              <p className="text-lg font-medium text-gray-500">No conversation selected</p>
              <p className="text-sm mt-1">Select a thread to view or reply</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {composeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Compose Message</h2>
              <button onClick={() => setComposeModal(false)} className="text-gray-400 hover:text-gray-600"><Plus size={20} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              {userProfile?.isClassTeacher && userProfile?.classTeacherClassId && (
                <div className="flex items-center gap-2 mb-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="broadcast"
                    checked={form.isBroadcastToClass}
                    onChange={e => setForm({ ...form, isBroadcastToClass: e.target.checked, receiverId: '' })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="broadcast" className="text-sm font-medium text-blue-900 cursor-pointer">
                    Send to entire class ({userProfile.classTeacherClassId})
                  </label>
                </div>
              )}

              {!form.isBroadcastToClass && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Student *</label>
                  <select 
                    value={form.receiverId} 
                    onChange={e => setForm({...form, receiverId: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select a student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input 
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Message subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea 
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setComposeModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 border rounded-lg">Cancel</button>
                <button type="submit" disabled={sending} className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
