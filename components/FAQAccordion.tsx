"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-blue-600 transition-colors group"
      >
        <span className="text-lg font-bold text-slate-800 group-hover:text-blue-600">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="text-slate-500 leading-relaxed font-medium">{answer}</p>
      </div>
    </div>
  );
}

import { faqItems } from "@/lib/faqData";

export default function FAQAccordion() {
  return (
    <div className="bg-slate-50 rounded-card p-8 md:p-12 border border-slate-100 text-slate-900">
      {faqItems.map((item) => (
        <FAQItem key={item.question} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}

export { faqItems };
