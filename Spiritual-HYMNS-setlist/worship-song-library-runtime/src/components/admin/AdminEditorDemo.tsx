/**
 * Admin Song Editor Demo / Test Page
 * 
 * This component demonstrates the admin editor in isolation.
 * To integrate into main app, add a route or state to show this when admin clicks "Edit Song"
 */

import { AdminSongEditor } from './AdminSongEditor';

export function AdminEditorDemo() {
  return (
    <div className="min-h-screen min-w-full">
      <AdminSongEditor
        onClose={() => {
          console.log('Editor closed');
          // TODO: Navigate back or close panel
        }}
      />
    </div>
  );
}
