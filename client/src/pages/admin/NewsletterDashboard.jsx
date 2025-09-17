import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import {
  Table,
  TableBody,
  TableCaption,
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

const NewsletterDashboard = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewsletters();
  }, [statusFilter]);

  const fetchNewsletters = async () => {
    setLoading(true);
    try {
      const url = statusFilter 
        ? `/api/v1/newsletter/admin?status=${statusFilter}` 
        : '/api/v1/newsletter/admin';
      
      const response = await axiosInstance.get(url);
      setNewsletters(response.data.data);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load newsletters.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/api/v1/newsletter/admin/${id}`);
      toast({
        title: 'Newsletter Deleted',
        description: 'The newsletter has been deleted successfully.',
      });
      fetchNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete newsletter.',
        variant: 'destructive',
      });
    }
  };

  const handleSend = async (id) => {
    if (!confirm('Are you sure you want to send this newsletter now?')) {
      return;
    }
    
    try {
      await axiosInstance.post(`/api/v1/newsletter/admin/${id}/send`);
      toast({
        title: 'Newsletter Sending',
        description: 'The newsletter is being sent to subscribers.',
      });
      fetchNewsletters();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send newsletter.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'scheduled':
        return 'bg-blue-200 text-blue-800';
      case 'sending':
        return 'bg-yellow-200 text-yellow-800';
      case 'sent':
        return 'bg-green-200 text-green-800';
      case 'failed':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Newsletter Management</h1>
        <Button onClick={() => navigate('/admin/newsletters/create')}>
          Create New Newsletter
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Status:</label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No newsletters found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/admin/newsletters/create')}
          >
            Create Your First Newsletter
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of all newsletters</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Scheduled/Sent</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsletters.map((newsletter) => (
                <TableRow key={newsletter._id}>
                  <TableCell className="font-medium">
                    <Link 
                      to={`/admin/newsletters/${newsletter._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {newsletter.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(newsletter.status)}`}>
                      {newsletter.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(newsletter.createdAt)}</TableCell>
                  <TableCell>
                    {newsletter.status === 'scheduled' ? formatDate(newsletter.scheduledDate) : 
                     newsletter.status === 'sent' ? formatDate(newsletter.sendDate) : 'N/A'}
                  </TableCell>
                  <TableCell>{newsletter.recipientCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/newsletters/${newsletter._id}`)}
                      >
                        Edit
                      </Button>
                      
                      {['draft', 'scheduled'].includes(newsletter.status) && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleSend(newsletter._id)}
                          >
                            Send
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(newsletter._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NewsletterDashboard;