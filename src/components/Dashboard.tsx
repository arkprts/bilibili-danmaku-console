'use client';

import { Header } from './Header';
import { DanmakuList } from './DanmakuList';
import { GiftPanel } from './GiftPanel';
import { SCPanel } from './SCPanel';
import { SettingsPanel } from './SettingsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, Gift, CircleDollarSign, Settings } from 'lucide-react';
import { useDanmakuConnection } from '@/hooks';

interface DashboardProps {
  roomId: string;
  onLeave: () => void;
}

export function Dashboard({ roomId, onLeave }: DashboardProps) {
  const { disconnect } = useDanmakuConnection({
    roomId,
    enabled: true,
  });

  return (
    <div className="flex flex-col h-screen">
      <Header
        onLeave={() => {
          disconnect();
          onLeave();
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col">
          <Tabs defaultValue="danmaku" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="danmaku" className="gap-2">
                <Video className="h-4 w-4" />
                弹幕
              </TabsTrigger>
              <TabsTrigger value="gift" className="gap-2">
                <Gift className="h-4 w-4" />
                礼物
              </TabsTrigger>
              <TabsTrigger value="sc" className="gap-2">
                <CircleDollarSign className="h-4 w-4" />
                SC
              </TabsTrigger>
            </TabsList>

            <TabsContent value="danmaku" className="flex-1 m-0">
              <DanmakuList />
            </TabsContent>

            <TabsContent value="gift" className="flex-1 m-0">
              <GiftPanel />
            </TabsContent>

            <TabsContent value="sc" className="flex-1 m-0">
              <SCPanel />
            </TabsContent>
          </Tabs>
        </main>

        <aside className="w-80 border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              设置
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <SettingsPanel />
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
