// ✅ 새 파일 전체 내용
import type { Database } from '@/types/database.generated';

// 모든 테이블명 Union type
export type TableName = keyof Database['public']['Tables'];

// 테이블별 Row 타입 추출
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// 백업 대상 테이블 (단계적 접근 - 핵심 테이블 우선)
export const CORE_BACKUP_TABLES: TableName[] = [
  'users',
  'youtube_favorites', 
  'collections',
  'collection_items'
] as const;

export const EXTENDED_BACKUP_TABLES: TableName[] = [
  ...CORE_BACKUP_TABLES,
  'yl_channels',
  'videos',
  'source_folders'
] as const;

export const FULL_BACKUP_TABLES: TableName[] = [
  ...EXTENDED_BACKUP_TABLES,
  'yl_trending_keywords',
  'yl_categories', 
  'yl_user_follows',
  'analytics_logs',
  'api_usage',
  'badges',
  'channel_subscriptions',
  'notifications',
  'youtube_search_history',
  'alert_rules',
  'alerts'
] as const;

// 기본값: 핵심 테이블만 사용 (TypeScript 컴파일러 부하 최소화)
export const BACKUP_TABLES = CORE_BACKUP_TABLES;

export type BackupTableName = typeof BACKUP_TABLES[number];

// 테이블 메타데이터
export interface TableMetadata {
  name: BackupTableName;
  recordCount: number;
  lastBackup?: string;
  isSystemTable: boolean;
}

// 백업 데이터 구조
export interface BackupData<T extends BackupTableName = BackupTableName> {
  tableName: T;
  records: TableRow<T>[];
  metadata: TableMetadata;
}

// 타입 안전한 백업 결과
export interface TypeSafeBackupResult {
  success: boolean;
  tables: BackupData[];
  totalRecords: number;
  duration_ms: number;
  errors: string[];
  summary: string;
}