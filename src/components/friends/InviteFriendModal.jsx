import React, { useState } from 'react';
import { Mail, Copy, Check, Share2, Sparkles, Send } from 'lucide-react';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function InviteFriendModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://kweshun.app/join?ref=${user?.handle?.replace('@', '') || 'scholar'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    showToast('Invite link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast(`Invitation successfully dispatched to ${email}! (+50 DP upon registration)`, 'success');
    setEmail('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Peers to Kweshun"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#0df2c9]/10 to-[#8b5cf6]/10 border border-[#0df2c9]/20 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0df2c9]/20 flex items-center justify-center text-[#0df2c9] flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Earn +50 DP Per Referral</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              When a colleague signs up with your invite link and plays their first battle, you both get 50 Distinction Points!
            </p>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Unique Invite Link
          </label>
          <div className="flex items-center gap-2 bg-[#111927] border border-[#22334d] p-1.5 rounded-xl">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 bg-transparent px-3 text-xs text-slate-200 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-[#1b273a] hover:bg-[#0df2c9] text-slate-200 hover:text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Email Direct Invite */}
        <form onSubmit={handleSendEmail} className="space-y-3 pt-2 border-t border-[#1b273a]">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Or Send Direct Academic Invite via Email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@university.edu"
                className="w-full bg-[#111927] border border-[#22334d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#0df2c9] hover:bg-[#0df2c9]/90 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
