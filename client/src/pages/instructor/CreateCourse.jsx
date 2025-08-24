import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  BookOpen,
  Video,
  FileText,
  DollarSign,
  Globe,
  Users,
  Clock,
  Star,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Eye,
  Settings,
} from "lucide-react"

const steps = [
  { id: "basic", title: "Basic Info", icon: BookOpen },
  { id: "curriculum", title: "Curriculum", icon: Video },
  { id: "pricing", title: "Pricing", icon: DollarSign },
  { id: "publish", title: "Publish", icon: Globe },
]

export default function CreateCourse() {
  const [currentStep, setCurrentStep] = useState(0)
  const [courseData, setCourseData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    subcategory: "",
    language: "",
    level: "",
    thumbnail: null,
    promotionalVideo: null,
    price: "",
    currency: "USD",
    discountPrice: "",
    freePreview: false,
    certificate: true,
    lifetime: true,
  })

  const [sections, setSections] = useState([
    {
      id: "1",
      title: "Introduction",
      lessons: [
        { id: "1", title: "Welcome to the Course", type: "video", duration: "5:30" },
        { id: "2", title: "Course Overview", type: "text", duration: "10 min read" },
      ],
    },
  ])

  const progress = ((currentStep + 1) / steps.length) * 100

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: "New Section",
      lessons: [],
    }
    setSections([...sections, newSection])
  }

  const addLesson = (sectionId) => {
    const newLesson = {
      id: Date.now().toString(),
      title: "New Lesson",
      type: "video",
      duration: "0:00",
    }
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, lessons: [...section.lessons, newLesson] } : section,
      ),
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete Web Development Bootcamp"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Your title should be a mix of attention-grabbing, informative, and optimized for search
                </p>
              </div>

              <div>
                <Label htmlFor="subtitle">Course Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g., Learn HTML, CSS, JavaScript, Node.js, React & More!"
                  value={courseData.subtitle}
                  onChange={(e) => setCourseData({ ...courseData, subtitle: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in your course..."
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(value) => setCourseData({ ...courseData, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subcategory</Label>
                  <Select
                    value={courseData.subcategory}
                    onValueChange={(value) => setCourseData({ ...courseData, subcategory: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="programming-languages">Programming Languages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Language *</Label>
                  <Select
                    value={courseData.language}
                    onValueChange={(value) => setCourseData({ ...courseData, language: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="portuguese">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Level *</Label>
                  <Select
                    value={courseData.level}
                    onValueChange={(value) => setCourseData({ ...courseData, level: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate Level</SelectItem>
                      <SelectItem value="advanced">Advanced Level</SelectItem>
                      <SelectItem value="all">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Course Thumbnail</Label>
                  <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload your course thumbnail (1280x720px recommended)
                    </p>
                    <Button variant="outline" className="mt-2 bg-transparent">
                      Choose File
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Promotional Video</Label>
                  <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload a promotional video to showcase your course
                    </p>
                    <Button variant="outline" className="mt-2 bg-transparent">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Course Curriculum</h3>
                <p className="text-sm text-muted-foreground">Organize your course content into sections and lessons</p>
              </div>
              <Button onClick={addSection} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Input
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...sections]
                            newSections[sectionIndex].title = e.target.value
                            setSections(newSections)
                          }}
                          className="font-semibold"
                        />
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          {lesson.type === "video" && <Video className="h-4 w-4" />}
                          {lesson.type === "text" && <FileText className="h-4 w-4" />}
                          {lesson.type === "quiz" && <BookOpen className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <Input
                            value={lesson.title}
                            onChange={(e) => {
                              const newSections = [...sections]
                              newSections[sectionIndex].lessons[lessonIndex].title = e.target.value
                              setSections(newSections)
                            }}
                            className="border-0 p-0 h-auto font-medium"
                          />
                        </div>
                        <Badge variant="secondary">{lesson.duration}</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addLesson(section.id)} className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Course Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Set the price for your course and configure payment options
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup defaultValue="paid" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="flex-1">
                      <div className="font-medium">Free</div>
                      <div className="text-sm text-muted-foreground">Make your course available for free</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid" className="flex-1">
                      <div className="font-medium">Paid</div>
                      <div className="text-sm text-muted-foreground">Set a price for your course</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Course Price *</Label>
                    <div className="flex mt-1">
                      <Select
                        value={courseData.currency}
                        onValueChange={(value) => setCourseData({ ...courseData, currency: value })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">$</SelectItem>
                          <SelectItem value="EUR">€</SelectItem>
                          <SelectItem value="GBP">£</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="price"
                        type="number"
                        placeholder="99.99"
                        value={courseData.price}
                        onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                        className="flex-1 rounded-l-none"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="discount-price">Discount Price (Optional)</Label>
                    <div className="flex mt-1">
                      <div className="w-20 flex items-center justify-center border border-r-0 rounded-l-md bg-muted text-muted-foreground">
                        {courseData.currency === "USD" ? "$" : courseData.currency === "EUR" ? "€" : "£"}
                      </div>
                      <Input
                        id="discount-price"
                        type="number"
                        placeholder="79.99"
                        value={courseData.discountPrice}
                        onChange={(e) => setCourseData({ ...courseData, discountPrice: e.target.value })}
                        className="flex-1 rounded-l-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="free-preview">Free Preview</Label>
                      <p className="text-sm text-muted-foreground">Allow students to preview some lessons for free</p>
                    </div>
                    <Switch
                      id="free-preview"
                      checked={courseData.freePreview}
                      onCheckedChange={(checked) => setCourseData({ ...courseData, freePreview: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="certificate">Certificate of Completion</Label>
                      <p className="text-sm text-muted-foreground">
                        Provide a certificate when students complete the course
                      </p>
                    </div>
                    <Switch
                      id="certificate"
                      checked={courseData.certificate}
                      onCheckedChange={(checked) => setCourseData({ ...courseData, certificate: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lifetime">Lifetime Access</Label>
                      <p className="text-sm text-muted-foreground">Students get lifetime access to course content</p>
                    </div>
                    <Switch
                      id="lifetime"
                      checked={courseData.lifetime}
                      onCheckedChange={(checked) => setCourseData({ ...courseData, lifetime: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Publish Your Course</h3>
              <p className="text-sm text-muted-foreground">Review your course details and publish when ready</p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Course Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{courseData.title || "Course Title"}</h4>
                      <p className="text-muted-foreground">{courseData.subtitle || "Course subtitle"}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />0 students
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {sections.reduce((total, section) => total + section.lessons.length, 0)} lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        New course
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      {courseData.currency === "USD" ? "$" : courseData.currency === "EUR" ? "€" : "£"}
                      {courseData.price || "0"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publishing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup defaultValue="draft" className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="draft" id="draft" />
                      <Label htmlFor="draft" className="flex-1">
                        <div className="font-medium">Save as Draft</div>
                        <div className="text-sm text-muted-foreground">Save your course and continue editing later</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="review" id="review" />
                      <Label htmlFor="review" className="flex-1">
                        <div className="font-medium">Submit for Review</div>
                        <div className="text-sm text-muted-foreground">
                          Submit your course for quality review before publishing
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="publish" id="publish" />
                      <Label htmlFor="publish" className="flex-1">
                        <div className="font-medium">Publish Now</div>
                        <div className="text-sm text-muted-foreground">
                          Make your course immediately available to students
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Create New Course</h1>
              <p className="text-muted-foreground">Share your knowledge with students around the world</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">Save Draft</Button>
              <Button variant="outline">Preview</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${isCompleted ? "bg-secondary" : "bg-border"}`} />
                  )}
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  // Handle course creation/publishing
                  console.log("Publishing course...", courseData, sections)
                } else {
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                }
              }}
            >
              {currentStep === steps.length - 1 ? "Publish Course" : "Next"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
