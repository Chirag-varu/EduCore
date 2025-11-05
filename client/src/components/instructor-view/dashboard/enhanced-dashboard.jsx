import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Star,
  Clock,
  CheckCircle,
  BarChart3,
  Eye
} from "lucide-react";
import { fetchInstructorCourseStudentDetailsService } from "@/services";
import axiosInstance from "@/api/axiosInstance";
import { useAuth } from "@/context/auth-context";

// Simple chart component for visualization
const SimpleChart = ({ data, title, color = "#3b82f6" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="flex items-end justify-between h-24 gap-1">
        {data.slice(-7).map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1 flex-1">
            <div 
              className="w-full rounded-t"
              style={{ 
                backgroundColor: color,
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function EnhancedInstructorDashboard({ listOfCourses = [] }) {
  const { auth } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [loadingStates, setLoadingStates] = useState({
    analytics: true,
    stats: true,
    initial: true
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProfit: 0,
    studentList: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoadingStates(prev => ({ ...prev, initial: true, analytics: true, stats: true }));
      setError(null);
      
      // Prefer a normalized id regardless of where it comes from
      const instructorId = auth?.user?.userId || auth?.user?._id || auth?.user?.id;

      if (instructorId) {
        console.log('Auth user found, fetching analytics:', auth.user);
        await Promise.all([
          fetchAnalytics(),
          calculateBasicStats()
        ]);
      } else {
        console.log('No auth user found, only calculating basic stats');
        setLoadingStates(prev => ({ ...prev, analytics: false }));
        await calculateBasicStats();
      }
      
      setLoadingStates(prev => ({ ...prev, initial: false }));
    };

    initializeDashboard();
  }, [auth?.user?.userId, auth?.user?._id, selectedTimeframe, listOfCourses]);

  const fetchAnalytics = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, analytics: true }));
      setError(null);
      const instructorId = auth?.user?.userId || auth?.user?._id || auth?.user?.id;
      console.log('Fetching analytics for user:', instructorId);
      // axiosInstance already has baseURL /api/v1; avoid duplicating it in the path
      const response = await axiosInstance.get(
        `/instructor/course/analytics/${instructorId}?timeframe=${selectedTimeframe}`
      );
      
      console.log('Analytics response:', response.data);
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        console.error('Analytics API returned error:', response.data.message);
        setAnalytics(null);
        setError('Unable to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      console.error('Error details:', error.response?.data || error.message);
      setAnalytics(null);
      setError('Failed to fetch analytics. Please check your connection.');
    } finally {
      setLoadingStates(prev => ({ ...prev, analytics: false }));
    }
  };

  const calculateBasicStats = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, stats: true }));
      let totalStudents = 0;
      let totalProfit = 0;
      let studentList = [];

      for (const course of listOfCourses) {
        const studentCount = course.enrolledStudents?.length || 0;
        totalStudents += studentCount;
        totalProfit += (course.price || 0) * studentCount;

        if (studentCount > 0) {
          const students = await Promise.all(
            course.enrolledStudents.map(async (studentID) => {
              try {
                const studentDetails =
                  await fetchInstructorCourseStudentDetailsService(studentID);

                return {
                  courseTitle: course.title,
                  studentName: studentDetails?.data?.userName || "N/A",
                  studentEmail: studentDetails?.data?.userEmail || "N/A",
                };
              } catch (error) {
                console.error(`Error fetching student ${studentID}:`, error);
                return {
                  courseTitle: course.title,
                  studentName: "N/A",
                  studentEmail: "N/A",
                };
              }
            })
          );
          studentList.push(...students);
        }
      }

      setStats({ totalStudents, totalProfit, studentList });
    } catch (error) {
      console.error('Error calculating basic stats:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare chart data
  const revenueChartData = analytics?.enrollmentTrend?.map(item => ({
    label: formatDate(item._id),
    value: item.revenue || 0
  })) || [];

  const enrollmentChartData = analytics?.enrollmentTrend?.map(item => ({
    label: formatDate(item._id),
    value: item.enrollments || 0
  })) || [];

  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: analytics?.totals?.totalStudents || stats.totalStudents,
      change: "+12% from last month",
      color: "text-blue-600"
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: formatCurrency(analytics?.totals?.totalRevenue || stats.totalProfit),
      change: "+8% from last month",
      color: "text-green-600"
    },
    {
      icon: BookOpen,
      label: "Active Courses",
      value: analytics?.totals?.activeCourses || listOfCourses.filter(c => c.isPublished).length,
      change: `${listOfCourses.length} total courses`,
      color: "text-purple-600"
    },
    {
      icon: TrendingUp,
      label: "Avg. Completion Rate",
      value: `${analytics?.totals?.averageCompletionRate || 0}%`,
      change: "Course completion average",
      color: "text-orange-600"
    },
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-3">
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loadingStates.initial) {
    return <LoadingSkeleton />;
  }

  // Show fallback if no analytics data but not loading
  if (!loadingStates.analytics && !analytics && (auth?.user?.userId || auth?.user?._id || auth?.user?.id)) {
    return (
      <div className="space-y-6">
        {/* Header with timeframe selector */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
            <p className="text-muted-foreground">Overview of your teaching performance</p>
          </div>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe} disabled={loadingStates.analytics}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={fetchAnalytics} variant="outline" disabled={loadingStates.analytics}>
                {loadingStates.analytics ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </div>
        )}

        {!error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">Unable to load analytics data</div>
              <Button onClick={fetchAnalytics} variant="outline" disabled={loadingStates.analytics}>
                {loadingStates.analytics ? "Loading..." : "Retry"}
              </Button>
            </div>
          </div>
        )}

        {/* Show basic stats even if analytics fails */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStates.stats ? (
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Across all courses</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStates.stats ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalProfit)}</div>
                  <p className="text-xs text-muted-foreground">From course sales</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listOfCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                {listOfCourses.filter(c => c.isPublished).length} published
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show fallback if no user authenticated
  if (!loadingStates.initial && !(auth?.user?.userId || auth?.user?._id || auth?.user?.id)) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-muted-foreground">Please log in to view analytics</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with timeframe selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
          <p className="text-muted-foreground">Overview of your teaching performance</p>
        </div>
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              {loadingStates.analytics || loadingStates.stats ? (
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.change}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStates.analytics ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart...</div>
              </div>
            ) : (
              <SimpleChart 
                data={revenueChartData} 
                title="Daily Revenue" 
                color="#10b981"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enrollment Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStates.analytics ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart...</div>
              </div>
            ) : (
              <SimpleChart 
                data={enrollmentChartData} 
                title="Daily Enrollments" 
                color="#3b82f6"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Performing Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStates.analytics ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 w-12 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.topCourses?.slice(0, 5).map((course, index) => (
                <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {course.enrollments} enrollments • {course.completionRate}% completion
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(course.revenue)}</div>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-6 text-muted-foreground">
                  No course data available
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student List Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Students
          </CardTitle>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStates.stats ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {stats.studentList.slice(0, 10).map((student, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {student.studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.studentEmail}
                        </TableCell>
                        <TableCell>{student.courseTitle}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.studentList.length === 0 && !loadingStates.stats && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No students enrolled yet
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedInstructorDashboard;