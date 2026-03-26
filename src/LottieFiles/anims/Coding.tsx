import Lottie from "lottie-react";
import * as codingAnimation from "../jsons/Coding.json";

const Coding = () => {
  // Create a mutable copy of the animation data to avoid React 19 immutability issues
  const animationData = JSON.parse(JSON.stringify(codingAnimation));
  return <Lottie animationData={animationData} loop={true} />;
};

export default Coding;
