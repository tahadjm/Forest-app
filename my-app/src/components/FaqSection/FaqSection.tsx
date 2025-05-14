"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/ui/hero-section"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react"
import type { FAQDocument } from "@/types/FAQ"
import { FAQService } from "@/services/index"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function FaqSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [faqs, setFaqs] = useState<FAQDocument["faqs"]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactSection, setcontactSection] = useState<FAQDocument["contactSection"]>([])

  const fetchFaqs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await FAQService.getFaqs()
      setFaqs(data.faqs || [])
      setcontactSection(data.contactSection || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])
  console.log("FAQs:", faqs)

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs

  return (
    <section className="w-full py-12 md:py-24">
      <HeroSection
        title="Frequently Asked Questions"
        description="Find answers to common questions about our adventure parks"
        backgroundType="color"
        height="small"
        className="mb-12"
      />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {error ? (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-4">
                <p>{error}</p>
                <Button variant="outline" size="sm" className="w-fit" onClick={fetchFaqs}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="relative mb-8">
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2"
                    onClick={() => setSearchQuery("")}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading FAQs...</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      {faqs.length === 0
                        ? "No FAQs available at the moment."
                        : "No matching questions found. Try a different search term."}
                    </p>
                  )}
                </Accordion>
              )}
            </>
          )}

          {contactSection ? (
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-4">{contactSection.title}</h3>
              <p className="text-muted-foreground mb-6">{contactSection.description}</p>
              <Button>Contact Support</Button>
            </div>
          ) : (
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-4">Still h?</h3>
              <p className="text-muted-foreground mb-6">
                Our customer support team is here to help you with any other questions you might have.
              </p>
              <Button>Contact Support</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
