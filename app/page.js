import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-100">
      {/* Hero Section */}
      <header className="relative w-full h-[500px] mt-[-1px]">
        <Image
          src="/hero-image.jpg"
          alt="Careerus Team"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <h1 className="text-7xl font-extrabold text-white tracking-widest uppercase">
            Career<span className="text-red-500">Us</span>
          </h1>
        </div>
      </header>

      {/* Feature Section - Career Search */}
      <section className="max-w-6xl mx-auto py-16 px-6 flex flex-col md:flex-row items-center gap-12">
        {/* Left - Image */}
        <div className="md:w-1/2">
          <Image
            src="/career-search.jpg"
            alt="Career Search"
            width={500}
            height={350}
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* Right - Text */}
        <div className="md:w-1/2 space-y-5">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight tracking-wide">
            CAREER SEARCH <span className="text-red-500">LIKE A PRO</span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Careerus is an innovative career guidance platform designed to help students confidently navigate their career journeys.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              ✅ <span className="ml-2 text-gray-800 text-lg font-medium">Explore Tailored Career Paths</span>
            </li>
            <li className="flex items-center">
              ✅ <span className="ml-2 text-gray-800 text-lg font-medium">Identify Skill Gaps</span>
            </li>
            <li className="flex items-center">
              ✅ <span className="ml-2 text-gray-800 text-lg font-medium">Stay Informed with Job Market Trends</span>
            </li>
            <li className="flex items-center">
              ✅ <span className="ml-2 text-gray-800 text-lg font-medium">Get Feedback from Employers</span>
            </li>
          </ul>

          {/* ✅ Link the "Sign Up" button to /auth/register */}
          <Link href="/auth/register">
            <button className="inline-block mt-6 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition duration-300">
              Sign Up
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
