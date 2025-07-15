export default function Blog() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Blog Page</h1>
      <p>This is a React page served by Next.js pages router.</p>
      <p>If you can see this, the pages routing is working correctly!</p>
      <ul>
        <li>This page: <code>/blog</code> (React page)</li>
        <li>Home page: <code>/</code> (Static HTML)</li>
        <li>Mica page: <code>/mica</code> (Static HTML)</li>
      </ul>
    </div>
  );
} 