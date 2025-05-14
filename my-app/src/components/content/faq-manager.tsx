"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Pencil, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQService } from "@/services/content-service"
import type { FAQDocument, FAQItem } from "@/types/FAQ"

export function FAQManager() {
  const [faqs, setFaqs] = useState<FAQDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingHero, setIsEditingHero] = useState(false)
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [heroTitle, setHeroTitle] = useState("")
  const [heroDescription, setHeroDescription] = useState("")
  const [contactTitle, setContactTitle] = useState("")
  const [contactDescription, setContactDescription] = useState("")
  const [openFaqDialog, setOpenFaqDialog] = useState(false)
  const [currentFaq, setCurrentFaq] = useState<FAQItem | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [editIndex, setEditIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      setLoading(true)
      const data = await FAQService.getFaqs()
      setFaqs(data)
      setHeroTitle(data.heroSection.title)
      setHeroDescription(data.heroSection.description)
      setContactTitle(data.contactSection.title)
      setContactDescription(data.contactSection.description)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching FAQs:", err)
      setError("Failed to load FAQs. Please try again.")
      setLoading(false)
    }
  }

  const handleSaveHeroSection = async () => {
    if (!faqs) return

    try {
      const updatedFaqs = {
        ...faqs,
        heroSection: {
          title: heroTitle,
          description: heroDescription,
        },
      }

      await FAQService.updateFAQ(faqs._id || "", updatedFaqs)
      setFaqs(updatedFaqs)
      setIsEditingHero(false)
      toast.success("Hero section updated successfully")
    } catch (err) {
      console.error("Error updating hero section:", err)
      toast.error("Failed to update hero section")
    }
  }

  const handleSaveContactSection = async () => {
    if (!faqs) return

    try {
      const updatedFaqs = {
        ...faqs,
        contactSection: {
          title: contactTitle,
          description: contactDescription,
        },
      }

      await FAQService.updateFAQ(faqs._id || "", updatedFaqs)
      setFaqs(updatedFaqs)
      setIsEditingContact(false)
      toast.success("Contact section updated successfully")
    } catch (err) {
      console.error("Error updating contact section:", err)
      toast.error("Failed to update contact section")
    }
  }

  const handleAddOrUpdateFaq = async () => {
    if (!faqs) return
    if (!newQuestion || !newAnswer) {
      toast.error("Question and answer are required")
      return
    }

    try {
      const newFaqItem: FAQItem = {
        question: newQuestion,
        answer: newAnswer,
      }

      let updatedFaqs: FAQDocument

      if (editIndex !== null) {
        // Update existing FAQ
        const updatedFaqItems = [...faqs.faqs]
        updatedFaqItems[editIndex] = newFaqItem

        updatedFaqs = {
          ...faqs,
          faqs: updatedFaqItems,
        }
      } else {
        // Add new FAQ
        updatedFaqs = {
          ...faqs,
          faqs: [...faqs.faqs, newFaqItem],
        }
      }

      await FAQService.updateFAQ(faqs._id || "", updatedFaqs)
      setFaqs(updatedFaqs)
      setOpenFaqDialog(false)
      setNewQuestion("")
      setNewAnswer("")
      setEditIndex(null)
      toast.success(editIndex !== null ? "FAQ updated successfully" : "FAQ added successfully")
    } catch (err) {
      console.error("Error adding/updating FAQ:", err)
      toast.error("Failed to save FAQ")
    }
  }

  const handleDeleteFaq = async (index: number) => {
    if (!faqs) return

    try {
      const updatedFaqItems = faqs.faqs.filter((_, i) => i !== index)
      const updatedFaqs = {
        ...faqs,
        faqs: updatedFaqItems,
      }

      await FAQService.updateFAQ(faqs._id || "", updatedFaqs)
      setFaqs(updatedFaqs)
      toast.success("FAQ deleted successfully")
    } catch (err) {
      console.error("Error deleting FAQ:", err)
      toast.error("Failed to delete FAQ")
    }
  }

  const handleEditFaq = (faq: FAQItem, index: number) => {
    setNewQuestion(faq.question)
    setNewAnswer(faq.answer)
    setEditIndex(index)
    setOpenFaqDialog(true)
  }

  if (loading) return <div className="text-center py-8">Loading FAQ content...</div>
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>
  if (!faqs) return <div className="text-center py-8">No FAQ content found. Create new content to get started.</div>

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Hero Section</span>
            <Button variant="outline" size="sm" onClick={() => setIsEditingHero(!isEditingHero)}>
              {isEditingHero ? <Save className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              {isEditingHero ? "Save" : "Edit"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingHero ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="heroTitle" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="heroTitle"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Enter hero title"
                />
              </div>
              <div>
                <label htmlFor="heroDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="heroDescription"
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  placeholder="Enter hero description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditingHero(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveHeroSection}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-lg">{faqs.heroSection.title}</h3>
              <p className="text-muted-foreground mt-2">{faqs.heroSection.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>FAQ Items</span>
            <Dialog open={openFaqDialog} onOpenChange={setOpenFaqDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setNewQuestion("")
                    setNewAnswer("")
                    setEditIndex(null)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editIndex !== null ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label htmlFor="question" className="block text-sm font-medium mb-1">
                      Question
                    </label>
                    <Input
                      id="question"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter question"
                    />
                  </div>
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium mb-1">
                      Answer
                    </label>
                    <Textarea
                      id="answer"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Enter answer"
                      rows={5}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setOpenFaqDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddOrUpdateFaq}>{editIndex !== null ? "Update FAQ" : "Add FAQ"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {faqs.faqs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No FAQs added yet. Click the "Add FAQ" button to create your first FAQ.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {faqs.faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <div className="flex items-center justify-between w-full border-b">
                    <AccordionTrigger className="flex-1">{faq.question}</AccordionTrigger>
                    <div className="flex items-center space-x-2 pr-4">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleEditFaq(faq, index)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleDeleteFaq(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Contact Section</span>
            <Button variant="outline" size="sm" onClick={() => setIsEditingContact(!isEditingContact)}>
              {isEditingContact ? <Save className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              {isEditingContact ? "Save" : "Edit"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingContact ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="contactTitle" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="contactTitle"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  placeholder="Enter contact section title"
                />
              </div>
              <div>
                <label htmlFor="contactDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="contactDescription"
                  value={contactDescription}
                  onChange={(e) => setContactDescription(e.target.value)}
                  placeholder="Enter contact section description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditingContact(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveContactSection}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-lg">{faqs.contactSection.title}</h3>
              <p className="text-muted-foreground mt-2">{faqs.contactSection.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
