import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';

const NewsletterSubscriptionForm = ({ variant = 'default' }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/api/v1/newsletter/subscribe', {
        email,
        name,
        topics: ['general'] // Default topic
      });
      
      setSuccess(true);
      setEmail('');
      setName('');
      
      toast({
        title: 'Subscribed!',
        description: 'Thank you for subscribing to our newsletter.',
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: 'Subscription Failed',
        description: error.response?.data?.message || 'Failed to subscribe. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Different styling variants
  const variants = {
    default: {
      container: 'max-w-md mx-auto p-6 bg-white rounded-lg shadow-md',
      heading: 'text-2xl font-bold mb-4 text-center',
      description: 'text-gray-600 mb-6 text-center',
      form: 'space-y-4',
    },
    minimal: {
      container: 'max-w-md',
      heading: 'text-xl font-semibold mb-2',
      description: 'text-sm text-gray-600 mb-4',
      form: 'flex flex-col sm:flex-row gap-2',
    },
    footer: {
      container: 'w-full',
      heading: 'text-lg font-medium text-white mb-2',
      description: 'text-gray-300 text-sm mb-4',
      form: 'flex flex-col sm:flex-row gap-2',
    }
  };
  
  const styles = variants[variant] || variants.default;

  if (success && variant === 'minimal') {
    return (
      <div className={styles.container}>
        <p className="text-green-600 font-medium">
          Thanks for subscribing! Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {variant !== 'minimal' && (
        <>
          <h3 className={styles.heading}>Subscribe to Our Newsletter</h3>
          <p className={styles.description}>
            Get the latest updates on new courses, promotions, and educational content.
          </p>
        </>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {variant !== 'minimal' && (
          <Input
            type="text"
            placeholder="Your Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        )}
        
        <Input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={variant === 'minimal' ? "flex-grow" : "w-full"}
          required
        />
        
        <Button 
          type="submit" 
          disabled={loading || !email}
          className={variant === 'minimal' ? "whitespace-nowrap" : "w-full"}
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>

      {success && variant !== 'minimal' && (
        <p className="mt-4 text-green-600 text-center">
          Thank you for subscribing! Please check your email to confirm your subscription.
        </p>
      )}
    </div>
  );
};

export default NewsletterSubscriptionForm;