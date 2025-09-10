import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Is the exam scheduling system free?",
    answer: "Currently, the system is available for AUCA staff and students. For external institutions, a subscription plan is required.",
    value: "item-1",
  },
  {
    question: "How does the system ensure there are no scheduling conflicts?",
    answer:
      "Our AI-powered algorithm guarantees no student is double-booked by cross-referencing all exam times and student schedules before finalizing the timetable.",
    value: "item-2",
  },
  {
    question: "Can I manually adjust the exam schedule after it's generated?",
    answer:
      "Yes. While the system automatically generates the timetable, administrators can manually adjust exam timings or room allocations when needed.",
    value: "item-3",
  },
  {
    question: "How are students notified of their exam schedule?",
    answer: "Students receive automated email and SMS notifications once the final exam schedule is published.",
    value: "item-4",
  },
  {
    question: "Can the system handle multiple exam rooms?",
    answer:
      "Yes. The system is designed to allocate exams to available rooms and prevent overlap. It supports multiple rooms for each exam.",
    value: "item-5",
  },
];


export const FAQ = () => {
  return (
    <section id="faq" className="container py-10">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion type="single" collapsible className="w-full AccordionRoot">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left no-underline hover:no-underline">{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};

