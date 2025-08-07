import { supabase } from './supabase'

export interface PageContent {
  id: string
  sidebar_item_id: string
  content_type: string
  content_data: any
  created_at: string
  updated_at: string
}

export interface ContentType {
  id: string
  name: string
  description: string
  icon: string
  defaultData: any
}

export class PageContentService {
  // Available content types
  static getContentTypes(): ContentType[] {
    return [
      {
        id: 'rich-text',
        name: 'Rich Text Document',
        description: 'Create documents with formatted text, headings, lists, and basic styling',
        icon: 'FileText',
        defaultData: {
          title: 'New Document',
          content: '<h1>Welcome</h1><p>Start writing your content here...</p>'
        }
      },
      {
        id: 'contact-form',
        name: 'Contact Information',
        description: 'Store contact details, phone numbers, emails, and addresses',
        icon: 'Users',
        defaultData: {
          contacts: [
            {
              name: '',
              title: '',
              email: '',
              phone: '',
              mobile: '',
              notes: ''
            }
          ]
        }
      },
      {
        id: 'location-info',
        name: 'Location Information',
        description: 'Track physical locations, addresses, and site details',
        icon: 'MapPin',
        defaultData: {
          locations: [
            {
              name: '',
              address: '',
              city: '',
              state: '',
              zipCode: '',
              country: '',
              notes: '',
              coordinates: { lat: null, lng: null }
            }
          ]
        }
      },
      {
        id: 'form-data',
        name: 'Custom Form',
        description: 'Create custom forms with various input fields',
        icon: 'FileInput',
        defaultData: {
          formTitle: 'Custom Form',
          elements: [],
          submissions: []
        }
      },
      {
        id: 'document-library',
        name: 'Document Library',
        description: 'Upload and organize files and documents',
        icon: 'FolderOpen',
        defaultData: {
          documents: [],
          allowedTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
          maxFileSize: 10485760 // 10MB
        }
      },
      {
        id: 'notes-comments',
        name: 'Notes & Comments',
        description: 'Collaborative notes and comment system',
        icon: 'MessageSquare',
        defaultData: {
          notes: [],
          allowComments: true,
          categories: ['General', 'Important', 'Follow-up']
        }
      },
      {
        id: 'checklist',
        name: 'Checklist',
        description: 'Create task lists and checklists',
        icon: 'CheckSquare',
        defaultData: {
          title: 'New Checklist',
          items: [
            {
              id: 'item1',
              text: 'Sample task',
              completed: false,
              priority: 'medium'
            }
          ]
        }
      },
      {
        id: 'key-value',
        name: 'Key-Value Pairs',
        description: 'Store configuration data, settings, or specifications',
        icon: 'Settings',
        defaultData: {
          title: 'Configuration',
          pairs: [
            {
              key: 'Example Key',
              value: 'Example Value',
              description: ''
            }
          ]
        }
      }
    ]
  }

  // Get page content by sidebar item ID
  static async getPageContent(sidebarItemId: string): Promise<PageContent> {
    console.log('🔍 Fetching page content for sidebar item:', sidebarItemId)

    const { data, error } = await supabase
      .from('page_contents')
      .select('*')
      .eq('sidebar_item_id', sidebarItemId)
      .single()

    if (error) {
      // Only log non-expected errors to avoid console noise
      if (error.code !== 'PGRST116') {
        console.error('❌ Error fetching page content:', error)
      }

      // Check for common error types
      if (error.code === '42P01') {
        throw new Error('Database table "page_contents" does not exist. Please run the database setup SQL first.')
      } else if (error.code === 'PGRST116') {
        throw new Error('No page content found for this sidebar item. Please create content first.')
      } else {
        throw new Error(`Database error: ${error.message || 'Unknown error'}`)
      }
    }

    console.log('✅ Found page content:', data)
    return data
  }

  // Create default page content
  static async createDefaultPageContent(sidebarItemId: string, contentType: string): Promise<PageContent> {
    console.log('🔧 Creating default page content for sidebar item:', sidebarItemId, 'type:', contentType)

    const contentTypes = this.getContentTypes()
    const type = contentTypes.find(t => t.id === contentType)

    if (!type) {
      throw new Error(`Unknown content type: ${contentType}`)
    }

    const pageContentData = {
      sidebar_item_id: sidebarItemId,
      content_type: contentType,
      content_data: type.defaultData
    }

    console.log('📝 Page content to create:', pageContentData)

    const { data, error } = await supabase
      .from('page_contents')
      .insert([pageContentData])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating page content:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))

      // Check for common error types
      if (error.code === '42P01') {
        throw new Error('Database table "page_contents" does not exist. Please run the database setup SQL first.')
      } else {
        throw new Error(`Database error: ${error.message || 'Unknown error'}`)
      }
    }

    console.log('✅ Created page content:', data)
    return data
  }

  // Update page content
  static async updatePageContent(contentId: string, updates: Partial<PageContent>): Promise<PageContent> {
    const { data, error } = await supabase
      .from('page_contents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating page content:', error)
      throw error
    }

    return data
  }

  // Delete page content
  static async deletePageContent(contentId: string): Promise<void> {
    const { error } = await supabase
      .from('page_contents')
      .delete()
      .eq('id', contentId)

    if (error) {
      console.error('Error deleting page content:', error)
      throw error
    }
  }

  // Get content type by ID
  static getContentType(contentTypeId: string): ContentType | undefined {
    return this.getContentTypes().find(type => type.id === contentTypeId)
  }
}
