/**
 * YouTube Lens - Alert Rules Component
 * 알림 규칙 설정 및 관리 UI
 * Created: 2025-01-21
 */

'use client';

import {
  AlertTriangle,
  BarChart,
  Bell,
  Check,
  Clock,
  Edit,
  Eye,
  Info,
  Plus,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase/client';
import type { AlertCondition, AlertMetric, AlertRule, AlertRuleType } from '@/types/youtube-lens';

interface AlertRulesProps {
  folderId?: string;
  channelId?: string;
  onRuleCreated?: (rule: AlertRule) => void;
}

export default function AlertRules({ folderId, channelId, onRuleCreated }: AlertRulesProps) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [_editingRule, setEditingRule] = useState<string | null>(null);

  // Form state for new rule
  const [newRule, setNewRule] = useState<{
    name: string;
    ruleType: AlertRuleType;
    metric: AlertMetric;
    thresholdValue: number;
    condition: AlertCondition;
    cooldownHours: number;
    is_active: boolean;
    notifyEmail: boolean;
    notifyApp: boolean;
  }>({
    name: '',
    ruleType: 'threshold',
    metric: 'views',
    thresholdValue: 0,
    condition: 'greater_than' as AlertCondition,
    cooldownHours: 1,
    is_active: true,
    notifyEmail: true,
    notifyApp: false,
  });

  // Load existing rules
  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      let query = supabase
        .from('alertRules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (folderId) {
        query = query.eq('scopeId', folderId).eq('scope', 'folder');
      }
      if (channelId) {
        query = query.eq('scopeId', channelId).eq('scope', 'channel');
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setRules(data || []);
    } catch (_error) {
      toast.error('알림 규칙을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [folderId, channelId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const createRule = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('alertRules')
        .insert({
          ...newRule,
          user_id: user.id,
          scope: folderId ? 'folder' : channelId ? 'channel' : 'video',
          scopeId: folderId || channelId || null,
          description: null,
          metricType:
            newRule.metric === 'views'
              ? 'view_count'
              : newRule.metric === 'vph'
                ? 'vph'
                : newRule.metric === 'engagement'
                  ? 'engagementRate'
                  : 'viralScore',
          comparisonOperator:
            newRule.condition === 'greater_than'
              ? '>'
              : newRule.condition === 'less_than'
                ? '<'
                : '=',
          triggerCount: 0,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      const rule = data;

      setRules([rule, ...rules]);
      setIsCreating(false);
      setNewRule({
        name: '',
        ruleType: 'threshold',
        metric: 'views',
        thresholdValue: 0,
        condition: 'greater_than' as AlertCondition,
        cooldownHours: 1,
        is_active: true,
        notifyEmail: true,
        notifyApp: false,
      });

      toast.success('새로운 알림 규칙이 생성되었습니다.');
      onRuleCreated?.(rule);
    } catch (_error) {
      toast.error('알림 규칙 생성에 실패했습니다.');
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<AlertRule>) => {
    try {
      const { data, error } = await supabase
        .from('alertRules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setRules(rules.map((r) => (r.id === ruleId ? data : r)));
      setEditingRule(null);

      toast.success('알림 규칙이 수정되었습니다.');
    } catch (_error) {
      toast.error('알림 규칙 수정에 실패했습니다.');
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase.from('alertRules').delete().eq('id', ruleId);

      if (error) {
        throw error;
      }

      setRules(rules.filter((r) => r.id !== ruleId));

      toast.success('알림 규칙이 삭제되었습니다.');
    } catch (_error) {
      toast.error('알림 규칙 삭제에 실패했습니다.');
    }
  };

  const getMetricIcon = (metric: AlertMetric) => {
    switch (metric) {
      case 'views':
        return <Eye className="h-4 w-4" />;
      case 'vph':
        return <TrendingUp className="h-4 w-4" />;
      case 'engagement':
        return <BarChart className="h-4 w-4" />;
      case 'viralScore':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertTypeColor = (type: AlertRuleType) => {
    switch (type) {
      case 'threshold':
        return 'default';
      case 'trend':
        return 'secondary';
      case 'anomaly':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">알림 규칙을 불러오는 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            알림 규칙
          </h2>
          <p className="text-muted-foreground mt-1">
            중요한 지표 변화를 실시간으로 감지하고 알림을 받으세요
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />새 규칙 만들기
        </Button>
      </div>

      {/* Create New Rule Form */}
      {isCreating && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>새 알림 규칙 만들기</CardTitle>
            <CardDescription>모니터링할 지표와 조건을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">규칙 이름</Label>
                <Input
                  id="rule-name"
                  placeholder="예: 조회수 급증 알림"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-type">알림 유형</Label>
                <Select
                  value={newRule.ruleType}
                  onValueChange={(value: AlertRuleType) =>
                    setNewRule({ ...newRule, ruleType: value })
                  }
                >
                  <SelectTrigger id="alert-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threshold">임계값 초과</SelectItem>
                    <SelectItem value="trend">추세 변화</SelectItem>
                    <SelectItem value="anomaly">이상치 감지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metric-type">모니터링 지표</Label>
                <Select
                  value={newRule.metric}
                  onValueChange={(value: AlertMetric) => setNewRule({ ...newRule, metric: value })}
                >
                  <SelectTrigger id="metric-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">조회수</SelectItem>
                    <SelectItem value="vph">VPH (시간당 조회수)</SelectItem>
                    <SelectItem value="engagement">참여율</SelectItem>
                    <SelectItem value="viralScore">바이럴 점수</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator">비교 조건</Label>
                <Select
                  value={newRule.condition}
                  onValueChange={(value: AlertCondition) =>
                    setNewRule({ ...newRule, condition: value })
                  }
                >
                  <SelectTrigger id="operator">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greaterThan">초과</SelectItem>
                    <SelectItem value="lessThan">미만</SelectItem>
                    <SelectItem value="change_percent">변화율</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">임계값</Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="예: 10000"
                  value={newRule.thresholdValue}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      thresholdValue: Number.parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooldown">쿨다운 시간 (시간)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  placeholder="1"
                  value={newRule.cooldownHours}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      cooldownHours: Number.parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="active">활성화</Label>
                <Switch
                  id="active"
                  checked={newRule.is_active}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button onClick={createRule} disabled={!newRule.name}>
                <Check className="h-4 w-4 mr-2" />
                생성
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <div className="grid gap-4">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>아직 생성된 알림 규칙이 없습니다.</p>
                <p className="text-sm mt-2">새 규칙을 만들어 중요한 지표를 모니터링하세요.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{rule.name}</h3>
                      <Badge variant={getAlertTypeColor(rule.ruleType)}>{rule.ruleType}</Badge>
                      {!rule.is_active && <Badge variant="outline">비활성</Badge>}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getMetricIcon(rule.metric)}
                        <span>{rule.metric}</span>
                      </div>
                      <div>
                        {rule.condition === 'greater_than' && '>'}
                        {rule.condition === 'less_than' && '<'}
                        {rule.condition === 'change_percent' && '변화율'} {rule.thresholdValue}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>쿨다운 {rule.cooldownHours}시간</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => updateRule(rule.id, { is_active: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
