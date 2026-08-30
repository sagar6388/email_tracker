'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteEmailButton({ id }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this tracked email and all its opens? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await fetch(`/api/emails/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      style={{ color: '#c00', background: 'none', border: '1px solid #c00', borderRadius: 4, fontSize: '0.75rem', padding: '2px 8px', cursor: 'pointer' }}
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  );
}
