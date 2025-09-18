import { Card, CardContent } from "./ui/card";

import TextType from "./texttype";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Testimonial */}

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardContent>
          ”
          <TextType
            text={[
              "No more manual clashes. The algorithm ensures conflict-free exam scheduling effortlessly.",
              "Automated room allocation. The system perfectly matches exam size to available venues.",
              "Integrated student data. Scheduling now automatically respects individual student timetables.",
              "Real-time conflict detection. Identify and resolve scheduling issues before they happen.",
              "Seamless invigilator management. Automatically assign and notify staff based on their availability.",
              "Centralized exam materials. All papers and resources are securely stored and accessible in one place.",
              "Instant timetable publishing. Students and faculty receive their schedules the moment they're finalized.",
              "Automated grading system integration. Results flow directly from answer sheets to student records.",
              "Dynamic rescheduling capabilities. Effortlessly manage changes for students with accommodations.",
              "Comprehensive audit trails. Track every change for full transparency and accountability.",
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />
        </CardContent>
        “
      </Card>
    </div>
  );
};
