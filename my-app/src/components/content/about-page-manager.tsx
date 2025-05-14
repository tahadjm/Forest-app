"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Pencil, Save, Plus, Trash2, Award, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AboutPageService } from "@/services/content-service"
import { uploadMedia, deleteFile } from "@/utils/uploadImage"
import type { AboutPage, TeamMember, Value, Stat } from "@/types/aboutPage"
import Image from "next/image"

export function AboutPageManager() {
  const [aboutPage, setAboutPage] = useState<AboutPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  // Hero Section
  const [heroTitle, setHeroTitle] = useState("")
  const [heroDescription, setHeroDescription] = useState("")
  const [isEditingHero, setIsEditingHero] = useState(false)

  // About Section
  const [aboutTitle, setAboutTitle] = useState("")
  const [aboutParagraph, setAboutParagraph] = useState("")
  const [aboutHistory, setAboutHistory] = useState("")
  const [aboutCommitment, setAboutCommitment] = useState("")
  const [aboutImage, setAboutImage] = useState("")
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null)
  const [yearsExperience, setYearsExperience] = useState(0)
  const [isEditingAbout, setIsEditingAbout] = useState(false)

  // Team Members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [openTeamDialog, setOpenTeamDialog] = useState(false)
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember | null>(null)
  const [teamMemberName, setTeamMemberName] = useState("")
  const [teamMemberRole, setTeamMemberRole] = useState("")
  const [teamMemberImage, setTeamMemberImage] = useState("")
  const [teamMemberImageFile, setTeamMemberImageFile] = useState<File | null>(null)
  const [editTeamIndex, setEditTeamIndex] = useState<number | null>(null)

  // Values
  const [values, setValues] = useState<Value[]>([])
  const [openValueDialog, setOpenValueDialog] = useState(false)
  const [valueTitle, setValueTitle] = useState("")
  const [valueDescription, setValueDescription] = useState("")
  const [valueIcon, setValueIcon] = useState("")
  const [editValueIndex, setEditValueIndex] = useState<number | null>(null)

  // Stats
  const [stats, setStats] = useState<Stat[]>([])
  const [openStatDialog, setOpenStatDialog] = useState(false)
  const [statValue, setStatValue] = useState("")
  const [statLabel, setStatLabel] = useState("")
  const [editStatIndex, setEditStatIndex] = useState<number | null>(null)

  // SEO
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [isEditingSEO, setIsEditingSEO] = useState(false)

  useEffect(() => {
    fetchAboutPage()
  }, [])

  // Update the fetchAboutPage function to handle the nested data structure
  const fetchAboutPage = async () => {
    try {
      setLoading(true)
      const response = await AboutPageService.getAboutPage()
      console.log("Fetched About Page Data:", response)

      // Check if response has a data property (nested structure)
      const aboutPageData =
        response && response.length > 0 ? response[0] : response && response.data ? response.data : null

      if (aboutPageData) {
        // Initialize content object if it doesn't exist
        if (aboutPageData.aboutSection && !aboutPageData.aboutSection.content) {
          aboutPageData.aboutSection.content = {
            paragraph: "",
            history: "",
            commitment: "",
          }
        }

        setAboutPage(aboutPageData)

        // Set hero section
        setHeroTitle(aboutPageData.heroSection?.title || "")
        setHeroDescription(aboutPageData.heroSection?.description || "")

        // Set about section - with null checks
        setAboutTitle(aboutPageData.aboutSection?.title || "")
        setAboutParagraph(aboutPageData.aboutSection?.content?.paragraph || "")
        setAboutHistory(aboutPageData.aboutSection?.content?.history || "")
        setAboutCommitment(aboutPageData.aboutSection?.content?.commitment || "")
        setAboutImage(aboutPageData.aboutSection?.mainImage || "")
        setYearsExperience(aboutPageData.aboutSection?.yearsExperience || 0)

        // Set team members
        setTeamMembers(aboutPageData.teamMembers || [])

        // Set values
        setValues(aboutPageData.values || [])

        // Set stats
        setStats(aboutPageData.stats || [])

        // Set SEO
        setMetaTitle(aboutPageData.seo?.metaTitle || "")
        setMetaDescription(aboutPageData.seo?.metaDescription || "")
        setKeywords(aboutPageData.seo?.keywords || [])
      } else {
        // Initialize with empty data if no data is returned
        setAboutPage({
          heroSection: { title: "", description: "" },
          aboutSection: {
            title: "",
            content: { paragraph: "", history: "", commitment: "" },
            mainImage: "",
            yearsExperience: 0,
          },
          teamMembers: [],
          values: [],
          stats: [],
          seo: { metaTitle: "", metaDescription: "", keywords: [] },
          lastUpdated: new Date(),
        })
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching about page:", err)
      setError("Failed to load about page. Please try again.")
      setLoading(false)
    }
  }

  const handleSaveHeroSection = async () => {
    if (!aboutPage) return

    try {
      const updatedAboutPage = {
        ...aboutPage,
        heroSection: {
          title: heroTitle,
          description: heroDescription,
        },
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setIsEditingHero(false)
      toast.success("Hero section updated successfully")
    } catch (err) {
      console.error("Error updating hero section:", err)
      toast.error("Failed to update hero section")
    }
  }

  const handleSaveAboutSection = async () => {
    if (!aboutPage) return

    try {
      let imageUrl = aboutImage

      // Upload new image if selected
      if (aboutImageFile) {
        const uploadedImageUrl = await uploadMedia(aboutImageFile)
        if (uploadedImageUrl) {
          // If there was a previous image, delete it
          if (aboutPage.aboutSection.mainImage && aboutPage.aboutSection.mainImage !== imageUrl) {
            try {
              // Extract filename from URL
              const filename = aboutPage.aboutSection.mainImage.split("/").pop()
              if (filename) {
                await deleteFile(filename)
              }
            } catch (err) {
              console.error("Error deleting old image:", err)
            }
          }
          imageUrl = uploadedImageUrl
        }
      }

      const updatedAboutPage = {
        ...aboutPage,
        aboutSection: {
          title: aboutTitle,
          content: {
            paragraph: aboutParagraph,
            history: aboutHistory,
            commitment: aboutCommitment,
          },
          mainImage: imageUrl,
          yearsExperience: yearsExperience,
        },
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setIsEditingAbout(false)
      toast.success("About section updated successfully")
    } catch (err) {
      console.error("Error updating about section:", err)
      toast.error("Failed to update about section")
    }
  }

  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAboutImageFile(e.target.files[0])
      setAboutImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleTeamMemberImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTeamMemberImageFile(e.target.files[0])
      setTeamMemberImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const resetTeamMemberForm = () => {
    setTeamMemberName("")
    setTeamMemberRole("")
    setTeamMemberImage("")
    setTeamMemberImageFile(null)
    setEditTeamIndex(null)
  }

  const handleOpenTeamDialog = (member?: TeamMember, index?: number) => {
    if (member && index !== undefined) {
      setTeamMemberName(member.name)
      setTeamMemberRole(member.role)
      setTeamMemberImage(member.image)
      setEditTeamIndex(index)
    } else {
      resetTeamMemberForm()
    }
    setOpenTeamDialog(true)
  }

  const handleSaveTeamMember = async () => {
    if (!aboutPage) return
    if (!teamMemberName || !teamMemberRole) {
      toast.error("Name and role are required")
      return
    }

    try {
      let imageUrl = teamMemberImage

      // Upload new image if selected
      if (teamMemberImageFile) {
        const uploadedImageUrl = await uploadMedia(teamMemberImageFile)
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl
        }
      }

      const newTeamMember: TeamMember = {
        name: teamMemberName,
        role: teamMemberRole,
        image: imageUrl,
      }

      let updatedTeamMembers: TeamMember[]

      if (editTeamIndex !== null) {
        // Update existing team member
        updatedTeamMembers = [...teamMembers]
        updatedTeamMembers[editTeamIndex] = newTeamMember
      } else {
        // Add new team member
        updatedTeamMembers = [...teamMembers, newTeamMember]
      }

      const updatedAboutPage = {
        ...aboutPage,
        teamMembers: updatedTeamMembers,
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setTeamMembers(updatedTeamMembers)
      setOpenTeamDialog(false)
      resetTeamMemberForm()
      toast.success(editTeamIndex !== null ? "Team member updated successfully" : "Team member added successfully")
    } catch (err) {
      console.error("Error saving team member:", err)
      toast.error("Failed to save team member")
    }
  }

  const handleDeleteTeamMember = async (index: number) => {
    if (!aboutPage) return

    try {
      const updatedTeamMembers = teamMembers.filter((_, i) => i !== index)
      const updatedAboutPage = {
        ...aboutPage,
        teamMembers: updatedTeamMembers,
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setTeamMembers(updatedTeamMembers)
      toast.success("Team member deleted successfully")
    } catch (err) {
      console.error("Error deleting team member:", err)
      toast.error("Failed to delete team member")
    }
  }

  const resetValueForm = () => {
    setValueTitle("")
    setValueDescription("")
    setValueIcon("")
    setEditValueIndex(null)
  }

  const handleOpenValueDialog = (value?: Value, index?: number) => {
    if (value && index !== undefined) {
      setValueTitle(value.title)
      setValueDescription(value.description)
      setValueIcon(value.icon)
      setEditValueIndex(index)
    } else {
      resetValueForm()
    }
    setOpenValueDialog(true)
  }

  const handleSaveValue = async () => {
    if (!aboutPage) return
    if (!valueTitle || !valueDescription || !valueIcon) {
      toast.error("Title, description, and icon are required")
      return
    }

    try {
      const newValue: Value = {
        title: valueTitle,
        description: valueDescription,
        icon: valueIcon,
      }

      let updatedValues: Value[]

      if (editValueIndex !== null) {
        // Update existing value
        updatedValues = [...values]
        updatedValues[editValueIndex] = newValue
      } else {
        // Add new value
        updatedValues = [...values, newValue]
      }

      const updatedAboutPage = {
        ...aboutPage,
        values: updatedValues,
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setValues(updatedValues)
      setOpenValueDialog(false)
      resetValueForm()
      toast.success(editValueIndex !== null ? "Value updated successfully" : "Value added successfully")
    } catch (err) {
      console.error("Error saving value:", err)
      toast.error("Failed to save value")
    }
  }

  const handleDeleteValue = async (index: number) => {
    if (!aboutPage) return

    try {
      const updatedValues = values.filter((_, i) => i !== index)
      const updatedAboutPage = {
        ...aboutPage,
        values: updatedValues,
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setValues(updatedValues)
      toast.success("Value deleted successfully")
    } catch (err) {
      console.error("Error deleting value:", err)
      toast.error("Failed to delete value")
    }
  }

  const resetStatForm = () => {
    setStatValue("")
    setStatLabel("")
    setEditStatIndex(null)
  }

  const handleOpenStatDialog = (stat?: Stat, index?: number) => {
    if (stat && index !== undefined) {
      setStatValue(stat.value)
      setStatLabel(stat.label)
      setEditStatIndex(index)
    } else {
      resetStatForm()
    }
    setOpenStatDialog(true)
  }

  const handleSaveStat = async () => {
    if (!aboutPage) return
    if (!statValue || !statLabel) {
      toast.error("Value and label are required")
      return
    }

    try {
      const newStat: Stat = {
        value: statValue,
        label: statLabel,
      }

      let updatedStats: Stat[]

      if (editStatIndex !== null) {
        // Update existing stat
        updatedStats = [...stats]
        updatedStats[editStatIndex] = newStat
      } else {
        // Add new stat
        updatedStats = [...stats, newStat]
      }

      const updatedAboutPage = {
        ...aboutPage,
        stats: updatedStats,
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setStats(updatedStats)
      setOpenStatDialog(false)
      resetStatForm()
      toast.success(editStatIndex !== null ? "Stat updated successfully" : "Stat added successfully")
    } catch (err) {
      console.error("Error saving stat:", err)
      toast.error("Failed to save stat")
    }
  }

  const handleDeleteStat = async (index: number) => {
    if (!aboutPage) return

    try {
      const updatedStats = stats.filter((_, i) => i !== index)
      const updatedAboutPage = {
        ...aboutPage,
        stats: updatedStats,
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setStats(updatedStats)
      toast.success("Stat deleted successfully")
    } catch (err) {
      console.error("Error deleting stat:", err)
      toast.error("Failed to delete stat")
    }
  }

  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword])
      setNewKeyword("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const handleSaveSEO = async () => {
    if (!aboutPage) return

    try {
      const updatedAboutPage = {
        ...aboutPage,
        seo: {
          metaTitle,
          metaDescription,
          keywords,
        },
      }

      await AboutPageService.updateAboutPage(aboutPage._id || "", updatedAboutPage)
      setAboutPage(updatedAboutPage)
      setIsEditingSEO(false)
      toast.success("SEO information updated successfully")
    } catch (err) {
      console.error("Error updating SEO information:", err)
      toast.error("Failed to update SEO information")
    }
  }

  if (loading) return <div className="text-center py-8">Loading about page content...</div>
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>
  if (!aboutPage)
    return <div className="text-center py-8">No about page content found. Create new content to get started.</div>

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
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
                  <h3 className="font-semibold text-lg">{aboutPage.heroSection?.title || "No title set"}</h3>
                  <p className="text-muted-foreground mt-2">
                    {aboutPage.heroSection?.description || "No description set"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>About Section</span>
                <Button variant="outline" size="sm" onClick={() => setIsEditingAbout(!isEditingAbout)}>
                  {isEditingAbout ? <Save className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                  {isEditingAbout ? "Save" : "Edit"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingAbout ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="aboutTitle" className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <Input
                      id="aboutTitle"
                      value={aboutTitle}
                      onChange={(e) => setAboutTitle(e.target.value)}
                      placeholder="Enter about section title"
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutParagraph" className="block text-sm font-medium mb-1">
                      Main Paragraph
                    </label>
                    <Textarea
                      id="aboutParagraph"
                      value={aboutParagraph}
                      onChange={(e) => setAboutParagraph(e.target.value)}
                      placeholder="Enter main paragraph"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutHistory" className="block text-sm font-medium mb-1">
                      History
                    </label>
                    <Textarea
                      id="aboutHistory"
                      value={aboutHistory}
                      onChange={(e) => setAboutHistory(e.target.value)}
                      placeholder="Enter history"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutCommitment" className="block text-sm font-medium mb-1">
                      Commitment
                    </label>
                    <Textarea
                      id="aboutCommitment"
                      value={aboutCommitment}
                      onChange={(e) => setAboutCommitment(e.target.value)}
                      placeholder="Enter commitment"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="yearsExperience" className="block text-sm font-medium mb-1">
                      Years of Experience
                    </label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number.parseInt(e.target.value) || 0)}
                      placeholder="Enter years of experience"
                    />
                  </div>
                  <div>
                    <label htmlFor="aboutImage" className="block text-sm font-medium mb-1">
                      Main Image
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="aboutImage"
                        type="file"
                        accept="image/*"
                        onChange={handleAboutImageChange}
                        className="flex-1"
                      />
                      {(aboutImage || aboutImageFile) && (
                        <div className="w-20 h-20 relative">
                          <Image
                            src={aboutImageFile ? URL.createObjectURL(aboutImageFile) : aboutImage}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-md"
                            crossOrigin="anonymous"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditingAbout(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAboutSection}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{aboutPage.aboutSection?.title || "No title set"}</h3>
                    <p className="text-muted-foreground mt-2">
                      {aboutPage.aboutSection?.content?.paragraph || "No main paragraph set"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">History</h4>
                      <p className="text-muted-foreground mt-1">
                        {aboutPage.aboutSection?.content?.history || "No history set"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Commitment</h4>
                      <p className="text-muted-foreground mt-1">
                        {aboutPage.aboutSection?.content?.commitment || "No commitment set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {aboutPage.aboutSection?.yearsExperience || 0} Years of Experience
                    </span>
                  </div>
                  {aboutPage.aboutSection?.mainImage && (
                    <div className="mt-4">
                      <Image
                        src={aboutPage.aboutSection.mainImage || "/placeholder.svg"}
                        alt="About section"
                        width={192}
                        height={192}
                        className="max-h-48 rounded-md object-cover"
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Dialog open={openTeamDialog} onOpenChange={setOpenTeamDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenTeamDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editTeamIndex !== null ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label htmlFor="teamMemberName" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <Input
                      id="teamMemberName"
                      value={teamMemberName}
                      onChange={(e) => setTeamMemberName(e.target.value)}
                      placeholder="Enter team member name"
                    />
                  </div>
                  <div>
                    <label htmlFor="teamMemberRole" className="block text-sm font-medium mb-1">
                      Role
                    </label>
                    <Input
                      id="teamMemberRole"
                      value={teamMemberRole}
                      onChange={(e) => setTeamMemberRole(e.target.value)}
                      placeholder="Enter team member role"
                    />
                  </div>
                  <div>
                    <label htmlFor="teamMemberImage" className="block text-sm font-medium mb-1">
                      Image
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="teamMemberImage"
                        type="file"
                        accept="image/*"
                        onChange={handleTeamMemberImageChange}
                        className="flex-1"
                      />
                      {(teamMemberImage || teamMemberImageFile) && (
                        <div className="w-20 h-20 relative">
                          <Image
                            src={teamMemberImageFile ? URL.createObjectURL(teamMemberImageFile) : teamMemberImage}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-full"
                            crossOrigin="anonymous"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setOpenTeamDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTeamMember}>
                    {editTeamIndex !== null ? "Update Team Member" : "Add Team Member"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members added yet. Click the "Add Team Member" button to add your first team member.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="p-4 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                      <Image
                        src={member.image || "/placeholder.svg?height=96&width=96"}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                  </div>
                  <CardContent className="pt-0 flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenTeamDialog(member, index)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteTeamMember(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Values Tab */}
        <TabsContent value="values" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Company Values</h2>
            <Dialog open={openValueDialog} onOpenChange={setOpenValueDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenValueDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editValueIndex !== null ? "Edit Value" : "Add New Value"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label htmlFor="valueTitle" className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <Input
                      id="valueTitle"
                      value={valueTitle}
                      onChange={(e) => setValueTitle(e.target.value)}
                      placeholder="Enter value title"
                    />
                  </div>
                  <div>
                    <label htmlFor="valueDescription" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Textarea
                      id="valueDescription"
                      value={valueDescription}
                      onChange={(e) => setValueDescription(e.target.value)}
                      placeholder="Enter value description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="valueIcon" className="block text-sm font-medium mb-1">
                      Icon Name
                    </label>
                    <Input
                      id="valueIcon"
                      value={valueIcon}
                      onChange={(e) => setValueIcon(e.target.value)}
                      placeholder="Enter icon name (e.g., Shield, BookOpen)"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setOpenValueDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveValue}>{editValueIndex !== null ? "Update Value" : "Add Value"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {values.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No values added yet. Click the "Add Value" button to add your first company value.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                  <div className="px-6 pb-4 flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenValueDialog(value, index)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteValue(index)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Statistics</h2>
            <Dialog open={openStatDialog} onOpenChange={setOpenStatDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenStatDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editStatIndex !== null ? "Edit Statistic" : "Add New Statistic"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label htmlFor="statValue" className="block text-sm font-medium mb-1">
                      Value
                    </label>
                    <Input
                      id="statValue"
                      value={statValue}
                      onChange={(e) => setStatValue(e.target.value)}
                      placeholder="Enter stat value (e.g., 500+)"
                    />
                  </div>
                  <div>
                    <label htmlFor="statLabel" className="block text-sm font-medium mb-1">
                      Label
                    </label>
                    <Input
                      id="statLabel"
                      value={statLabel}
                      onChange={(e) => setStatLabel(e.target.value)}
                      placeholder="Enter stat label (e.g., Happy Customers)"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setOpenStatDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveStat}>{editStatIndex !== null ? "Update Stat" : "Add Stat"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {stats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No statistics added yet. Click the "Add Stat" button to add your first statistic.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                    <div className="mt-4 flex justify-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenStatDialog(stat, index)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteStat(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>SEO Information</span>
                <Button variant="outline" size="sm" onClick={() => setIsEditingSEO(!isEditingSEO)}>
                  {isEditingSEO ? <Save className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                  {isEditingSEO ? "Save" : "Edit"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingSEO ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium mb-1">
                      Meta Title
                    </label>
                    <Input
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Enter meta title"
                    />
                  </div>
                  <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium mb-1">
                      Meta Description
                    </label>
                    <Textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Enter meta description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Keywords</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <button
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="ml-1 text-xs rounded-full hover:bg-muted p-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Add keyword"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={handleAddKeyword}>
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditingSEO(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSEO}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Meta Title</h3>
                    <p className="text-muted-foreground">{metaTitle || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Meta Description</h3>
                    <p className="text-muted-foreground">{metaDescription || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Keywords</h3>
                    {keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No keywords set</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
