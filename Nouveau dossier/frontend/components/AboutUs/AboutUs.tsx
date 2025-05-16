"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { HeroSection } from "@/components/ui/hero-section"
import { useEffect, useState } from "react"
import type { AboutPage } from "@/types/aboutPage"
import { AboutPageService } from "@/services/index"

export const AboutSection = () => {
  const [about, setAbout] = useState<AboutPage | null>(null)

  useEffect(() => {
    const fetchAboutPage = async () => {
      try {
        const response = await AboutPageService.getAboutPage()
        console.log("response of about page details", response.data)
        setAbout(response.data)
      } catch (error) {
        console.error("Error fetching about page:", error)
      }
    }
    fetchAboutPage()
  }, [])
  if (!about) {
  }
  return (
    <section id="about" className="py-20 bg-white">
      <HeroSection
        title={about?.heroSection?.title || "About Our Adventure Parks"}
        description={
          about?.heroSection?.description ||
          "Discover our story and mission to provide thrilling outdoor experiences for everyone"
        }
        backgroundType="color"
        height="small"
        className="mb-12"
      />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              {about?.aboutSection?.title || "À Propos de Nous"}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-24 h-1 bg-primary mx-auto mb-6"
            ></motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              {about?.aboutSection?.content?.text ||
                "Depuis plus de 15 ans, nous proposons des expériences d'aventure inoubliables au cœur de la nature. Notre mission est de vous offrir des moments d'évasion, de dépassement de soi et de connexion avec l'environnement."}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={about?.aboutSection?.mainImage || "/placeholder.svg?height=600&width=800"}
                  alt="Notre équipe d'experts"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-primary text-white p-6 rounded-lg shadow-lg hidden md:block">
                <p className="text-3xl font-bold">{about?.aboutSection?.yearsExperience || 15}+</p>
                <p className="text-sm uppercase tracking-wider">Années d'expérience</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-gray-900">Notre Histoire</h3>
              <p className="text-gray-600">
                Fondée en 2008 par une équipe de passionnés d'activités de plein air, notre entreprise a commencé avec
                un seul parc d'accrobranche. Aujourd'hui, nous gérons 8 parcs à travers le pays, chacun offrant des
                expériences uniques adaptées à son environnement naturel.
              </p>

              <h3 className="text-3xl font-bold text-gray-900 pt-4">Notre Engagement</h3>
              <p className="text-gray-600">
                Nous nous engageons à offrir des activités respectueuses de l'environnement. Nos installations sont
                conçues pour minimiser l'impact sur la nature, et nous participons activement à des programmes de
                reboisement et de conservation.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {about?.stats?.map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-primary text-4xl font-bold">{stat.value}</div>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                )) || (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-primary text-4xl font-bold">100%</div>
                      <p className="text-gray-600">Équipement certifié</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-primary text-4xl font-bold">50K+</div>
                      <p className="text-gray-600">Visiteurs par an</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-primary text-4xl font-bold">8</div>
                      <p className="text-gray-600">Parcs d'aventure</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-primary text-4xl font-bold">30+</div>
                      <p className="text-gray-600">Parcours différents</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <div className="mt-20">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 text-center mb-12"
            >
              Notre Équipe de Direction
            </motion.h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {about?.teamMembers?.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="relative mx-auto w-48 h-48 mb-4 rounded-full overflow-hidden shadow-lg">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-gray-600">{member.role}</p>
                </motion.div>
              )) ||
                // Fallback hardcoded team members if data is not available
                [
                  {
                    name: "Marie Dupont",
                    role: "Directrice Générale",
                    image: "/placeholder.svg?height=300&width=300",
                  },
                  {
                    name: "Thomas Laurent",
                    role: "Directeur des Opérations",
                    image: "/placeholder.svg?height=300&width=300",
                  },
                  {
                    name: "Sophie Moreau",
                    role: "Responsable Sécurité",
                    image: "/placeholder.svg?height=300&width=300",
                  },
                  {
                    name: "Jean Petit",
                    role: "Directeur Technique",
                    image: "/placeholder.svg?height=300&width=300",
                  },
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="relative mx-auto w-48 h-48 mb-4 rounded-full overflow-hidden shadow-lg">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        fill
                        className="object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-gray-600">{member.role}</p>
                  </motion.div>
                ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-20 bg-gray-50 p-10 rounded-2xl shadow-sm"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900">Nos Valeurs</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {about?.values?.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          value.iconPath ||
                          "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        }
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )) || (
                // Fallback hardcoded values if data is not available
                <>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Sécurité</h4>
                    <p className="text-gray-600">
                      La sécurité est notre priorité absolue. Tous nos équipements sont vérifiés quotidiennement et
                      notre personnel est formé aux protocoles de sécurité les plus stricts.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Respect de la Nature</h4>
                    <p className="text-gray-600">
                      Nous concevons nos parcours en harmonie avec l'environnement naturel, en minimisant notre
                      empreinte écologique et en sensibilisant nos visiteurs.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Plaisir et Aventure</h4>
                    <p className="text-gray-600">
                      Nous créons des expériences qui combinent adrénaline, dépassement de soi et plaisir, accessibles à
                      tous les niveaux et à tous les âges.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <div className="text-center mt-16 text-sm text-gray-500">
        {about?.lastUpdated && <p>Dernière mise à jour: {new Date(about.lastUpdated).toLocaleDateString()}</p>}
      </div>
    </section>
  )
}
