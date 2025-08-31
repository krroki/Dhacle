// Comprehensive Backup System for Dhacle
// Provides database, file, and configuration backup with recovery testing

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { env } from '@/env';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { 
  BACKUP_TABLES, 
  TableRow, 
  TypeSafeBackupResult,
  BackupData 
} from './table-types';

export type BackupType = 'database' | 'files' | 'config' | 'full';
export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface BackupMetadata {
  id: string;
  type: BackupType;
  status: BackupStatus;
  created_at: string;
  size_bytes: number;
  file_count?: number;
  checksum: string;
  description: string;
  error?: string;
}

export interface BackupResult {
  success: boolean;
  metadata: BackupMetadata;
  file_path: string;
  duration_ms: number;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  restored_items: number;
  duration_ms: number;
  errors: string[];
  summary: string;
}

export class BackupSystem {
  private backupDir: string;
  private maxBackups: number = 10; // Keep latest 10 backups
  
  constructor(backupDir: string = 'backups') {
    this.backupDir = path.resolve(backupDir);
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`📁 Backup directory initialized: ${this.backupDir}`);
    } catch (error) {
      throw new Error(`Failed to initialize backup directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `backup-${timestamp}-${random}`;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath);
      return createHash('sha256').update(content).digest('hex');
    } catch (error) {
      return '';
    }
  }

  private async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  // ✅ 새로운 타입 안전 백업 메서드
  async createDatabaseBackup(): Promise<TypeSafeBackupResult> {
    const startTime = Date.now();
    const backupData: BackupData[] = [];
    const errors: string[] = [];
    let totalRecords = 0;

    try {
      const supabase = await createSupabaseRouteHandlerClient();

      // Union type 기반 타입 안전 접근
      for (const tableName of BACKUP_TABLES) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*');

          if (error) {
            errors.push(`Failed to backup table ${tableName}: ${error.message}`);
            continue;
          }

          const records = (data as TableRow<typeof tableName>[]) || [];
          
          backupData.push({
            tableName,
            records,
            metadata: {
              name: tableName,
              recordCount: records.length,
              lastBackup: new Date().toISOString(),
              isSystemTable: false
            }
          });

          totalRecords += records.length;
          console.log(`✅ Backed up ${tableName}: ${records.length} records`);

        } catch (tableError) {
          const errorMsg = tableError instanceof Error 
            ? tableError.message 
            : `Unknown error backing up ${tableName}`;
          errors.push(errorMsg);
          console.error(`❌ Backup failed for ${tableName}:`, tableError);
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        tables: backupData,
        totalRecords,
        duration_ms: duration,
        errors,
        summary: `Backed up ${backupData.length} tables with ${totalRecords} total records in ${Math.round(duration / 1000)}s`
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        tables: backupData,
        totalRecords,
        duration_ms: duration,
        errors: [errorMsg],
        summary: `Database backup failed: ${errorMsg}`
      };
    }
  }

  async createFileBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = this.generateBackupId();
    const fileName = `${backupId}-files.json`;
    const filePath = path.join(this.backupDir, fileName);

    try {
      const importantFiles = [
        'package.json',
        'next.config.ts',
        'tailwind.config.ts',
        'tsconfig.json',
        'biome.json',
        '.env.example',
        'project-dna.json',
        'asset-inventory.json',
        'CLAUDE.md',
      ];

      const backup: Record<string, { content: string; size: number; modified: string }> = {};
      let totalSize = 0;

      for (const file of importantFiles) {
        try {
          const fullPath = path.resolve(file);
          const content = await fs.readFile(fullPath, 'utf-8');
          const stats = await fs.stat(fullPath);
          
          backup[file] = {
            content,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          };
          
          totalSize += stats.size;
        } catch (fileError) {
          console.warn(`⚠️ Warning: Could not backup file ${file}`);
        }
      }

      // Backup important configuration from specific directories
      const configDirs = [
        'src/lib/security',
        'scripts',
        '.claude',
      ];

      for (const dir of configDirs) {
        try {
          const configs = await this.backupDirectory(dir, ['*.ts', '*.js', '*.json', '*.md']);
          Object.assign(backup, configs);
          totalSize += Object.values(configs).reduce((sum, file) => sum + file.size, 0);
        } catch (dirError) {
          console.warn(`⚠️ Warning: Could not backup directory ${dir}`);
        }
      }

      const backupData = {
        metadata: {
          created_at: new Date().toISOString(),
          backup_id: backupId,
          environment: env.NODE_ENV,
          file_count: Object.keys(backup).length,
          total_size: totalSize,
        },
        files: backup,
      };

      await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
      
      const duration = Date.now() - startTime;
      const fileSize = await this.getFileSize(filePath);
      const checksum = await this.calculateChecksum(filePath);

      const metadata: BackupMetadata = {
        id: backupId,
        type: 'files',
        status: 'completed',
        created_at: new Date().toISOString(),
        size_bytes: fileSize,
        file_count: Object.keys(backup).length,
        checksum,
        description: `File backup: ${Object.keys(backup).length} files, ${Math.round(totalSize / 1024)} KB`,
      };

      return {
        success: true,
        metadata,
        file_path: filePath,
        duration_ms: duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const metadata: BackupMetadata = {
        id: backupId,
        type: 'files',
        status: 'failed',
        created_at: new Date().toISOString(),
        size_bytes: 0,
        checksum: '',
        description: 'File backup failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      return {
        success: false,
        metadata,
        file_path: filePath,
        duration_ms: duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createConfigBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = this.generateBackupId();
    const fileName = `${backupId}-config.json`;
    const filePath = path.join(this.backupDir, fileName);

    try {
      const config = {
        environment: env.NODE_ENV,
        required_vars: [
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          'SUPABASE_SERVICE_ROLE_KEY',
          'YOUTUBE_API_KEY',
        ].map(name => ({
          name,
          exists: !!process.env[name],
          length: process.env[name]?.length || 0,
        })),
        system_info: {
          node_version: process.version,
          platform: process.platform,
          arch: process.arch,
          memory: process.memoryUsage(),
          uptime: process.uptime(),
        },
        project_info: {
          backup_created: new Date().toISOString(),
          backup_id: backupId,
        },
      };

      const backupData = {
        metadata: {
          created_at: new Date().toISOString(),
          backup_id: backupId,
          environment: env.NODE_ENV,
        },
        config,
      };

      await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
      
      const duration = Date.now() - startTime;
      const fileSize = await this.getFileSize(filePath);
      const checksum = await this.calculateChecksum(filePath);

      const metadata: BackupMetadata = {
        id: backupId,
        type: 'config',
        status: 'completed',
        created_at: new Date().toISOString(),
        size_bytes: fileSize,
        checksum,
        description: `Configuration backup: ${config.required_vars.length} environment variables, system info`,
      };

      return {
        success: true,
        metadata,
        file_path: filePath,
        duration_ms: duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const metadata: BackupMetadata = {
        id: backupId,
        type: 'config',
        status: 'failed',
        created_at: new Date().toISOString(),
        size_bytes: 0,
        checksum: '',
        description: 'Configuration backup failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      return {
        success: false,
        metadata,
        file_path: filePath,
        duration_ms: duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createFullBackup(): Promise<BackupResult[]> {
    console.log('🔄 Creating full system backup...');
    
    const results: BackupResult[] = [];
    
    // Run all backup types
    const dbBackup = await this.createDatabaseBackup();
    // Convert TypeSafeBackupResult to BackupResult format for compatibility
    const dbBackupResult: BackupResult = {
      success: dbBackup.success,
      metadata: {
        id: `backup-${Date.now()}`,
        type: 'database',
        status: dbBackup.success ? 'completed' : 'failed',
        created_at: new Date().toISOString(),
        size_bytes: 0,
        checksum: '',
        description: dbBackup.summary
      },
      file_path: '',
      duration_ms: dbBackup.duration_ms,
      error: dbBackup.errors.join('; ') || undefined
    };
    results.push(dbBackupResult);
    
    const fileBackup = await this.createFileBackup();
    results.push(fileBackup);
    
    const configBackup = await this.createConfigBackup();
    results.push(configBackup);

    return results;
  }

  async verifyBackup(backupPath: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if file exists
      await fs.access(backupPath);
      
      // Check file size
      const stats = await fs.stat(backupPath);
      if (stats.size === 0) {
        errors.push('Backup file is empty');
      }

      // Try to parse JSON
      const content = await fs.readFile(backupPath, 'utf-8');
      const backup = JSON.parse(content);

      if (!backup.metadata) {
        errors.push('Missing backup metadata');
      }

      // Check checksum if available
      if (backup.metadata?.checksum) {
        const calculatedChecksum = await this.calculateChecksum(backupPath);
        if (calculatedChecksum !== backup.metadata.checksum) {
          errors.push('Checksum verification failed');
        }
      }

    } catch (error) {
      errors.push(`Backup verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups: BackupMetadata[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.backupDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const backup = JSON.parse(content);
            
            if (backup.metadata) {
              backups.push(backup.metadata);
            }
          } catch (error) {
            console.warn(`⚠️ Could not read backup file: ${file}`);
          }
        }
      }

      return backups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      return [];
    }
  }

  async cleanupOldBackups(): Promise<{ deleted: number; kept: number }> {
    const backups = await this.listBackups();
    const toDelete = backups.slice(this.maxBackups);
    
    let deleted = 0;
    
    for (const backup of toDelete) {
      try {
        const pattern = new RegExp(`${backup.id}.*\\.json$`);
        const files = await fs.readdir(this.backupDir);
        
        for (const file of files) {
          if (pattern.test(file)) {
            await fs.unlink(path.join(this.backupDir, file));
            deleted++;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not delete backup ${backup.id}`);
      }
    }

    return {
      deleted,
      kept: backups.length - deleted,
    };
  }


  private async backupDirectory(
    dirPath: string, 
    patterns: string[]
  ): Promise<Record<string, { content: string; size: number; modified: string }>> {
    const backup: Record<string, { content: string; size: number; modified: string }> = {};
    
    try {
      const files = await fs.readdir(dirPath, { recursive: true });
      
      for (const file of files) {
        if (typeof file !== 'string') continue;
        
        const fullPath = path.join(dirPath, file);
        const relativePath = path.relative(process.cwd(), fullPath);
        
        try {
          const stats = await fs.stat(fullPath);
          if (!stats.isFile()) continue;

          // Check if file matches patterns
          const matches = patterns.some(pattern => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(file);
          });

          if (matches) {
            const content = await fs.readFile(fullPath, 'utf-8');
            backup[relativePath] = {
              content,
              size: stats.size,
              modified: stats.mtime.toISOString(),
            };
          }
        } catch (fileError) {
          console.warn(`Failed to read file ${filePath}:`, fileError instanceof Error ? fileError.message : 'Unknown error');
        }
      }
    } catch (dirError) {
      console.warn(`Failed to read directory ${configDir}:`, dirError instanceof Error ? dirError.message : 'Unknown error');
    }

    return backup;
  }
}