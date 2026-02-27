# Unified Notification System Documentation

## Overview

A comprehensive custom notification system that replaces all browser pop-ups (alert, confirm, prompt) with beautiful, healthcare-themed toast notifications and confirmation dialogs.

## Features

✅ **Toast Notifications** - Non-blocking, auto-dismissing messages
✅ **Confirmation Dialogs** - Modal dialogs for confirmations
✅ **4 Notification Types** - Success, Error, Warning, Info
✅ **Custom Actions** - Add clickable buttons to toasts
✅ **Auto-dismiss** - Configurable timeouts
✅ **Healthcare UI** - Clinic color palette (green/teal/white)
✅ **Accessible** - ARIA labels, keyboard support
✅ **Responsive** - Mobile-friendly design
✅ **Provider-based** - Global state management with React Context

---

## Architecture

### Files Structure

```
src/
├── types/
│   └── notifications.ts           # Type definitions
├── context/
│   └── NotificationContext.tsx    # Context provider
├── hooks/
│   └── useNotification.ts         # Custom hook
└── components/notifications/
    ├── Toast.tsx                  # Toast component
    ├── ConfirmationDialog.tsx     # Confirmation dialog component
    └── NotificationManager.tsx    # Manager component
```

---

## Quick Start

### 1. Server Wrap (Already done in App.tsx)

```tsx
import { NotificationProvider } from './context/NotificationContext';
import { NotificationManager } from './components/notifications/NotificationManager';

function App() {
  return (
    <NotificationProvider>
      <YourApp />
      <NotificationManager />  {/* Renders toasts & dialogs */}
    </NotificationProvider>
  );
}
```

### 2. Use in Component

```tsx
import { useNotification } from '../hooks/useNotification';

export const MyComponent = () => {
  const { success, error, warning, info } = useNotification();

  return (
    <button onClick={() => success('Action completed!')}>
      Click Me
    </button>
  );
};
```

---

## Usage Examples

### Toast Notifications (Auto-dismissing)

#### Success Notification
```tsx
const { success } = useNotification();

// Simple message
success('Your profile has been updated');

// With title
success('Your profile has been updated', 'Profile Updated');
```

#### Error Notification
```tsx
const { error } = useNotification();

// Simple message
error('Failed to save changes');

// With title
error('Failed to save changes. Please try again.', 'Save Error');
```

#### Warning Notification
```tsx
const { warning } = useNotification();

warning('Please select a date before continuing', 'Missing Information');
```

#### Info Notification
```tsx
const { info } = useNotification();

info('File upload dialog opened');
info('Loading patient records...', 'Processing');
```

---

### Advanced: Custom Toast with Actions

```tsx
const { showToast } = useNotification();

showToast({
  type: 'success',
  title: 'Download Complete',
  message: 'Your medical records are ready',
  duration: 5000,  // Auto-dismiss after 5 seconds
  action: {
    label: 'Open File',
    onClick: () => {
      // Handle custom action
      console.log('File opened');
    }
  }
});
```

---

### Confirmation Dialogs (Modal)

#### Basic Confirmation
```tsx
const { showConfirmation } = useNotification();

const handleDelete = async () => {
  const confirmed = await showConfirmation({
    title: 'Delete Record?',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel'
  });

  if (confirmed) {
    // Delete logic here
  }
};
```

#### Dangerous Action (Red styling)
```tsx
const confirmed = await showConfirmation({
  title: 'Delete Patient Record',
  message: 'Permanently delete all medical records for this patient? This cannot be undone.',
  confirmLabel: 'Delete Permanently',
  cancelLabel: 'Cancel',
  isDangerous: true,  // Red styling
  onConfirm: async () => {
    await api.deletePatient(patientId);
  }
});
```

#### With Loading State
```tsx
const confirmed = await showConfirmation({
  title: 'Confirm Export',
  message: 'Export all medical records to PDF?',
  confirmLabel: 'Export',
  onConfirm: async () => {
    // The dialog will show loading state automatically
    await api.exportRecords();
  }
});
```

---

## Real-World Examples

### Example 1: Book Appointment

**Before (with alerts):**
```tsx
const handleBookAppointment = async () => {
  if (!appointmentData.date) {
    alert('Please select a date');
    return;
  }
  try {
    await bookAppointment(appointmentData);
    alert(`Appointment booked for ${appointmentData.date}`);
    setShowModal(false);
  } catch (error) {
    alert('Failed to book appointment');
  }
};
```

**After (with notifications):**
```tsx
import { useNotification } from '../hooks/useNotification';

const handleBookAppointment = async () => {
  const { warning, success, error } = useNotification();

  if (!appointmentData.date) {
    warning('Please select a date before confirming');
    return;
  }

  try {
    await bookAppointment(appointmentData);
    success(
      `Appointment booked for ${appointmentData.date} at ${appointmentData.time}`,
      'Booking Confirmed'
    );
    setShowModal(false);
  } catch (err) {
    error('Failed to book appointment. Please try again.');
  }
};
```

### Example 2: Export Medical History

**Before:**
```tsx
<button onClick={() => alert('Exporting your medical history...')}>
  Export
</button>
```

**After:**
```tsx
import { useNotification } from '../hooks/useNotification';

export const ExportButton = () => {
  const { success } = useNotification();

  return (
    <button
      onClick={() => success(
        'Your medical history has been exported. Check your downloads folder.',
        'Export Complete'
      )}
    >
      Export
    </button>
  );
};
```

### Example 3: Delete Record with Confirmation

**Before:**
```tsx
const handleDeleteRecord = () => {
  if (window.confirm('Are you sure you want to delete this record?')) {
    deleteRecord(recordId);
    alert('Record deleted successfully');
  }
};
```

**After:**
```tsx
import { useNotification } from '../hooks/useNotification';

const handleDeleteRecord = async () => {
  const { showConfirmation, success, error } = useNotification();

  const confirmed = await showConfirmation({
    title: 'Delete Medical Record?',
    message: 'This action cannot be undone. Are you sure?',
    confirmLabel: 'Delete Record',
    cancelLabel: 'Keep Record',
    isDangerous: true,
    onConfirm: async () => {
      await deleteRecord(recordId);
      success('Record deleted successfully', 'Deleted');
    }
  });
};
```

### Example 4: Upload Document

**Before:**
```tsx
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  alert('File upload dialog opened');
  // Upload logic...
};
```

**After:**
```tsx
import { useNotification } from '../hooks/useNotification';

export const FileUploadButton = () => {
  const { info, success, error } = useNotification();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    info(`Uploading ${file.name}...`);

    try {
      await uploadFile(file);
      success(
        `${file.name} uploaded successfully`,
        'Upload Complete'
      );
    } catch (err) {
      error(`Failed to upload ${file.name}. Please try again.`);
    }
  };

  return <input type="file" onChange={handleFileUpload} />;
};
```

### Example 5: Form Validation

**Before:**
```tsx
const handleSubmit = (e) => {
  e.preventDefault();
  if (!email) {
    alert('Email is required');
    return;
  }
  // Submit...
};
```

**After:**
```tsx
import { useNotification } from '../hooks/useNotification';

export const SignUpForm = () => {
  const { warning } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      warning('Email address is required to continue', 'Missing Email');
      return;
    }
    // Submit...
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

---

## Notification Types & Styling

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| **success** | Green (emerald) | CheckCircle2 | Operation completed, saved, created |
| **error** | Red | AlertCircle | Operation failed, validation error |
| **warning** | Amber (orange) | AlertTriangle | Missing input, caution needed |
| **info** | Blue | Info | Informational message, processing |

---

## Auto-dismiss Timeouts

```tsx
const { showToast } = useNotification();

// Success: 4000ms (4 seconds)
success('Item saved');

// Error: 5000ms (5 seconds)
error('Something went wrong');

// Warning: 4000ms (4 seconds)
warning('Check this field');

// Info: 4000ms (4 seconds)
info('Processing...');

// Custom: no auto-dismiss
showToast({
  type: 'info',
  message: 'This stays until manually closed',
  duration: undefined  // No auto-dismiss
});
```

---

## Accessibility Features

✅ **ARIA Labels** - All components have proper aria-live and aria-label attributes
✅ **Keyboard Navigation** - Dialogs can be closed with Escape key
✅ **Color Contrast** - All text meets WCAG AA standards
✅ **Screen Readers** - Toasts announced to screen readers

---

## Mobile Responsive

- Toasts appear in bottom-right corner on desktop
- Toast width adapts to screen size
- Confirmation dialogs responsive on all screen sizes
- Touch-friendly button sizes

---

## Complete API Reference

### useNotification() Hook

```tsx
const {
  // Toast methods
  showToast: (toast: Omit<Toast, 'id'>) => void,
  dismissToast: (id: string) => void,
  success: (message: string, title?: string) => void,
  error: (message: string, title?: string) => void,
  warning: (message: string, title?: string) => void,
  info: (message: string, title?: string) => void,

  // Confirmation method
  showConfirmation: (dialog: Omit<ConfirmationDialog, 'id'>) => Promise<boolean>
} = useNotification();
```

### Toast Type Definition

```tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;  // undefined = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### ConfirmationDialog Type Definition

```tsx
interface ConfirmationDialog {
  id: string;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;  // Red styling for delete actions
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
```

---

## Pages Updated

✅ **Appointments.tsx** - Book appointment confirmation
✅ **MedicalRecords.tsx** - Record operations, export
✅ **Patients.tsx** - Patient registration, downloads
✅ **Users.tsx** - User creation, management
✅ **Settings.tsx** - Profile updates
✅ **Reports.tsx** - Data export

---

## Migration Checklist

When migrating from alerts to notifications:

- [ ] Import `useNotification` hook
- [ ] Replace `alert()` with `success()`, `error()`, `warning()`, or `info()`
- [ ] Replace `confirm()` with `showConfirmation()`
- [ ] Test all notification messages
- [ ] Verify mobile responsiveness
- [ ] Check accessibility with screen reader
- [ ] Update unit tests if applicable

---

## Troubleshooting

### Notification not showing?
1. Ensure `NotificationManager` is rendered in App.tsx
2. Ensure component is wrapped with `NotificationProvider`
3. Check browser console for errors

### Dialog not dismissing?
1. Ensure `onConfirm` and `onCancel` callbacks are provided
2. Check that async operations complete successfully
3. Ensure `await` is used for async operations

### Styling issues?
1. Ensure Tailwind CSS is properly configured
2. Check that color classes are not purged in production
3. Verify lucide icons are installed

---

## Best Practices

1. **Use appropriate notification type:**
   - ✅ Success: "Profile updated"
   - ❌ Success: "An error occurred"

2. **Keep messages concise** (under 100 characters when possible)
   - ✅ "Patient registered successfully"
   - ❌ "The patient record has been successfully registered in the system and all validations have passed"

3. **Use titles for context:**
   - ✅ `success('Record saved', 'Save Complete')`
   - ❌ `success('Record saved')`  (unclear what was saved)

4. **Confirmation for destructive actions:**
   - Always use `showConfirmation()` for delete operations
   - Mark as `isDangerous: true` for visual warning

5. **Don't overuse notifications:**
   - ❌ Show for every form input change
   - ✅ Show only for important user actions

---

## Future Enhancements

- [ ] Toast position customization
- [ ] Custom toast templates
- [ ] Notification history
- [ ] Undo functionality for certain actions
- [ ] Sound notifications (opt-in)
- [ ] Toast stacking animation improvements
- [ ] Persistent notifications (not auto-dismissed)
