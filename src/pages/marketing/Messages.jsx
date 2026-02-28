import React, { useState, useEffect, useRef } from "react";
import { 
  Send, MoreVertical, Trash2, User, 
  CheckCheck, Search, Phone, Video, 
  Smile, Paperclip, MoreHorizontal
} from "lucide-react";

export default function Messages() {
  const [activeChat, setActiveChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [showOptions, setShowOptions] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Admin", role: "Marketing Team Portal", text: "Welcome to the GMMC Field Portal! How can we help you today?", time: "01:01 PM", isMe: false, status: "read" },
    { id: 2, sender: "Ram", role: "Representative", text: "I've just finished the visit at Arunima School.", time: "01:05 PM", isMe: true, status: "read" },
  ]);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const msg = {
      id: Date.now(),
      sender: "Ram",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: "sent"
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleDelete = (id) => {
    setMessages(messages.filter(msg => msg.id !== id));
    setShowOptions(null);
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white border-none rounded-2xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#00D1C1]/20 shadow-sm transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ChatListItem 
            name="Admin" 
            sub="Support Team" 
            lastMsg="Welcome to the GMMC..."
            active={activeChat === 1} 
            onClick={() => setActiveChat(1)} 
          />
          <ChatListItem 
            name="Field Team" 
            sub="Madanapalle Group" 
            lastMsg="Meeting at 4 PM"
            active={activeChat === 2} 
            onClick={() => setActiveChat(2)} 
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-[#00D1C1]/10 rounded-2xl flex items-center justify-center text-[#00D1C1] font-black">
                A
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Admin</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</p>
            </div>
          </div>
          <div className="flex gap-2">
             <IconButton icon={<Phone size={18} />} />
             <IconButton icon={<Video size={18} />} />
             <IconButton icon={<MoreHorizontal size={18} />} />
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#F8FAFC] scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="p-6 bg-slate-100 rounded-full mb-4">
                <Send size={40} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest">No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className="relative group max-w-[70%]">
                  <div className={`p-4 rounded-[28px] text-[13px] font-bold shadow-sm relative transition-all ${
                    msg.isMe 
                    ? "bg-black text-white rounded-tr-none" 
                    : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  }`}>
                    {msg.text}
                    <div className={`flex items-center gap-1 mt-2 text-[9px] font-black uppercase opacity-60`}>
                      {msg.time} {msg.isMe && <CheckCheck size={12} className={msg.status === 'read' ? 'text-[#00D1C1]' : ''} />}
                    </div>

                    <button 
                      onClick={() => setShowOptions(showOptions === msg.id ? null : msg.id)}
                      className={`absolute ${msg.isMe ? "-left-10" : "-right-10"} top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-slate-600`}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {showOptions === msg.id && (
                      <div className={`absolute ${msg.isMe ? "-left-36" : "left-0"} top-10 bg-white shadow-2xl border border-slate-100 rounded-2xl py-2 z-20 w-32 animate-in zoom-in-95 duration-200`}>
                        <button 
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 w-full text-left"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-50">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-2 rounded-[30px] focus-within:ring-2 focus-within:ring-[#00D1C1]/20 transition-all">
            <button className="p-3 text-slate-400 hover:text-[#00D1C1] transition-colors">
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Write your message..." 
              className="flex-1 bg-transparent border-none py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button className="p-3 text-slate-400 hover:text-orange-400 transition-colors">
              <Smile size={20} />
            </button>
            <button 
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className={`p-4 rounded-full shadow-lg transition-all active:scale-90 ${
                newMessage.trim() 
                ? "bg-[#00D1C1] text-white shadow-[#00D1C1]/20 hover:rotate-12" 
                : "bg-slate-200 text-slate-400 shadow-none"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatListItem({ name, sub, lastMsg, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-6 flex items-center gap-4 border-b border-slate-50/50 transition-all ${active ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${active ? "bg-[#00D1C1] text-white" : "bg-slate-200 text-slate-500"}`}>
        {name[0]}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className={`text-[11px] font-black uppercase tracking-tight ${active ? "text-slate-800" : "text-slate-500"}`}>{name}</h4>
          <span className="text-[8px] font-bold text-slate-300">12:45 PM</span>
        </div>
        <p className={`text-[10px] font-bold truncate uppercase tracking-widest ${active ? "text-[#00D1C1]" : "text-slate-400"}`}>
          {lastMsg}
        </p>
      </div>
    </button>
  );
}

function IconButton({ icon }) {
  return (
    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#00D1C1]/10 hover:text-[#00D1C1] transition-all active:scale-90">
      {icon}
    </button>
  );
}