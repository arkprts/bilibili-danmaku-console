'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DanmakuItemCard } from './DanmakuItemCard';

export function DanmakuList() {
  const { danmakuList, clearDanmaku, settings } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isAutoScrollRef.current = scrollTop < 50;
    }
  }, []);

  useEffect(() => {
    if (isAutoScrollRef.current && danmakuList.length > 0) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      });
    }
  }, [danmakuList.length]);

  if (!settings.showDanmaku) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        弹幕已隐藏
      </div>
    );
  }

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[settings.fontSize];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-sm text-muted-foreground">
          {danmakuList.length} 条弹幕
        </span>
        <Button variant="ghost" size="sm" onClick={clearDanmaku}>
          <Trash2 className="h-4 w-4 mr-2" />
          清空
        </Button>
      </div>

      <ScrollArea
        ref={scrollRef}
        className="flex-1"
        onScroll={handleScroll}
      >
        <div className="p-4 space-y-2">
          {danmakuList.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              暂无弹幕，等待连接...
            </div>
          ) : (
            danmakuList.map((item) => (
              <DanmakuItemCard
                key={item.id}
                item={item}
                className={fontSizeClass}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
