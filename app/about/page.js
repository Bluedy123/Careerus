import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          About <span className="text-red-400">CareerUS</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Empowering individuals with career insights, skill recommendations, and data-driven guidance.
        </p>
      </header>

      {/* About Section */}
      <section className="max-w-6xl mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Our Mission</h2>
        <p className="text-lg text-gray-700 mt-4 leading-relaxed">
          CareerUS is designed to help individuals find the best career paths, assess skill gaps, and gain 
          insights into job trends. We provide career recommendations tailored to each user’s strengths and interests.
        </p>
      </section>

      {/* Core Values Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="p-6 bg-gray-200 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800">Innovation</h3>
              <p className="text-gray-700 mt-2">
                We use data to offer personalized career insights and recommendations.
              </p>
            </div>
            <div className="p-6 bg-gray-200 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800">Empowerment</h3>
              <p className="text-gray-700 mt-2">
                Our platform enables users to take control of their career growth and success.
              </p>
            </div>
            <div className="p-6 bg-gray-200 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800">Transparency</h3>
              <p className="text-gray-700 mt-2">
                We provide clear, data-backed insights to help users make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-semibold text-gray-900">Join CareerUS Today</h2>
        <p className="text-lg text-gray-700 mt-4">
          Start exploring your career path with data-driven insights and skill recommendations.
        </p>
        <div className="mt-6">
          <Link href="/auth/register">
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
