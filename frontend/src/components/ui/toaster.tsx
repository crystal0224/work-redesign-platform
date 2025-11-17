'use client'

import { toast } from 'react-toastify'

export function Toaster() {
  return null // react-toastify ToastContainer is handled in providers
}

// Helper functions for toast notifications
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
}