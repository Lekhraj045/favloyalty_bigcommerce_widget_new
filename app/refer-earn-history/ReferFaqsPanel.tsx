"use client";

const FAQS = [
  {
    q: "How long does it take for the referral points to be credited to my account?",
    a: "The time frame for points to be credited can vary. Typically, points are credited once your referred friend successfully signs up and completes their first order.",
  },
  {
    q: "What happens if my friend returns or cancels their order?",
    a: "In the event that your referred friend returns or cancels their order, the referral points may be reversed.",
  },
  {
    q: "How can I track the status of my referred friends and earned points?",
    a: "Once your friend successfully joins through your code and places his first order, you will get notification here and via email.",
  },
];

type ReferFaqsPanelProps = {
  expandedFaq: number | null;
  onExpandedChange: (index: number | null) => void;
};

export function ReferFaqsPanel({
  expandedFaq,
  onExpandedChange,
}: ReferFaqsPanelProps) {
  return (
    <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller space-y-2">
      {FAQS.map((faq, index) => {
        const isOpen = expandedFaq === index;
        return (
          <div
            key={index}
            className="border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => onExpandedChange(isOpen ? null : index)}
              className="w-full px-4 py-3 text-left flex items-center justify-between gap-2"
            >
              <span className="text-sm font-medium text-[#303030]">
                {faq.q}
              </span>
              <span
                className={`shrink-0 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-3 pt-0">
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
