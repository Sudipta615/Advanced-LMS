'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Button from '@/components/auth/Button';
import Alert from '@/components/auth/Alert';

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleVerification(token);
    }
  }, [searchParams]);

  const handleVerification = async (token: string) => {
    setIsVerifying(true);
    setError('');

    try {
      await verifyEmail(token);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. The link may be invalid or expired.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {success && (
          <>
            <Alert variant="success">
              <h3 className="font-semibold mb-2">Email Verified Successfully!</h3>
              <p>Your email has been verified. Redirecting to login...</p>
            </Alert>
            <div className="text-center">
              <Button onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </div>
          </>
        )}

        {error && (
          <>
            <Alert variant="error">
              {error}
            </Alert>
            <div className="text-center">
              <Button onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </div>
          </>
        )}

        {!success && !error && !searchParams.get('token') && (
          <Alert variant="warning">
            <p>No verification token found. Please check your email for the verification link.</p>
          </Alert>
        )}
      </div>
    </div>
  );
}
