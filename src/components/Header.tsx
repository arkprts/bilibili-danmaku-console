'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, RefreshCw, Users, Radio } from 'lucide-react';
import { useAppStore } from '@/store';

interface HeaderProps {
  onLeave: () => void;
}

export function Header({ onLeave }: HeaderProps) {
  const { currentRoom, isConnected, isConnecting, reconnect } = useAppStore();

  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={currentRoom?.anchorAvatar} />
            <AvatarFallback>{currentRoom?.anchorName?.[0] || '?'}</AvatarFallback>
          </Avatar>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">{currentRoom?.roomName || '加载中...'}</h1>
              <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                {isConnecting ? '连接中' : isConnected ? '已连接' : '未连接'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              主播: {currentRoom?.anchorName || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentRoom?.onlineCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{currentRoom.onlineCount.toLocaleString()}</span>
            </div>
          )}

          {currentRoom?.fansCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radio className="h-4 w-4" />
              <span>{currentRoom.fansCount.toLocaleString()}</span>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={reconnect} disabled={isConnecting}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
            重连
          </Button>

          <Button variant="destructive" size="sm" onClick={onLeave}>
            <LogOut className="h-4 w-4 mr-2" />
            退出
          </Button>
        </div>
      </div>
    </header>
  );
}
