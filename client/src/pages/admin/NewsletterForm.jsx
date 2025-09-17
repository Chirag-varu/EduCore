import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

// This component works for both creating and editing newsletters
const NewsletterForm = () => {
  const { id } = useParams(); // If id exists, we're editing an existing newsletter
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    body: '',
    scheduledDate: null,
    topic: 'general',
    status: 'draft'
  });
  
  // For calendar popover state
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchNewsletter();
    }
  }, [id]);

  const fetchNewsletter = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/newsletter/admin/${id}`);
      const newsletter = response.data.data;
      
      setFormData({
        title: newsletter.title,
        subject: newsletter.subject,
        body: newsletter.body,
        scheduledDate: newsletter.scheduledDate ? new Date(newsletter.scheduledDate) : null,
        topic: newsletter.topic || 'general',
        status: newsletter.status
      });
    } catch (error) {
      console.error('Error fetching newsletter:', error);
      toast({
        title: 'Error',
        description: 'Failed to load newsletter data.',
        variant: 'destructive',
      });
      navigate('/admin/newsletters');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      scheduledDate: date
    }));
    setCalendarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditing) {
        await axiosInstance.put(`/api/v1/newsletter/admin/${id}`, formData);
        toast({
          title: 'Newsletter Updated',
          description: 'The newsletter has been updated successfully.',
        });
      } else {
        await axiosInstance.post('/api/v1/newsletter/admin', formData);
        toast({
          title: 'Newsletter Created',
          description: 'The newsletter has been created successfully.',
        });
      }
      
      navigate('/admin/newsletters');
    } catch (error) {
      console.error('Error saving newsletter:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save newsletter.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    if (!isEditing) {
      toast({
        title: 'Save First',
        description: 'Please save the newsletter before sending.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!confirm('Are you sure you want to send this newsletter now?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await axiosInstance.post(`/api/v1/newsletter/admin/${id}/send`);
      toast({
        title: 'Newsletter Sending',
        description: 'The newsletter is being sent to subscribers.',
      });
      navigate('/admin/newsletters');
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send newsletter.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isEditing ? 'Edit' : 'Create'} Newsletter</h1>
        <p className="text-gray-600 mt-2">
          {isEditing 
            ? 'Update your newsletter content and settings' 
            : 'Create a new newsletter to send to your subscribers'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Newsletter Title</Label>
            <Input 
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter newsletter title"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Internal title for your reference
            </p>
          </div>
          
          <div>
            <Label htmlFor="subject">Email Subject Line</Label>
            <Input 
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter email subject line"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed as the email subject
            </p>
          </div>
          
          <div>
            <Label htmlFor="body">Newsletter Content</Label>
            <Textarea 
              id="body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              placeholder="Enter newsletter content (supports HTML)"
              required
              className="min-h-[300px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              HTML is supported for formatting
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={formData.topic}
                onValueChange={(value) => handleSelectChange('topic', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="courses">Course Updates</SelectItem>
                  <SelectItem value="promotions">Promotions</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Schedule</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledDate ? (
                      format(formData.scheduledDate, "PPP")
                    ) : (
                      <span>Pick a date to schedule</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              {formData.scheduledDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateChange(null)}
                  className="mt-2"
                >
                  Clear schedule
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={loading}
          >
            {isEditing ? 'Update Newsletter' : 'Save Newsletter'}
          </Button>
          
          {isEditing && (
            <Button 
              type="button"
              variant="outline" 
              onClick={handleSendNow}
              disabled={loading || formData.status === 'sent' || formData.status === 'sending'}
            >
              Send Now
            </Button>
          )}
          
          <Button 
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/newsletters')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewsletterForm;