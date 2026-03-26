'use client';

import { useAppStore } from '@/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, CircleDollarSign } from 'lucide-react';
import { useState, useMemo } from 'react';
import { SCCard } from './SCCard';

export function SCPanel() {
  const { scList, clearSC, settings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSC = useMemo(() => {
    if (!searchQuery.trim()) return scList;
    const query = searchQuery.toLowerCase();
    return scList.filter(
      (sc) =>
        sc.username.toLowerCase().includes(query) ||
        sc.content.toLowerCase().includes(query)
    );
  }, [scList, searchQuery]);

  const totalAmount = useMemo(() => {
    return scList.reduce((acc, sc) => acc + (sc.scAmount || 0), 0);
  }, [scList]);

  if (!settings.showSC) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        SC 已隐藏
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredSC.length} 条 SC (¥{totalAmount.toFixed(2)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索 SC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-40"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearSC}>
            <Trash2 className="h-4 w-4 mr-2" />
            清空
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredSC.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <CircleDollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              暂无 SC 记录
            </div>
          ) : (
            filteredSC.map((sc) => (
              <SCCard key={sc.id} sc={sc} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
