'use client'

interface ContactFormContentProps {
  data: {
    contacts: Array<{
      name: string
      title: string
      email: string
      phone: string
      mobile: string
      notes: string
    }>
  }
  isEditing: boolean
  onChange: (data: any) => void
}

export default function ContactFormContent({ data, isEditing, onChange }: ContactFormContentProps) {
  const contacts = data.contacts || []

  const addContact = () => {
    const newContacts = [...contacts, {
      name: '',
      title: '',
      email: '',
      phone: '',
      mobile: '',
      notes: ''
    }]
    onChange({ ...data, contacts: newContacts })
  }

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    onChange({ ...data, contacts: newContacts })
  }

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index)
    onChange({ ...data, contacts: newContacts })
  }

  if (isEditing) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Contact Information</h2>
          <button
            onClick={addContact}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Contact
          </button>
        </div>

        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <div key={index} className="border border-gray-600 rounded p-4 bg-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Contact {index + 1}</h3>
                <button
                  onClick={() => removeContact(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={contact.title}
                    onChange={(e) => updateContact(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={contact.mobile}
                    onChange={(e) => updateContact(index, 'mobile', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={contact.notes}
                    onChange={(e) => updateContact(index, 'notes', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {contacts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No contacts added yet.</p>
            <button
              onClick={addContact}
              className="mt-2 text-blue-400 hover:text-blue-300"
            >
              Add your first contact
            </button>
          </div>
        )}
      </div>
    )
  }

  // Display mode
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-white">Contact Information</h2>

      {contacts.length === 0 ? (
        <p className="text-gray-400">No contacts available.</p>
      ) : (
        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <div key={index} className="border border-gray-600 rounded p-4 bg-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{contact.name}</p>
                  </div>
                )}
                {contact.title && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Title</label>
                    <p className="text-gray-900">{contact.title}</p>
                  </div>
                )}
                {contact.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                        {contact.email}
                      </a>
                    </p>
                  </div>
                )}
                {contact.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                        {contact.phone}
                      </a>
                    </p>
                  </div>
                )}
                {contact.mobile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Mobile</label>
                    <p className="text-gray-900">
                      <a href={`tel:${contact.mobile}`} className="text-blue-600 hover:text-blue-800">
                        {contact.mobile}
                      </a>
                    </p>
                  </div>
                )}
                {contact.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
