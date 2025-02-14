export default function Home() {
  return (
    <div className="py-16 text-center">
      {/* Hero Section */}
      <header className="relative h-[450px] flex items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/hero-image.jpg')" }}>
        <h1 className="text-6xl font-extrabold">
          CAREER<span className="text-red-500">US</span>
        </h1>
      </header>

      {/* Feature Section */}
      <section className="max-w-6xl mx-auto py-16 px-6 md:flex items-center">
        {/* Image */}
        <div className="md:w-1/2">
          <img src="/career-search.jpg" alt="Career Search" className="rounded-lg shadow-lg" />
        </div>

        {/* Text */}
        <div className="md:w-1/2 md:pl-10 mt-6 md:mt-0">
          <h2 className="text-4xl font-bold">
            CAREER SEARCH <span className="text-red-500">LIKE A PRO</span>
          </h2>
          <p className="mt-4 text-gray-600">
            Careerus is an innovative career guidance platform designed to help students confidently navigate their career journeys.
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>✅ Explore Tailored Career Paths</li>
            <li>✅ Identify Skill Gaps</li>
            <li>✅ Stay Informed with Job Market Trends</li>
            <li>✅ Get Feedback from Employers</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
