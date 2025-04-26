"use client";

import { careerData } from "../data";
import Link from "next/link";

export default function CareerDetail({ params }) {
  const { careerId } = params;

  const category = careerData.find((cat) =>
    cat.careers.some((career) => career.id === careerId)
  );

  const career = category?.careers.find((c) => c.id === careerId);

  if (!career) {
    return (
      <div className="p-10 text-center text-red-600 text-xl font-bold">
        Career not found.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {career.title}
        </h1>
        <p className="text-gray-700 mb-6">{career.description}</p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-red-500">Average Salary:</h2>
          <p className="text-gray-800">{career.salary}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-red-500">Education Required:</h2>
          <p className="text-gray-800">{career.education}</p>
        </div>

        {career.skills && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500">Key Skills:</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {career.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {career.responsibilities && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500">Typical Responsibilities:</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {career.responsibilities.map((res, index) => (
                <li key={index}>{res}</li>
              ))}
            </ul>
          </div>
        )}

        {career.workEnvironment && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500">Work Environment:</h2>
            <p className="text-gray-800">{career.workEnvironment}</p>
          </div>
        )}

        {career.whyPursue && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500">Why Pursue This Career:</h2>
            <p className="text-gray-800">{career.whyPursue}</p>
          </div>
        )}

        <Link
          href="/research"
          className="text-red-600 hover:underline block mt-6"
        >
          ← Back to Career Research
        </Link>
      </div>
    </div>
  );
}
