import Link from "next/link";

export default function Explore() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* Page Header */}
      <h1 className="text-5xl font-extrabold text-gray-900">Explore Careers</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl text-center">
        Browse career options, compare opportunities, and gain insights into different professions. 
        Find the path that aligns with your passion and goals.
      </p>

      {/* Career Options */}
      <div className="mt-10 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Featured Careers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CareerCard
            title="Software Engineer"
            link="/career/software-engineer"
            color="bg-blue-600"
            hoverColor="hover:bg-blue-700"
          />
          <CareerCard
            title="Data Scientist"
            link="/career/data-scientist"
            color="bg-green-600"
            hoverColor="hover:bg-green-700"
          />
          <CareerCard
            title="Product Manager"
            link="/career/product-manager"
            color="bg-purple-600"
            hoverColor="hover:bg-purple-700"
          />
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-10">
        <Link
          href="/"
          className="px-6 py-3 text-lg font-medium text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

// Career Card Component
function CareerCard({ title, link, color, hoverColor }) {
  return (
    <Link
      href={link}
      className={`block px-6 py-4 text-lg font-medium text-white rounded-lg shadow-lg transition duration-300 ${color} ${hoverColor}`}
    >
      {title}
    </Link>
  );
}
