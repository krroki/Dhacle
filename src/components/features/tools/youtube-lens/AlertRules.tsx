'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Json } from '@/types';

// Threshold value type
interface ThresholdValue {
  value: number;
  operator: string;
  [key: string]: Json | undefined; // Allow other properties for Json compatibility
}

// Type guard for threshold value
function isThresholdValue(value: unknown): value is ThresholdValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    'operator' in value &&
    typeof (value as ThresholdValue).value === 'number' &&
    typeof (value as ThresholdValue).operator === 'string'
  );
}

// Component-specific type for non-null channel_id
interface AlertRule {
  id: string;
  channel_id: string;
  rule_type: string;
  condition: string;
  metric: string;
  name: string;
  threshold_value: ThresholdValue | Json;
  is_active: boolean | null;
  created_at: string | null;
  user_id: string;
}

interface AlertRulesProps {
  channelId?: string;
}

export default function AlertRules({ channelId }: AlertRulesProps) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRuleType, setNewRuleType] = useState('subscriber_threshold');
  const [thresholdValue, setThresholdValue] = useState('');
  const [operator, setOperator] = useState('greater_than');
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const loadAlertRules = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('channel_id', channelId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter out rules with null channel_id and map to our interface
      const validRules = (data || [])
        .filter(rule => rule.channel_id !== null)
        .map(rule => ({
          id: rule.id,
          channel_id: rule.channel_id!,
          rule_type: rule.rule_type,
          condition: rule.condition,
          metric: rule.metric,
          name: rule.name,
          threshold_value: rule.threshold_value,
          is_active: rule.is_active,
          created_at: rule.created_at,
          user_id: rule.user_id
        }));
      setRules(validRules);
    } catch (error) {
      console.error('Error loading alert rules:', error);
      toast({
        title: '오류',
        description: '알림 규칙을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [channelId, supabase, toast, setLoading, setRules]);

  useEffect(() => {
    if (channelId) {
      loadAlertRules();
    }
  }, [channelId, loadAlertRules]);

  const createRule = async () => {
    if (!channelId) {
      toast({
        title: '채널 선택 필요',
        description: '알림 규칙을 생성하려면 먼저 채널을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!thresholdValue) {
      toast({
        title: '입력 오류',
        description: '임계값을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: '인증 오류',
          description: '로그인이 필요합니다.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('alert_rules')
        .insert({
          channel_id: channelId,
          rule_type: newRuleType,
          condition: operator === 'greater_than' ? 'greater_than' : operator === 'less_than' ? 'less_than' : 'change_percent',
          metric: newRuleType.includes('subscriber') ? 'subscriber_count' : newRuleType.includes('view') ? 'view_count' : 'video_count',
          name: `${newRuleType} alert for channel`,
          threshold_value: {
            value: Number(thresholdValue),
            operator: operator,
          },
          user_id: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      if (data && data.channel_id) {
        const newRule: AlertRule = {
          id: data.id,
          channel_id: data.channel_id,
          rule_type: data.rule_type,
          condition: data.condition,
          metric: data.metric,
          name: data.name,
          threshold_value: data.threshold_value,
          is_active: data.is_active,
          created_at: data.created_at,
          user_id: data.user_id
        };
        setRules([newRule, ...rules]);
      }
      setThresholdValue('');
      toast({
        title: '성공',
        description: '알림 규칙이 생성되었습니다.',
      });
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: '오류',
        description: '알림 규칙 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setRules(rules.map(rule =>
        rule.id === ruleId ? { ...rule, is_active: isActive as boolean | null } : rule
      ));

      toast({
        title: '성공',
        description: `알림 규칙이 ${isActive ? '활성화' : '비활성화'}되었습니다.`,
      });
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: '오류',
        description: '알림 규칙 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setRules(rules.filter(rule => rule.id !== ruleId));
      toast({
        title: '성공',
        description: '알림 규칙이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: '오류',
        description: '알림 규칙 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'subscriber_threshold': '구독자 수 변화',
      'view_threshold': '조회수 변화',
      'video_uploaded': '새 비디오 업로드',
      'video_threshold': '비디오 수 변화',
    };
    return labels[type] || type;
  };

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      'greater_than': '이상',
      'less_than': '이하',
      'equals': '같음',
    };
    return labels[operator] || operator;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>알림 규칙</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!channelId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>알림 규칙</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            먼저 채널을 선택해주세요.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 규칙</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 새 규칙 추가 폼 */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">새 알림 규칙 추가</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rule-type">알림 유형</Label>
              <Select value={newRuleType} onValueChange={setNewRuleType}>
                <SelectTrigger id="rule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscriber_threshold">구독자 수 변화</SelectItem>
                  <SelectItem value="view_threshold">조회수 변화</SelectItem>
                  <SelectItem value="video_uploaded">새 비디오 업로드</SelectItem>
                  <SelectItem value="video_threshold">비디오 수 변화</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newRuleType !== 'video_uploaded' && (
              <>
                <div>
                  <Label htmlFor="operator">조건</Label>
                  <Select value={operator} onValueChange={setOperator}>
                    <SelectTrigger id="operator">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater_than">이상</SelectItem>
                      <SelectItem value="less_than">이하</SelectItem>
                      <SelectItem value="equals">같음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="threshold">임계값</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="예: 1000"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <Button onClick={createRule} className="w-full md:w-auto">
            규칙 추가
          </Button>
        </div>

        {/* 기존 규칙 목록 */}
        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              등록된 알림 규칙이 없습니다.
            </p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {getRuleTypeLabel(rule.rule_type)}
                  </p>
                  {rule.threshold_value && isThresholdValue(rule.threshold_value) && (
                    <p className="text-sm text-muted-foreground">
                      {getOperatorLabel(rule.threshold_value.operator || '')} {rule.threshold_value.value}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Switch
                    checked={rule.is_active ?? false}
                    onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}