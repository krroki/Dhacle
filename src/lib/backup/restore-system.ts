// Restore System for Dhacle Backup Recovery
// Provides safe data restoration with validation and rollback capabilities

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { RestoreResult } from './backup-system';
import { BackupTableName, BACKUP_TABLES, TableInsert } from './table-types';

export interface RestoreOptions {
  dryRun?: boolean;
  tablesToRestore?: BackupTableName[];
  filesToRestore?: string[];
  skipConfirmation?: boolean;
  createBackupBeforeRestore?: boolean;
}

export interface RestoreValidationResult {
  canRestore: boolean;
  warnings: string[];
  errors: string[];
  summary: {
    tablesFound: number;
    filesFound: number;
    estimatedTime: number;
  };
}

export class RestoreSystem {
  private backupDir: string;

  constructor(backupDir: string = 'backups') {
    this.backupDir = path.resolve(backupDir);
  }

  async validateRestore(backupPath: string, options: RestoreOptions = {}): Promise<RestoreValidationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];
    let tablesFound = 0;
    let filesFound = 0;
    let estimatedTime = 0;

    try {
      // Check if backup file exists and is readable
      await fs.access(backupPath);
      const content = await fs.readFile(backupPath, 'utf-8');
      const backup = JSON.parse(content);

      if (!backup.metadata) {
        errors.push('Invalid backup format: missing metadata');
        return {
          canRestore: false,
          warnings,
          errors,
          summary: { tablesFound: 0, filesFound: 0, estimatedTime: 0 },
        };
      }

      // Validate database backup
      if (backup.tables) {
        tablesFound = Object.keys(backup.tables).length;
        
        // Check if we have database access
        try {
          const supabase = await createSupabaseRouteHandlerClient();
          await supabase.from('users').select('id').limit(1);
        } catch (dbError) {
          errors.push('Cannot connect to database for restore');
        }

        // Check table-specific constraints
        if (options.tablesToRestore) {
          const availableTables = Object.keys(backup.tables);
          const missingTables = options.tablesToRestore.filter(table => !availableTables.includes(table));
          if (missingTables.length > 0) {
            warnings.push(`Tables not found in backup: ${missingTables.join(', ')}`);
          }
        }
      }

      // Validate file backup
      if (backup.files) {
        filesFound = Object.keys(backup.files).length;
        
        // Check file write permissions
        try {
          const testFile = path.join(process.cwd(), '.restore-test');
          await fs.writeFile(testFile, 'test');
          await fs.unlink(testFile);
        } catch (fsError) {
          warnings.push('Limited file system write permissions detected');
        }

        // Check if critical files will be overwritten
        if (options.filesToRestore) {
          const criticalFiles = ['package.json', 'next.config.ts', '.env.local'];
          const criticalOverwrites = options.filesToRestore.filter(file => 
            criticalFiles.some(critical => file.includes(critical))
          );
          if (criticalOverwrites.length > 0) {
            warnings.push(`Critical files will be overwritten: ${criticalOverwrites.join(', ')}`);
          }
        }
      }

      // Environment compatibility check
      if (backup.metadata.environment && backup.metadata.environment !== process.env.NODE_ENV) {
        warnings.push(`Backup created in ${backup.metadata.environment} environment, current: ${process.env.NODE_ENV}`);
      }

      // Estimate restoration time (rough calculation)
      estimatedTime = Math.max(
        tablesFound * 2, // 2 seconds per table
        filesFound * 0.1, // 0.1 seconds per file
        10 // minimum 10 seconds
      );

    } catch (error) {
      errors.push(`Backup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      canRestore: errors.length === 0,
      warnings,
      errors,
      summary: {
        tablesFound,
        filesFound,
        estimatedTime: Math.round(estimatedTime),
      },
    };
  }

  async restoreDatabase(backupPath: string, options: RestoreOptions = {}): Promise<RestoreResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let restoredItems = 0;

    try {
      const content = await fs.readFile(backupPath, 'utf-8');
      const backup = JSON.parse(content);

      if (!backup.tables) {
        throw new Error('No database tables found in backup');
      }

      // 타입 안전한 테이블 복원
      const tablesToRestore = (options.tablesToRestore as BackupTableName[]) || BACKUP_TABLES;

      if (options.dryRun) {
        return {
          success: true,
          restored_items: tablesToRestore.length,
          duration_ms: Date.now() - startTime,
          errors: [],
          summary: `DRY RUN: Would restore ${tablesToRestore.length} tables`,
        };
      }

      const supabase = await createSupabaseRouteHandlerClient();

      // Create backup before restore if requested
      if (options.createBackupBeforeRestore) {
        try {
          const { BackupSystem } = await import('./backup-system');
          const backupSystem = new BackupSystem();
          await backupSystem.initialize();
          const preRestoreBackup = await backupSystem.createDatabaseBackup();
          
          if (preRestoreBackup.success) {
            console.log(`✅ Pre-restore backup created`);
          } else {
            errors.push('Failed to create pre-restore backup');
          }
        } catch (backupError) {
          errors.push('Pre-restore backup failed');
        }
      }

      for (const tableName of tablesToRestore) {
        // 유효한 테이블명 검증
        if (!BACKUP_TABLES.includes(tableName)) {
          errors.push(`Invalid table name: ${tableName}`);
          continue;
        }

        try {
          const tableData = backup.tables[tableName];
          
          if (!Array.isArray(tableData)) {
            errors.push(`Invalid data format for table: ${tableName}`);
            continue;
          }

          if (tableData.length === 0) {
            console.log(`⚠️ Skipping empty table: ${tableName}`);
            continue;
          }

          // 타입 안전한 삭제
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (deleteError) {
            errors.push(`Failed to clear table ${tableName}: ${deleteError.message}`);
            continue;
          }

          // 타입 안전한 삽입 (배치 처리)
          const batchSize = 100;
          for (let i = 0; i < tableData.length; i += batchSize) {
            const batch = tableData.slice(i, i + batchSize) as TableInsert<typeof tableName>[];
            
            const { error: insertError } = await supabase
              .from(tableName)
              .insert(batch);

            if (insertError) {
              errors.push(`Failed to restore batch for table ${tableName}: ${insertError.message}`);
              break;
            }
          }

          restoredItems++;
          console.log(`✅ Restored table: ${tableName} (${tableData.length} records)`);

        } catch (tableError) {
          errors.push(`Failed to restore table ${tableName}: ${tableError instanceof Error ? tableError.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`Database restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      restored_items: restoredItems,
      duration_ms: duration,
      errors,
      summary: `Restored ${restoredItems} tables in ${Math.round(duration / 1000)}s`,
    };
  }

  async restoreFiles(backupPath: string, options: RestoreOptions = {}): Promise<RestoreResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let restoredItems = 0;

    try {
      const content = await fs.readFile(backupPath, 'utf-8');
      const backup = JSON.parse(content);

      if (!backup.files) {
        throw new Error('No files found in backup');
      }

      const filesToRestore = options.filesToRestore || Object.keys(backup.files);

      if (options.dryRun) {
        return {
          success: true,
          restored_items: filesToRestore.length,
          duration_ms: Date.now() - startTime,
          errors: [],
          summary: `DRY RUN: Would restore ${filesToRestore.length} files`,
        };
      }

      // Restore each file
      for (const relativePath of filesToRestore) {
        try {
          const fileData = backup.files[relativePath];
          
          if (!fileData || typeof fileData.content !== 'string') {
            errors.push(`Invalid file data for: ${relativePath}`);
            continue;
          }

          const fullPath = path.resolve(relativePath);
          const dirPath = path.dirname(fullPath);

          // Create directory if it doesn't exist
          await fs.mkdir(dirPath, { recursive: true });

          // Write file content
          await fs.writeFile(fullPath, fileData.content, 'utf-8');

          restoredItems++;
          console.log(`✅ Restored file: ${relativePath}`);

        } catch (fileError) {
          errors.push(`Failed to restore file ${relativePath}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`File restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      restored_items: restoredItems,
      duration_ms: duration,
      errors,
      summary: `Restored ${restoredItems} files in ${Math.round(duration / 1000)}s`,
    };
  }

  async fullRestore(backupPath: string, options: RestoreOptions = {}): Promise<RestoreResult[]> {
    console.log('🔄 Starting full system restore...');
    
    if (!options.skipConfirmation) {
      console.warn('⚠️ WARNING: Full restore will overwrite current data!');
    }

    const results: RestoreResult[] = [];

    // Validate first
    const validation = await this.validateRestore(backupPath, options);
    if (!validation.canRestore) {
      const failResult: RestoreResult = {
        success: false,
        restored_items: 0,
        duration_ms: 0,
        errors: validation.errors,
        summary: 'Restore validation failed',
      };
      return [failResult];
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Restore warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    // Restore database
    const dbRestore = await this.restoreDatabase(backupPath, {
      ...options,
      createBackupBeforeRestore: true, // Always backup before full restore
    });
    results.push(dbRestore);

    // Restore files
    const fileRestore = await this.restoreFiles(backupPath, options);
    results.push(fileRestore);

    return results;
  }

  async testRestore(backupPath: string): Promise<{ success: boolean; report: string }> {
    console.log('🧪 Running restore test (dry run)...');
    
    const validation = await this.validateRestore(backupPath, { dryRun: true });
    
    if (!validation.canRestore) {
      return {
        success: false,
        report: `Restore test failed:\n${validation.errors.join('\n')}`,
      };
    }

    // Test database restore
    const dbTest = await this.restoreDatabase(backupPath, { dryRun: true });
    
    // Test file restore  
    const fileTest = await this.restoreFiles(backupPath, { dryRun: true });

    const report = `
🧪 Restore Test Report
=====================

✅ Validation: PASSED
${validation.warnings.length > 0 ? `⚠️ Warnings: ${validation.warnings.length}\n${validation.warnings.map(w => `  - ${w}`).join('\n')}` : ''}

📊 Summary:
  - Tables to restore: ${validation.summary.tablesFound}
  - Files to restore: ${validation.summary.filesFound}
  - Estimated time: ${validation.summary.estimatedTime}s

🗃️ Database Test: ${dbTest.success ? 'PASSED' : 'FAILED'}
  - Items: ${dbTest.restored_items}
  - Duration: ${dbTest.duration_ms}ms
  ${dbTest.errors.length > 0 ? `  - Errors: ${dbTest.errors.join(', ')}` : ''}

📁 File Test: ${fileTest.success ? 'PASSED' : 'FAILED'}
  - Items: ${fileTest.restored_items}
  - Duration: ${fileTest.duration_ms}ms
  ${fileTest.errors.length > 0 ? `  - Errors: ${fileTest.errors.join(', ')}` : ''}

✅ Overall: ${dbTest.success && fileTest.success ? 'READY FOR RESTORE' : 'ISSUES DETECTED'}
`.trim();

    return {
      success: dbTest.success && fileTest.success,
      report,
    };
  }
}