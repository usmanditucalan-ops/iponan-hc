import React, { useEffect, useState } from 'react';
import { Bell, X, Check, Trash2, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-8 w-96 bg-white dark:bg-dark-surface-primary rounded-xl shadow-2xl border border-border dark:border-dark-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-md flex items-center justify-center">
            <Bell size={20} />
          </div>
          <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Notifications</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-md transition-colors text-text-muted dark:text-dark-text-muted-dark"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-primary dark:text-dark-primary" size={24} />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border dark:divide-dark-border">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-5 transition-colors ${notification.read ? 'opacity-60' : 'bg-primary/5 dark:bg-dark-primary/5'}`}
              >
                <div className="flex justify-between gap-3 mb-1">
                  <h4 className="font-bold text-sm text-text-primary dark:text-dark-text-primary">{notification.title}</h4>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 hover:bg-primary/10 dark:hover:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-sm transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted-dark leading-relaxed mb-3">
                  {notification.message}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted-dark dark:text-dark-text-muted-dark font-medium">
                  <Clock size={12} />
                  {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface-secondary dark:bg-dark-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted dark:text-dark-text-muted-dark">
              <Bell size={28} />
            </div>
            <p className="text-sm font-medium text-text-muted dark:text-dark-text-muted-dark">No notifications yet</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-surface-secondary dark:bg-dark-surface-secondary border-t border-border dark:border-dark-border">
          <button 
            onClick={clearAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all"
          >
            <Trash2 size={14} />
            Clear All Notifications
          </button>
        </div>
      )}
    </div>
  );
};
