'use client';

import { useAppStore } from '@/store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MessageSquare } from 'lucide-react';

export function SettingsPanel() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          显示设置
        </h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="showDanmaku" className="flex flex-col">
            <span>显示弹幕</span>
          </Label>
          <Switch
            id="showDanmaku"
            checked={settings.showDanmaku}
            onCheckedChange={(checked) => updateSettings({ showDanmaku: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showGift" className="flex flex-col">
            <span>显示礼物</span>
          </Label>
          <Switch
            id="showGift"
            checked={settings.showGift}
            onCheckedChange={(checked) => updateSettings({ showGift: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showSC" className="flex flex-col">
            <span>显示 SC</span>
          </Label>
          <Switch
            id="showSC"
            checked={settings.showSC}
            onCheckedChange={(checked) => updateSettings({ showSC: checked })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">弹幕设置</h3>

        <div className="space-y-2">
          <Label>弹幕速度: {settings.danmakuSpeed}</Label>
          <Slider
            value={[settings.danmakuSpeed]}
            onValueChange={([value]) => updateSettings({ danmakuSpeed: value })}
            min={1}
            max={10}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>弹幕透明度: {Math.round(settings.danmakuOpacity * 100)}%</Label>
          <Slider
            value={[settings.danmakuOpacity * 100]}
            onValueChange={([value]) => updateSettings({ danmakuOpacity: value / 100 })}
            min={30}
            max={100}
            step={5}
          />
        </div>

        <div className="space-y-2">
          <Label>字体大小</Label>
          <Select
            value={settings.fontSize}
            onValueChange={(value: 'small' | 'medium' | 'large') => updateSettings({ fontSize: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">小</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="large">大</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">主题</h3>

        <div className="space-y-2">
          <Label>外观</Label>
          <Select
            value={settings.theme}
            onValueChange={(value: 'dark' | 'light' | 'auto') => updateSettings({ theme: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">深色</SelectItem>
              <SelectItem value="light">浅色</SelectItem>
              <SelectItem value="auto">跟随系统</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          互动设置
        </h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="soundEnabled" className="flex flex-col">
            <span>声音提醒</span>
          </Label>
          <Switch
            id="soundEnabled"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="ttsEnabled" className="flex flex-col">
            <span>TTS 朗读</span>
          </Label>
          <Switch
            id="ttsEnabled"
            checked={settings.ttsEnabled}
            onCheckedChange={(checked) => updateSettings({ ttsEnabled: checked })}
          />
        </div>
      </div>
    </div>
  );
}
