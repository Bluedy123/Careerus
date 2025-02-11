import Link from 'next/link';

export default function Explore() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Explore Page</h1>
      <p>Welcome to the Explore section! Here you can browse various career insights.</p>

      <div>
        <h2>Featured Careers</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link href="/career/software-engineer">Software Engineer</Link></li>
          <li><Link href="/career/data-scientist">Data Scientist</Link></li>
          <li><Link href="/career/product-manager">Product Manager</Link></li>
        </ul>
      </div>

      <br />

      <Link href="/">← Back to Home</Link>
    </div>
  );
}
