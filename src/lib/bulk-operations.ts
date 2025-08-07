import { supabase } from './supabase'

export interface BulkOperationResult {
  success: boolean
  processed: number
  failed: number
  errors: string[]
}

export class BulkOperationsService {
  /**
   * Bulk delete items from a table
   */
  static async bulkDelete(
    table: string,
    ids: string[],
    organizationId?: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    try {
      let query = supabase.from(table).delete().in('id', ids)
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { error, count } = await query

      if (error) {
        result.success = false
        result.errors.push(error.message)
        result.failed = ids.length
      } else {
        result.processed = count || ids.length
      }
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.failed = ids.length
    }

    return result
  }

  /**
   * Bulk update items in a table
   */
  static async bulkUpdate(
    table: string,
    ids: string[],
    updates: Record<string, any>,
    organizationId?: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    try {
      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      let query = supabase.from(table).update(updateData).in('id', ids)
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { error, count } = await query

      if (error) {
        result.success = false
        result.errors.push(error.message)
        result.failed = ids.length
      } else {
        result.processed = count || ids.length
      }
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.failed = ids.length
    }

    return result
  }

  /**
   * Bulk archive items
   */
  static async bulkArchive(
    table: string,
    ids: string[],
    organizationId?: string
  ): Promise<BulkOperationResult> {
    return this.bulkUpdate(table, ids, { status: 'archived' }, organizationId)
  }

  /**
   * Bulk duplicate items
   */
  static async bulkDuplicate(
    table: string,
    ids: string[],
    organizationId?: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    try {
      // First, fetch the items to duplicate
      let query = supabase.from(table).select('*').in('id', ids)
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { data: items, error: fetchError } = await query

      if (fetchError) {
        result.success = false
        result.errors.push(fetchError.message)
        result.failed = ids.length
        return result
      }

      if (!items || items.length === 0) {
        result.errors.push('No items found to duplicate')
        result.failed = ids.length
        return result
      }

      // Create duplicates
      const duplicates = items.map(item => {
        const { id, created_at, updated_at, ...itemData } = item
        return {
          ...itemData,
          name: `${item.name || item.title || 'Item'} (Copy)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })

      const { error: insertError, count } = await supabase
        .from(table)
        .insert(duplicates)

      if (insertError) {
        result.success = false
        result.errors.push(insertError.message)
        result.failed = ids.length
      } else {
        result.processed = count || duplicates.length
      }
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.failed = ids.length
    }

    return result
  }

  /**
   * Bulk export items to CSV
   */
  static async bulkExport(
    table: string,
    ids: string[],
    organizationId?: string
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      let query = supabase.from(table).select('*').in('id', ids)
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { data: items, error } = await query

      if (error) {
        return { success: false, error: error.message }
      }

      if (!items || items.length === 0) {
        return { success: false, error: 'No items found to export' }
      }

      // Convert to CSV
      const headers = Object.keys(items[0])
      const csvContent = [
        headers.join(','),
        ...items.map(item => 
          headers.map(header => {
            const value = item[header]
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ''
          }).join(',')
        )
      ].join('\n')

      return { success: true, data: csvContent }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Bulk add tags to items
   */
  static async bulkAddTags(
    table: string,
    ids: string[],
    tags: string[],
    organizationId?: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    try {
      // First, fetch existing items to get current tags
      let query = supabase.from(table).select('id, tags').in('id', ids)
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { data: items, error: fetchError } = await query

      if (fetchError) {
        result.success = false
        result.errors.push(fetchError.message)
        result.failed = ids.length
        return result
      }

      // Update each item with merged tags
      for (const item of items || []) {
        const existingTags = Array.isArray(item.tags) ? item.tags : []
        const newTags = [...new Set([...existingTags, ...tags])] // Remove duplicates

        const { error: updateError } = await supabase
          .from(table)
          .update({ 
            tags: newTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        if (updateError) {
          result.errors.push(`Failed to update item ${item.id}: ${updateError.message}`)
          result.failed++
        } else {
          result.processed++
        }
      }

      result.success = result.failed === 0
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.failed = ids.length
    }

    return result
  }

  /**
   * Download CSV file
   */
  static downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  /**
   * Process bulk operation with progress tracking
   */
  static async processBulkOperation(
    operation: string,
    table: string,
    ids: string[],
    data?: any,
    organizationId?: string,
    onProgress?: (progress: number) => void
  ): Promise<BulkOperationResult> {
    const batchSize = 50 // Process in batches to avoid overwhelming the database
    const totalBatches = Math.ceil(ids.length / batchSize)
    let overallResult: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, ids.length)
      const batchIds = ids.slice(start, end)

      let batchResult: BulkOperationResult

      switch (operation) {
        case 'delete':
          batchResult = await this.bulkDelete(table, batchIds, organizationId)
          break
        case 'archive':
          batchResult = await this.bulkArchive(table, batchIds, organizationId)
          break
        case 'duplicate':
          batchResult = await this.bulkDuplicate(table, batchIds, organizationId)
          break
        case 'tag':
          const tags = data?.split(',').map((tag: string) => tag.trim()).filter(Boolean) || []
          batchResult = await this.bulkAddTags(table, batchIds, tags, organizationId)
          break
        case 'edit':
          batchResult = await this.bulkUpdate(table, batchIds, { status: data }, organizationId)
          break
        default:
          batchResult = {
            success: false,
            processed: 0,
            failed: batchIds.length,
            errors: [`Unknown operation: ${operation}`]
          }
      }

      // Merge results
      overallResult.processed += batchResult.processed
      overallResult.failed += batchResult.failed
      overallResult.errors.push(...batchResult.errors)
      
      if (!batchResult.success) {
        overallResult.success = false
      }

      // Report progress
      if (onProgress) {
        const progress = Math.round(((i + 1) / totalBatches) * 100)
        onProgress(progress)
      }

      // Small delay between batches to prevent overwhelming the database
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return overallResult
  }
}
