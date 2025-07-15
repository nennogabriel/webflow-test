import React from 'react';

export default function Blog() {
  return React.createElement('div', {
    style: { padding: '20px', fontFamily: 'Arial, sans-serif' }
  }, [
    React.createElement('h1', { key: 'title' }, 'Blog Page'),
    React.createElement('p', { key: 'desc1' }, 'This is a React page served by Next.js pages router.'),
    React.createElement('p', { key: 'desc2' }, 'If you can see this, the pages routing is working correctly!')
  ]);
}