import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import axiosInstance from '../../api/axiosInstance';

const ConfirmSubscription = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/newsletter/confirm/${token}`);
        setStatus('success');
        setMessage('Your subscription has been confirmed successfully!');
      } catch (error) {
        console.error('Error confirming subscription:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to confirm subscription. The link may be invalid or expired.');
      }
    };

    if (token) {
      confirmSubscription();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Newsletter Subscription
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-center text-gray-700">
                Confirming your subscription...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Subscription Confirmed!</h3>
              <p className="mt-1 text-gray-500">{message}</p>
              <div className="mt-6">
                <Link to="/">
                  <Button>Back to Homepage</Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Confirmation Failed</h3>
              <p className="mt-1 text-gray-500">{message}</p>
              <div className="mt-6">
                <Link to="/">
                  <Button>Back to Homepage</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmSubscription;