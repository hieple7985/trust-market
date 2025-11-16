'use client';

import { Result, Button } from 'antd';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  return (
    <Result
      status="500"
      title="Something Went Wrong"
      subTitle={error.message || 'Sorry, something went wrong.'}
      extra={<Button type="primary" onClick={() => reset()}>Try Again</Button>}
    />
  );
}
