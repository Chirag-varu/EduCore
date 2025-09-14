import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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

const SubscriberManagement = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/v1/newsletter/admin/subscriptions');
      setSubscribers(response.data.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscribers.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not confirmed';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredSubscribers = subscribers.filter(
    subscriber => 
      subscriber.email.toLowerCase().includes(search.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscriber Management</h1>
        <div className="flex items-center">
          <span className="mr-4 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {subscribers.length} Total Subscribers
          </span>
          <Button onClick={fetchSubscribers}>Refresh</Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {search ? 'No subscribers found matching your search' : 'No subscribers found'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of newsletter subscribers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subscribed On</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber._id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || '-'}</TableCell>
                  <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
                  <TableCell>
                    {subscriber.isConfirmed ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Confirmed
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {subscriber.subscribedTopics?.map((topic) => (
                        <span 
                          key={topic} 
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {subscriber.isActive ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Unsubscribed
                      </span>
                    )}
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

export default SubscriberManagement;