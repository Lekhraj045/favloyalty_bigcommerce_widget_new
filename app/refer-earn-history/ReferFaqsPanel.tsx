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
  {
    q: "What is Multi-Channel Loyalty?",
    a: "Multi-channel loyalty allows you to manage separate loyalty programs for different channels, each with its own customers, rewards, and settings.",
  },
  {
    q: "Are customers shared across channels?",
    a: "No, customers are channel-specific. A customer in one channel will not be automatically available in another channel.",
  },
  {
    q: "Do loyalty points sync across channels?",
    a: "No, points are maintained separately for each channel and cannot be shared or transferred.",
  },
  {
    q: "Can the same customer join multiple channels?",
    a: "Yes, but they will be treated as separate accounts in each channel.",
  },
  {
    q: "Can I run different loyalty programs on each channel?",
    html: (
      <div>
        <p>Yes, each channel can have its own:</p>
        <ul className="list-disc list-inside">
          <li>Points system</li>
          <li>Rewards</li>
          <li>Campaigns</li>
          <li>Rules</li>
        </ul>
      </div>
    ),
  },
  {
    q: "Are coupons and rewards shared across channels?",
    a: "No, rewards and coupons are restricted to the channel they are created in",
  },
  {
    q: "Does each channel have its own widget?",
    a: "Yes, each channel has its own widget configuration and display settings.",
  },
  {
    q: "How is customer data managed?",
    a: "Customer data is stored separately per channel to ensure independent tracking and segmentation.",
  },
  {
    q: "Can I customize widget design per channel?",
    a: "Yes, each channel can have a completely different widget design and behavior.",
  },
  {
    q: "Is analytics separated by channel?",
    a: "Yes, analytics, reports, and performance metrics are tracked individually for each channel.",
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
                  {faq.html ? faq.html : faq.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
