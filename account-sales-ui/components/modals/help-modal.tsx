"use client"

import { useState } from 'react'
import { X, HelpCircle, Book, MessageCircle, Phone, Mail, ExternalLink, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'docs'>('faq')
  const [searchTerm, setSearchTerm] = useState('')

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I add a new customer?',
          answer: 'Navigate to the Customers page and click the "Add Customer" button. Fill in the required information including name, email, and phone number.'
        },
        {
          question: 'How do I create a sale?',
          answer: 'Go to the Sales page or use the Quick Actions panel on the dashboard. Select a customer, enter the sale amount and description, then save.'
        },
        {
          question: 'How do I view customer total spending?',
          answer: 'The total spending is automatically calculated and displayed in the Customers list. It shows the sum of all sales for each customer.'
        }
      ]
    },
    {
      category: 'Sales Management',
      questions: [
        {
          question: 'Can I edit or delete sales?',
          answer: 'Yes, you can edit or delete sales from the Sales page. Click on a sale entry and use the action buttons to modify or remove it.'
        },
        {
          question: 'How do I generate reports?',
          answer: 'Visit the Reports page to generate various sales and customer reports. You can filter by date range, customer, or sale amount.'
        },
        {
          question: 'What payment methods are supported?',
          answer: 'The system tracks sales regardless of payment method. You can add payment method details in the sale description or notes field.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'The app is running slowly, what should I do?',
          answer: 'Try refreshing your browser, clearing cache, or check your internet connection. If issues persist, contact our support team.'
        },
        {
          question: 'How do I backup my data?',
          answer: 'Go to Settings > Data & Storage and use the "Export Data" feature to download a backup of your information.'
        },
        {
          question: 'Can I import data from other systems?',
          answer: 'Yes, contact our support team for assistance with data migration from other sales management systems.'
        }
      ]
    }
  ]

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Help & Support</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'contact', label: 'Contact', icon: MessageCircle },
              { id: 'docs', label: 'Documentation', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* FAQ Categories */}
              {filteredFaqs.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <details key={index} className="group">
                        <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          <ChevronRight className="h-4 w-4 text-gray-500 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="mt-3 p-3 text-gray-700 leading-relaxed">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No questions found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Get immediate assistance from our support team</p>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">+60 3-1234 5678</p>
                    <p className="text-sm text-gray-500">Monday - Friday: 9:00 AM - 6:00 PM MYT</p>
                    <p className="text-sm text-gray-500">Saturday: 10:00 AM - 2:00 PM MYT</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Send us a detailed message and we'll get back to you</p>
                  <div className="space-y-2">
                    <p className="font-semibold">support@astralaone.com</p>
                    <p className="text-sm text-gray-500">Response time: Within 24 hours</p>
                    <Button className="mt-3">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Currently online</span>
                    </div>
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documentation Tab */}
          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'User Guide',
                  description: 'Complete guide to using all features of the sales management system',
                  icon: Book,
                  link: '#'
                },
                {
                  title: 'API Documentation',
                  description: 'Technical documentation for developers integrating with our API',
                  icon: ExternalLink,
                  link: '#'
                },
                {
                  title: 'Video Tutorials',
                  description: 'Step-by-step video tutorials for common tasks and workflows',
                  icon: ExternalLink,
                  link: '#'
                },
                {
                  title: 'Best Practices',
                  description: 'Tips and recommendations for optimal use of the system',
                  icon: Book,
                  link: '#'
                },
                {
                  title: 'Troubleshooting',
                  description: 'Common issues and their solutions',
                  icon: HelpCircle,
                  link: '#'
                },
                {
                  title: 'What\'s New',
                  description: 'Latest features and updates to the platform',
                  icon: ExternalLink,
                  link: '#'
                }
              ].map((doc) => (
                <Card key={doc.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <doc.icon className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
