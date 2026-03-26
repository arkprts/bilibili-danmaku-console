'use client';

import { useAppStore } from '@/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, Gift as GiftIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { GiftCard } from './GiftCard';

export function GiftPanel() {
  const { giftList, clearGifts, settings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGifts = useMemo(() => {
    if (!searchQuery.trim()) return giftList;
    const query = searchQuery.toLowerCase();
    return giftList.filter(
      (gift) =>
        gift.username.toLowerCase().includes(query) ||
        gift.giftName?.toLowerCase().includes(query)
    );
  }, [giftList, searchQuery]);

  const totalGifts = useMemo(() => {
    return giftList.reduce((acc, gift) => acc + (gift.giftCount || 1), 0);
  }, [giftList]);

  if (!settings.showGift) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        礼物已隐藏
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredGifts.length} 条礼物 ({totalGifts} 个)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索礼物..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-40"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearGifts}>
            <Trash2 className="h-4 w-4 mr-2" />
            清空
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGifts.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              <GiftIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              暂无礼物记录
            </div>
          ) : (
            filteredGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
