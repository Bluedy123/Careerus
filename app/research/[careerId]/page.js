// File: /app/research/[careerId]/page.js

"use client";

import { useParams } from "next/navigation";
import { careerData } from "../data";
import Link from "next/link";

export default function CareerDetailPage() {
  const { careerId } = useParams();

  const career = careerData
    .flatMap(c => c.careers)
    .find(career => career.id === careerId);

  if (!career) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Career Not Found</h2>
        <Link href="/research" className="text-red-500 underline">
          ← Back to Career Research
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">{career.title}</h1>
      <p className="text-gray-700 mb-6">{career.description}</p>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Average Salary:</h2>
          <p className="text-gray-700 mt-2">{career.salary}</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Education Required:</h2>
          <p className="text-gray-700 mt-2">{career.education}</p>
        </div>

        <div className="mt-8">
          <Link href="/research" className="text-red-500 underline text-lg">
            ← Back to Career Research
          </Link>
        </div>
      </div>
    </div>
  );
}
