'use client'

import { useState } from 'react'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3 } from 'lucide-react'

interface RichTextContentProps {
  data: {
    title: string
    content: string
  }
  isEditing: boolean
  onChange: (data: any) => void
}

export default function RichTextContent({ data, isEditing, onChange }: RichTextContentProps) {
  const [title, setTitle] = useState(data.title || 'New Document')
  const [content, setContent] = useState(data.content || '')

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    onChange({ ...data, title: newTitle })
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onChange({ ...data, content: newContent })
  }

  const insertFormatting = (tag: string, displayText?: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let replacement = ''
    
    switch (tag) {
      case 'h1':
        replacement = `# ${selectedText || displayText || 'Heading 1'}`
        break
      case 'h2':
        replacement = `## ${selectedText || displayText || 'Heading 2'}`
        break
      case 'h3':
        replacement = `### ${selectedText || displayText || 'Heading 3'}`
        break
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`
        break
      case 'ul':
        replacement = `- ${selectedText || 'List item'}`
        break
      case 'ol':
        replacement = `1. ${selectedText || 'List item'}`
        break
      default:
        replacement = selectedText
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    handleContentChange(newContent)

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for display
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br>')
  }

  if (isEditing) {
    return (
      <div className="p-6">
        {/* Title Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document title..."
          />
        </div>

        {/* Formatting Toolbar */}
        <div className="mb-4 flex flex-wrap gap-2 p-3 bg-gray-700 rounded border border-gray-600">
          <button
            type="button"
            onClick={() => insertFormatting('h1')}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 text-white"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('h2')}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 text-white"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('h3')}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 text-white"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="border-l border-gray-500 mx-2"></div>
          <button
            type="button"
            onClick={() => insertFormatting('bold')}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 text-white"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('italic')}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 text-white"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="border-l border-gray-500 mx-2"></div>
          <button
            type="button"
            onClick={() => insertFormatting('ul')}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 text-white"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('ol')}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 text-white"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Content Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content (Markdown supported)
          </label>
          <textarea
            id="content-editor"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-96 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Start writing your content here... You can use markdown formatting."
          />
        </div>

        {/* Preview */}
        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Preview:</h4>
          <div className="bg-gray-600 p-4 rounded border border-gray-500">
            <h1 className="text-2xl font-bold mb-4 text-white">{title}</h1>
            <div
              className="prose prose-invert max-w-none text-gray-200"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Display mode
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">{title}</h1>
      <div
        className="prose prose-invert max-w-none text-gray-200"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  )
}
