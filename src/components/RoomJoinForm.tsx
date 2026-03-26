'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn, Users, Wifi, WifiOff } from 'lucide-react';

interface RoomJoinFormProps {
  onJoin: (roomId: string) => void;
}

export function RoomJoinForm({ onJoin }: RoomJoinFormProps) {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setIsLoading(true);
    onJoin(roomId.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Bilibili 弹幕控制台</h1>
          <p className="text-muted-foreground">
            实时观看直播间弹幕、礼物和SC
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="roomId" className="text-sm font-medium">
              直播间 ID
            </label>
            <Input
              id="roomId"
              type="text"
              placeholder="例如: 23365207"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="h-12 text-lg"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || !roomId.trim()}>
            {isLoading ? (
              '连接中...'
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                进入直播间
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>多人同步</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span>实时更新</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>离线存储</span>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          基于 @laplace.live/ws 构建
        </div>
      </div>
    </div>
  );
}
