"use client";

import { useState } from "react";
import Image from "next/image";
import { careerData } from "./data";

export default function CareerResearchPage() {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (categoryName) => {
    setOpenCategory((prev) => (prev === categoryName ? null : categoryName));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Career <span className="text-red-400">Research</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Discover in-depth information about various career paths.
        </p>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {careerData.map((category) => (
          <div
            key={category.category}
            className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105"
          >
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full focus:outline-none"
            >
              <Image
                src={category.image}
                alt={category.category}
                width={600}
                height={400}
                className="object-cover w-full h-48"
              />
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">{category.category}</h2>
              </div>
            </button>

            {openCategory === category.category && (
              <div className="p-6 border-t bg-gray-50">
                <ul className="space-y-3">
                  {category.careers.map((career) => (
                    <li key={career.id}>
                      <a
                        href={`/research/${career.id}`}
                        className="text-blue-600 hover:underline block text-lg"
                      >
                        {career.title}
                      </a>
                      <p className="text-gray-600 text-sm">{career.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
