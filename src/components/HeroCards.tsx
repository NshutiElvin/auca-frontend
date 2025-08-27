 
import {
  Card,
  CardContent,
   
} from "./ui/card";
 

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Testimonial */}
    

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        

        <CardContent>
      “No more manual clashes. This system made exam planning effortless.”  
    </CardContent>

        
      </Card>

      
    </div>
  );
};
