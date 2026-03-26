'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Gift, Star, CheckCircle } from 'lucide-react';
import type { DanmakuItem } from '@/store';

interface DanmakuItemCardProps {
  item: DanmakuItem;
  className?: string;
}

export function DanmakuItemCard({ item, className }: DanmakuItemCardProps) {
  const getTypeColor = () => {
    switch (item.type) {
      case 'gift':
        return 'border-l-danmaku-gold bg-danmaku-gold/5';
      case 'sc':
      case 'superchat':
        return 'border-l-danmaku-purple bg-danmaku-purple/5';
      default:
        return 'border-l-transparent';
    }
  };

  const getTypeIcon = () => {
    if (item.type === 'gift') {
      return <Gift className="h-4 w-4 text-danmaku-gold" />;
    }
    if (item.type === 'sc' || item.type === 'superchat') {
      return <Star className="h-4 w-4 text-danmaku-purple" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border-l-4 bg-card hover:bg-card/80 transition-colors',
        getTypeColor(),
        className
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={item.userAvatar} />
        <AvatarFallback>{item.username?.[0] || '?'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{item.username}</span>

          {item.isVerified && (
            <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
          )}

          {item.userTitle && (
            <Badge variant="secondary" className="text-xs">
              {item.userTitle}
            </Badge>
          )}

          {getTypeIcon()}

          {item.type === 'gift' && item.giftName && (
            <span className="text-sm text-danmaku-gold">
              送出 {item.giftName} x{item.giftCount}
            </span>
          )}

          {item.type === 'sc' && item.scAmount && (
            <span className="text-sm text-danmaku-purple font-medium">
              ¥{item.scAmount}
            </span>
          )}

          <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
            {new Date(item.timestamp).toLocaleTimeString('zh-CN')}
          </span>
        </div>

        <p className="text-sm mt-1 break-words">{item.content}</p>
      </div>
    </div>
  );
}
