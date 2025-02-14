import Link from "next/link";

export default function Help() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          How Can We <span className="text-red-400">Help You?</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Find answers to common questions, or reach out for support.
        </p>
      </header>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold text-gray-900 text-center">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-6">
          <FAQItem question="How do I create an account?" answer="Click on the Sign Up button at the top right and follow the registration steps." />
          <FAQItem question="How does CareerUS recommend careers?" answer="We use AI-driven insights based on your skills, interests, and job market trends." />
          <FAQItem question="Is CareerUS free to use?" answer="Yes! CareerUS provides free career insights, with optional premium features coming soon." />
          <FAQItem question="Can I update my career preferences?" answer="Yes, you can edit your preferences anytime in your profile settings." />
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Need More Help?</h2>
        <p className="text-lg text-gray-700 mt-4">
          If you have any other questions or need assistance, feel free to contact us.
        </p>
        <p className="text-lg text-gray-700 mt-2">Email us at: 
          <a href="mailto:support@careerus.com" className="text-red-500 font-semibold hover:underline"> support@careerus.com</a>
        </p>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-semibold text-gray-900">Explore CareerUS</h2>
        <p className="text-lg text-gray-700 mt-4">
          Start exploring your career path with data-driven insights.
        </p>
        <div className="mt-6">
          <Link href="/">
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition">
              Back to Home
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800">{question}</h3>
      <p className="text-gray-700 mt-2">{answer}</p>
    </div>
  );
}
