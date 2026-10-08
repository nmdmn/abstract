import Sketch from "./sketch.js";
import ScrollTimeline from "./scroll.js";

function main() {
  const timeline = new ScrollTimeline();
  try {
    new Sketch("canvas", timeline);
  } catch (error) {
    // The text, navigation, and scroll choreography still work without WebGL.
    document.body.classList.add("webgl-unavailable");
    console.warn("The live sculpture is unavailable. Showing the static artwork instead.", error);
  }
}

document.addEventListener("DOMContentLoaded", main);
