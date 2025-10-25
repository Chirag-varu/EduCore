import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Badge,
} from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  XCircle,
  Search,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Trash2
} from 'lucide-react';

const CourseModeration = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    averagePrice: 0
  });
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    recentSubmissions: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    limit: 10
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moderationNote, setModerationNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchModerationSummary();
  }, [filters, pagination.currentPage]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await axiosInstance.get(`/api/v1/admin/courses?${params}`);
      
      if (response.data.success) {
        setCourses(response.data.data.courses);
        setPagination(response.data.data.pagination);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationSummary = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/moderation/summary');
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching moderation summary:', error);
    }
  };

  const handleApproveCourse = async () => {
    try {
      const response = await axiosInstance.put(`/api/v1/admin/courses/${selectedCourse._id}/approve`, {
        adminNote: moderationNote
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Course approved successfully.',
        });
        setShowApprovalDialog(false);
        setModerationNote('');
        setSelectedCourse(null);
        fetchCourses();
        fetchModerationSummary();
      }
    } catch (error) {
      console.error('Error approving course:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve course.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectCourse = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Rejection reason is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axiosInstance.put(`/api/v1/admin/courses/${selectedCourse._id}/reject`, {
        adminNote: moderationNote,
        reason: rejectionReason
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Course rejected successfully.',
        });
        setShowRejectionDialog(false);
        setModerationNote('');
        setRejectionReason('');
        setSelectedCourse(null);
        fetchCourses();
        fetchModerationSummary();
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject course.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/admin/courses/${courseId}`);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Course deleted successfully.',
        });
        fetchCourses();
        fetchModerationSummary();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete course.',
        variant: 'destructive',
      });
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Course Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate course submissions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.recentSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    search: e.target.value
                  }))}
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({
                ...prev,
                status: value
              }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({
                ...prev,
                sortBy: value
              }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="pricing">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>
            {pagination.totalCourses} courses found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading courses...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={course.image || '/placeholder-course.jpg'}
                            alt={course.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.category} • {course.level}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.instructorId?.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {course.instructorId?.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(course.pricing)}</TableCell>
                      <TableCell>{getStatusBadge(course)}</TableCell>
                      <TableCell>{formatDate(course.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCourse(course._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {course.moderationStatus === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setShowApprovalDialog(true);
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setShowRejectionDialog(true);
                                }}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCourse(course._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCourses)} of{' '}
                  {pagination.totalCourses} courses
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1)
                    }))}
                    disabled={pagination.currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({
                      ...prev,
                      currentPage: Math.min(prev.totalPages, prev.currentPage + 1)
                    }))}
                    disabled={pagination.currentPage >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Course</DialogTitle>
            <DialogDescription>
              You are about to approve "{selectedCourse?.title}". The course will be published and available to students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add an optional note for the instructor..."
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveCourse} className="bg-green-600 hover:bg-green-700">
              Approve Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
            <DialogDescription>
              You are about to reject "{selectedCourse?.title}". Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection (required)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
            <Textarea
              placeholder="Additional notes for the instructor..."
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRejectCourse} className="bg-red-600 hover:bg-red-700">
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseModeration;