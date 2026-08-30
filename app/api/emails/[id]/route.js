// app/api/emails/[id]/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';
import { OpenEvent } from '@/lib/models/OpenEvent';

export async function DELETE(req, context) {
  const { id } = await context.params;

  try {
    await connectDB();
    await OpenEvent.deleteMany({ trackedEmailId: id });
    await TrackedEmail.deleteOne({ _id: id });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  }
}
