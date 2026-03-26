'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star, User } from 'lucide-react';
import type { DanmakuItem } from '@/store';

interface SCCardProps {
  sc: DanmakuItem;
}

export function SCCard({ sc }: SCCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg bg-danmaku-purple/5 border border-danmaku-purple/20'
      )}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={sc.userAvatar} />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold truncate">{sc.username}</span>
          <Badge
            className="bg-danmaku-purple/20 text-danmaku-purple border-danmaku-purple/30"
          >
            <Star className="h-3 w-3 mr-1" />
            ¥{sc.scAmount || 0}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(sc.timestamp).toLocaleTimeString('zh-CN')}
          </span>
        </div>
        <p className="text-sm mt-2 break-words whitespace-pre-wrap">
          {sc.content}
        </p>
      </div>
    </div>
  );
}
