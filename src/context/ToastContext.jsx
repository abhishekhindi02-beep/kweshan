import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    let title = 'Notification';
    let message = '';
    let type = 'success';
    let duration = 3500;

    if (typeof toastData === 'string') {
      message = toastData;
    } else if (toastData && typeof toastData === 'object') {
      title = toastData.title || (toastData.type === 'error' ? 'Error' : toastData.type === 'warning' ? 'Notice' : 'Success');
      message = toastData.message || toastData.text || '';
      type = toastData.type || 'success';
      duration = toastData.duration || 3500;
    }

    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const showToast = useCallback((messageOrObj, type = 'success') => {
    if (typeof messageOrObj === 'string') {
      addToast({
        title: type === 'error' ? 'Validation Notice' : type === 'info' ? 'Update' : 'Success',
        message: messageOrObj,
        type
      });
    } else {
      addToast(messageOrObj);
    }
  }, [addToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toasts: [],
      addToast: () => {},
      showToast: () => {},
      removeToast: () => {}
    };
  }
  return ctx;
}
