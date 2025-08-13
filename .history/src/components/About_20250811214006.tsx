import { Statistics } from "./Statistics";
import pilot from "../assets/howitworks.png";


export const About = () => {
  return (
    <section
      id="about"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2>
     <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
      From setup to notification — here’s how AUCA’s exam scheduling system
      simplifies every step of the process.
    </p>
      <div className="bg-muted/50 border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <img
            src={pilot}
            alt=""
            className="w-[300px] object-contain rounded-lg"
          />
          <div className="bg-green-0 flex flex-col justify-between">
            <div className="pb-6">
              
             <p className="text-xl text-muted-foreground mt-4">
              Our automated exam scheduling system was developed to streamline the exam planning process at AUCA University. It ensures students never face overlapping exams, allocates rooms efficiently based on capacity, and provides admins with full control over time slots and schedule exports.
              <br /><br />
              Designed with real university needs in mind, this system brings simplicity, speed, and accuracy to one of the most complex academic tasks.
            </p>
                        </div>

          </div>
        </div>
      </div>
    </section>
  );
};
