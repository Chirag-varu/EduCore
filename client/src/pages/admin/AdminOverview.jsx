import React, { useState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";
import axiosInstance from "../../api/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Calendar,
  User,
  Mail,
} from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructorsPagination, setInstructorsPagination] = useState({});
  const [studentsPagination, setStudentsPagination] = useState({});
  const [instructorSearch, setInstructorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedInstructor, setExpandedInstructor] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverviewStats();
    fetchInstructors();
    fetchStudents();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const response = await axiosInstance.get("/admin/overview/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to load overview statistics",
        variant: "destructive",
      });
    }
  };

  const fetchInstructors = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/admin/overview/instructors?page=${page}&limit=10&search=${search}`
      );
      if (response.data.success) {
        setInstructors(response.data.data.instructors);
        setInstructorsPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast({
        title: "Error",
        description: "Failed to load instructors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/admin/overview/students?page=${page}&limit=10&search=${search}`
      );
      if (response.data.success) {
        setStudents(response.data.data.students);
        setStudentsPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorSearch = (e) => {
    e.preventDefault();
    fetchInstructors(1, instructorSearch);
  };

  const handleStudentSearch = (e) => {
    e.preventDefault();
    fetchStudents(1, studentSearch);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">
          View all instructors, students and their courses
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Instructors
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.stats.totalInstructors}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.stats.totalStudents}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.stats.totalCourses}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.stats.publishedCourses} published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats.stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.stats.totalOrders} orders
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Orders */}
      {stats?.recentOrders?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {order.courseTitle}
                    </TableCell>
                    <TableCell>{formatPrice(order.coursePricing)}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Instructors and Students */}
      <Tabs defaultValue="instructors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="instructors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Instructors
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
        </TabsList>

        {/* Instructors Tab */}
        <TabsContent value="instructors">
          <Card>
            <CardHeader>
              <CardTitle>All Instructors</CardTitle>
              <CardDescription>
                View instructors and the courses they have created
              </CardDescription>
              <form
                onSubmit={handleInstructorSearch}
                className="flex gap-2 pt-2"
              >
                <Input
                  placeholder="Search by name or email..."
                  value={instructorSearch}
                  onChange={(e) => setInstructorSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instructors.map((instructor) => (
                  <Card
                    key={instructor._id}
                    className="border shadow-sm"
                  >
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        setExpandedInstructor(
                          expandedInstructor === instructor._id
                            ? null
                            : instructor._id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {instructor.userName}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {instructor.userEmail}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-lg">
                              {instructor.stats.totalCourses}
                            </p>
                            <p className="text-muted-foreground">Courses</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg">
                              {instructor.stats.totalStudents}
                            </p>
                            <p className="text-muted-foreground">Students</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg text-green-600">
                              {formatPrice(instructor.stats.totalRevenue)}
                            </p>
                            <p className="text-muted-foreground">Revenue</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedInstructor === instructor._id && (
                      <CardContent className="border-t pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Courses ({instructor.courses.length})
                        </h4>
                        {instructor.courses.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {instructor.courses.map((course) => (
                                <TableRow key={course._id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {course.image && (
                                        <img
                                          src={course.image}
                                          alt={course.title}
                                          className="h-10 w-16 object-cover rounded"
                                        />
                                      )}
                                      <span className="font-medium">
                                        {course.title}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {formatPrice(course.pricing)}
                                  </TableCell>
                                  <TableCell>
                                    {course.students?.length || 0}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        course.isPublished
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {course.isPublished
                                        ? "Published"
                                        : "Draft"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(course.createdAt)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            No courses created yet
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}

                {instructors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No instructors found
                  </div>
                )}

                {/* Pagination */}
                {instructorsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={instructorsPagination.currentPage === 1}
                      onClick={() =>
                        fetchInstructors(
                          instructorsPagination.currentPage - 1,
                          instructorSearch
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {instructorsPagination.currentPage} of{" "}
                      {instructorsPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        instructorsPagination.currentPage ===
                        instructorsPagination.totalPages
                      }
                      onClick={() =>
                        fetchInstructors(
                          instructorsPagination.currentPage + 1,
                          instructorSearch
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
              <CardDescription>
                View students and the courses they have purchased
              </CardDescription>
              <form onSubmit={handleStudentSearch} className="flex gap-2 pt-2">
                <Input
                  placeholder="Search by name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <Card
                    key={student._id}
                    className="border shadow-sm"
                  >
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        setExpandedStudent(
                          expandedStudent === student._id ? null : student._id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {student.userName}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.userEmail}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-lg">
                              {student.stats.totalCourses}
                            </p>
                            <p className="text-muted-foreground">Courses</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg text-green-600">
                              {formatPrice(student.stats.totalSpent)}
                            </p>
                            <p className="text-muted-foreground">Total Spent</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-sm">
                              {formatDate(student.stats.lastPurchase)}
                            </p>
                            <p className="text-muted-foreground">Last Purchase</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedStudent === student._id && (
                      <CardContent className="border-t pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Purchased Courses ({student.purchasedCourses.length})
                        </h4>
                        {student.purchasedCourses.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Purchase Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {student.purchasedCourses.map((course, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {course.courseImage && (
                                        <img
                                          src={course.courseImage}
                                          alt={course.title}
                                          className="h-10 w-16 object-cover rounded"
                                        />
                                      )}
                                      <span className="font-medium">
                                        {course.title}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{course.instructorName}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(course.dateOfPurchase)}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            No courses purchased yet
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}

                {students.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found
                  </div>
                )}

                {/* Pagination */}
                {studentsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={studentsPagination.currentPage === 1}
                      onClick={() =>
                        fetchStudents(
                          studentsPagination.currentPage - 1,
                          studentSearch
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {studentsPagination.currentPage} of{" "}
                      {studentsPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        studentsPagination.currentPage ===
                        studentsPagination.totalPages
                      }
                      onClick={() =>
                        fetchStudents(
                          studentsPagination.currentPage + 1,
                          studentSearch
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOverview;
