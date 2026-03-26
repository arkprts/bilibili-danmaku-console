'use client';

import { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { RoomJoinForm } from '@/components/RoomJoinForm';

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background">
      {roomId ? (
        <Dashboard roomId={roomId} onLeave={() => setRoomId(null)} />
      ) : (
        <RoomJoinForm onJoin={setRoomId} />
      )}
    </main>
  );
}
