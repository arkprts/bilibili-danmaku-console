'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Gift, User } from 'lucide-react';
import type { DanmakuItem } from '@/store';

interface GiftCardProps {
  gift: DanmakuItem;
}

export function GiftCard({ gift }: GiftCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-danmaku-gold/5 border border-danmaku-gold/20'
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={gift.userAvatar} />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{gift.username}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Gift className="h-4 w-4 text-danmaku-gold" />
          <span className="text-sm text-danmaku-gold">
            {gift.giftName || '礼物'}
          </span>
          <Badge variant="secondary" className="text-xs">
            x{gift.giftCount || 1}
          </Badge>
        </div>
      </div>

      <span className="text-xs text-muted-foreground">
        {new Date(gift.timestamp).toLocaleTimeString('zh-CN')}
      </span>
    </div>
  );
}
