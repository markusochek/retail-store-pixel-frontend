// lib/syncProducts/trigger.ts
import { prisma } from '@/lib/db/prisma';
import { configureEnhancedMeilisearch } from '@/lib/syncProducts/enhanced-settings';
import { syncEnhancedProductsToMeilisearch } from '@/lib/syncProducts/enhanced-sync';

export async function triggerSyncIfNeeded() {
  try {
    let lastSync;
    try {
      lastSync = await prisma.synchronization_metadata.findUnique({
        where: { key: 'last_meilisearch_sync' },
      });
    } catch (error) {
      console.log('synchronization_metadata table might not be ready yet');
      lastSync = null;
    }

    const syncInterval = 30 * 60 * 1000; // 30 минут вместо 5
    const shouldSync =
      !lastSync || new Date().getTime() - new Date(lastSync.value).getTime() > syncInterval;

    if (shouldSync) {
      console.log('🔄 Starting Meilisearch initialization...');

      // 1. Сначала настраиваем Meilisearch
      await configureEnhancedMeilisearch();

      // 2. Затем синхронизируем продукты
      await syncEnhancedProductsToMeilisearch();

      // 3. Сохраняем время синхронизации
      try {
        await prisma.synchronization_metadata.upsert({
          where: { key: 'last_meilisearch_sync' },
          update: { value: new Date().toISOString() },
          create: {
            key: 'last_meilisearch_sync',
            value: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.log('Could not save sync metadata, table might not exist yet');
      }

      console.log('✅ Meilisearch initialization completed');
    } else {
      console.log('⏭️ Sync not needed, last sync was:', lastSync?.value);
    }
  } catch (error) {
    console.error('❌ Error in triggerSyncIfNeeded:', error);
  }
}
