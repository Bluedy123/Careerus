export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Find Your Perfect Career Path</h1>
      <p className="text-lg text-gray-700 mb-6">
        Explore career options, compare opportunities, and get personalized suggestions
        to help you make informed decisions about your future.
      </p>
      <div className="space-x-4">
        <button className="bg-blue-600 text-white py-2 px-4 rounded-md">Start Exploring</button>
        <button className="bg-green-600 text-white py-2 px-4 rounded-md">Compare Careers →</button>
      </div>
    </div>
  );
}
