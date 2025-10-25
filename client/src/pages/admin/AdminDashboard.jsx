import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  GraduationCap, 
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    userStats: { total: 0, students: 0, instructors: 0, admins: 0 },
    courseStats: { total: 0, published: 0, pending: 0, rejected: 0 },
    recentUsers: [],
    recentCourses: [],
    pendingModerations: [],
    platformAnalytics: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [usersResponse, coursesResponse, moderationResponse, analyticsResponse] = await Promise.all([
        axiosInstance.get('/api/v1/admin/users?limit=5&sortBy=createdAt&sortOrder=desc'),
        axiosInstance.get('/api/v1/admin/courses?limit=5&sortBy=createdAt&sortOrder=desc'),
        axiosInstance.get('/api/v1/admin/moderation/summary'),
        axiosInstance.get('/api/v1/admin/analytics?timeframe=30')
      ]);

      // Get pending courses for moderation queue
      const pendingCoursesResponse = await axiosInstance.get('/api/v1/admin/courses?limit=5&status=draft&sortBy=createdAt&sortOrder=desc');

      setDashboardData({
        userStats: usersResponse.data.data.stats,
        courseStats: {
          total: moderationResponse.data.data.total,
          published: moderationResponse.data.data.approved,
          pending: moderationResponse.data.data.pending,
          rejected: moderationResponse.data.data.rejected
        },
        recentUsers: usersResponse.data.data.users,
        recentCourses: coursesResponse.data.data.courses,
        pendingModerations: pendingCoursesResponse.data.data.courses,
        platformAnalytics: analyticsResponse.data.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (course) => {
    if (course.moderationStatus === 'approved' && course.isPublished) {
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    } else if (course.moderationStatus === 'approved' && !course.isPublished) {
      return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
    } else if (course.moderationStatus === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Calculate total revenue from analytics
  const totalRevenue = dashboardData.platformAnalytics?.courseEnrollments?.reduce(
    (sum, enrollment) => sum + (enrollment.revenue || 0), 0
  ) || 0;

  // Calculate total enrollments from analytics  
  const totalEnrollments = dashboardData.platformAnalytics?.courseEnrollments?.reduce(
    (sum, enrollment) => sum + (enrollment.enrollments || 0), 0
  ) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform activity and management tools
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.userStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.userStats.students} students, {dashboardData.userStats.instructors} instructors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.courseStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.courseStats.published} published, {dashboardData.courseStats.pending} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Moderation Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Moderation
            </CardTitle>
            <CardDescription>
              {dashboardData.courseStats.pending} courses awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.pendingModerations.length > 0 ? (
                <>
                  {dashboardData.pendingModerations.slice(0, 3).map((course) => (
                    <div key={course._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          by {course.instructorId?.userName} • {formatDate(course.createdAt)}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/courses/${course._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/admin/course-moderation">
                      View All Pending <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No courses pending moderation
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest platform activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Courses Approved</div>
                    <div className="text-sm text-muted-foreground">Last 7 days</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {dashboardData.courseStats.published}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">New Registrations</div>
                    <div className="text-sm text-muted-foreground">Last 7 days</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {dashboardData.recentUsers.length}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">Courses Rejected</div>
                    <div className="text-sm text-muted-foreground">Last 7 days</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-red-600">
                  {dashboardData.courseStats.rejected}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users & Courses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/user-management">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.userEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Courses</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/course-moderation">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          by {course.instructorId?.userName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(course)}</TableCell>
                    <TableCell>{formatDate(course.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/admin/user-management">
                <Users className="h-6 w-6 mb-2" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/admin/course-moderation">
                <BookOpen className="h-6 w-6 mb-2" />
                Course Moderation
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/admin/newsletters">
                <Shield className="h-6 w-6 mb-2" />
                Newsletter Management
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;