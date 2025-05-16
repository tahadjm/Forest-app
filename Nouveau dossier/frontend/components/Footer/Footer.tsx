"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-muted-foreground mb-0">
                Subscribe to our newsletter for the latest adventure news, special offers, and upcoming events.
              </p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3">
                <Input type="email" placeholder="Your email address" className="flex-1" required />
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-8 w-8 overflow-hidden">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full text-primary"
                >
                  <path
                    d="M12 3L4 9V21H20V9L12 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                  <path
                    d="M9 21V12H15V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg">Adventure Park</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Experience the thrill of adventure in our beautiful parks across the country. Perfect for families,
              friends, and adventure seekers.
            </p>
            <div className="flex gap-4">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Button>
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </Link>
              <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/parks" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Parks
                </Link>
              </li>
              <li>
                <Link href="/activities" className="text-muted-foreground hover:text-primary transition-colors">
                  Activities
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services/group-bookings"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Group Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/services/corporate-events"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Corporate Events
                </Link>
              </li>
              <li>
                <Link
                  href="/services/birthday-parties"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Birthday Parties
                </Link>
              </li>
              <li>
                <Link
                  href="/services/school-trips"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  School Trips
                </Link>
              </li>
              <li>
                <Link
                  href="/services/seasonal-events"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Seasonal Events
                </Link>
              </li>
              <li>
                <Link
                  href="/services/gift-cards"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-muted-foreground">
                  123 Adventure Way
                  <br />
                  Outdoor City, OC 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <a
                  href="mailto:info@adventurepark.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  info@adventurepark.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 border-t text-center sm:flex sm:justify-between sm:text-left">
          <p className="text-sm text-muted-foreground">© {currentYear} Adventure Park. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-4">
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
